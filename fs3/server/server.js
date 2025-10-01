const {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    CompletionItemKind,
    DiagnosticSeverity
} = require("vscode-languageserver/node");
const { TextDocument } = require("vscode-languageserver-textdocument");

const { FS3Checker, Keyword, FS3Error, imports } = require("../resources/checker.js");

const keywordDocumentation = require("../resources/keyword-docs.json");

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

connection.onInitialize(() => ({
    capabilities: {
        textDocumentSync: documents.syncKind,
        completionProvider: { resolveProvider: false },
        hoverProvider: true
    }
}));

const diagnosticsMap = new Map();
const variables = {
    "false": { type: "number", mutable: false },
    "true": { type: "number", mutable: false },
    "MAX_LOOP_ITERATIONS": { type: "number", mutable: false }
};
const functions = {}

function clearVariables() {
    for (let key in variables) {
        delete variables[key];
    }

    variables["false"] = { type: "number", mutable: false };
    variables["true"] = { type: "number", mutable: false };
    variables["MAX_LOOP_ITERATIONS"] = { type: "number", mutable: false };
}

function sendErrorDiagnostic(uri, line, startCol, endCol, message) {
    const diagnostic = {
        severity: DiagnosticSeverity.Error,
        range: {
            start: { line, character: startCol },
            end: { line, character: endCol }
        },
        message,
        source: 'FS3'
    };

    diagnosticsMap.set(uri, [diagnostic]);
    connection.sendDiagnostics({ uri, diagnostics: [diagnostic] });
}

function clearDiagnostics(uri) {
    diagnosticsMap.set(uri, []);
    connection.sendDiagnostics({ uri, diagnostics: [] });
}

const fs3Checker = new FS3Checker();

console.log("FS3 language server initialized");

function _vscode_tokenize(lines) {
    const tokenized = fs3Checker.tokenize(lines);

    // group array tokens into single tokens
    tokenized.forEach((line, lineIndex) => {
        let newLine = [];
        let arrayStack = [];
        line.forEach((token) => {
            const val = token?.value ?? "";
            if (val === "[") {
                arrayStack.push({
                    type: "array",
                    value: [],
                    line: token.line ?? lineIndex,
                    col: token.col ?? 0,
                    endCol: null
                });
            } else if (val === "]") {
                if (arrayStack.length === 0) {
                    // stray ], throw error
                    throw new FS3Error(
                        "SyntaxError",
                        "Stray closing bracket with no matching opening bracket",
                        token.line,
                        token.col,
                        token
                    );
                }
                const finished = arrayStack.pop();
                finished.endCol = (token.col ?? finished.col) + (val.length || 1);
                if (arrayStack.length > 0) {
                    arrayStack[arrayStack.length - 1].value.push(finished);
                } else {
                    newLine.push(finished);
                }
            } else {
                if (arrayStack.length > 0) {
                    arrayStack[arrayStack.length - 1].value.push(token);
                } else {
                    newLine.push(token);
                }
            }
        });

        // any unclosed [ left over, throw error
        while (arrayStack.length > 0) {
            const unclosed = arrayStack.shift();
            throw new FS3Error(
                "SyntaxError",
                "Unclosed array",
                unclosed.line,
                unclosed.col,
                unclosed
            );
        }
        tokenized[lineIndex] = newLine;
    });
    return tokenized;
}



// --- Hover support ---
connection.onHover((params) => {
    const { position, textDocument } = params;
    const document = documents.get(textDocument.uri);
    if (!document) return null;

    const cursor_line = position.line;
    const cursor_pos = position.character;
    const lines = document.getText().split("\n");

    try {
        const tokenized = _vscode_tokenize(lines);

        // group array tokens into single tokens

        // if theres any array with an endCol of null, it means it was never closed
        for (let i = 0; i < tokenized.length; i++) {
            for (let j = 0; j < tokenized[i].length; j++) {
                const token = tokenized[i][j];
                if (token.type === "array" && token.endCol === null) {
                    throw new FS3Error(
                        "SyntaxError",
                        "Unclosed array literal",
                        token.line,
                        token.col,
                        token
                    );
                }
            }
        }

        const lineTokens = tokenized[cursor_line];

        if (!lineTokens) return null;

        // Find token containing cursor
        const hoveredToken = lineTokens.find(token => {
            const startCol = token.col;
            const endCol = token?.endCol ? token.endCol : startCol + (token.value?.length || 1);
            return cursor_pos >= startCol && cursor_pos < endCol;
        });

        if (!hoveredToken) return null;



        if(hoveredToken.type == "variable" && hoveredToken.value == "__loop_index__") {
            return {
                contents: {
                    kind: "markdown",
                    value: "`__loop_index__` is a special variable available inside loops that represents the current iteration index (starting from 0)."
                }
            };
        }

        if(hoveredToken.type == "variable" || hoveredToken.type == "variable_reference") {
            let trueType = "variable";

            if(hoveredToken.value.startsWith("$")) {
                trueType = "variable_reference";
            }

            if(trueType == "variable"){
                if(variables[hoveredToken.value]) {
                    const varInfo = variables[hoveredToken.value];
                    let type = varInfo.type;

                    return {
                        contents: {
                            kind: "markdown",
                            value: "```froggytypeannotation\n" + 
                            (varInfo.mutable ? "mut " : "const ") + 
                            hoveredToken.value + 
                            "<" + type + ">\n```"
                        }
                    };
                }
            } else {
                const varName = hoveredToken.value.slice(1); // remove the $ at the start
                if(variables[varName]) {
                    const varInfo = variables[varName];
                    let type = varInfo.type;

                    return {
                        contents: {
                            kind: "markdown",
                            value: "```froggytypeannotation\n" +
                            (varInfo.mutable ? "mut " : "const ") +
                            "ref " + varName +
                            "<" + type + ">\n```"
                        }
                    };
                }
            }
        }

        if(hoveredToken.type === "keyword" && keywordDocumentation[hoveredToken.value] && Keyword.table[hoveredToken.value]) {
            const doc = keywordDocumentation[hoveredToken.value];

            return {
                contents: {
                    kind: "markdown",
                    value: doc.description + "\n\n" +
                    "```txt\n" +
                    doc.usage + "\n\n\n```\n-----\n```\n\n" + 
                    (Array.isArray(doc.example) ? doc.example.join("\n") : doc.example) +
                    "\n\n```"
                }
            };
        }

    } catch (error) {
        console.error(error);
        return null;
    }
});

/*
todo:
    make variables, functions, etc actually get stored
    be able to check if a variable/function actually exists or not
    when hovered over variables, show their type

    variable annotation:
    var_name<type>
    const: var_name<type>

    const in a deep blue
    <type> in a light blue

    variable reference annotation:
    $var_name<type>
    const $var_name<type>

    $ in a light green
    <type> in a light blue
    const in a deep blue

    non-parameterized function type annotation:
    @function_name

    parameterized function type annotation:
    @function_name [type, type]

*/

// --- Live diagnostics ---
documents.onDidChangeContent(async (change) => {
    clearVariables();
    const uri = change.document.uri;
    const text = change.document.getText();
    const lines = text.split('\n');

    try {
        // Try parsing or tokenizing FS3 code
        _vscode_tokenize(lines);

        const results = fs3Checker._vscode_process(lines);

        results.forEach(item => {
            const firstKeyword = item[0];
            if (!Keyword.table[firstKeyword.value]) {
                throw new FS3Error(
                    "ReferenceError",
                    `Unknown keyword [${firstKeyword.value}]`,
                    item[0].line,
                    item[0].col,
                    item[0]
                );
            } else if (firstKeyword.type === "keyword" && firstKeyword.value === "import") {
                const moduleName = item[1]?.value;
                
                if(imports[moduleName] === undefined) {
                    //console.log(item[1])
                    throw new FS3Error(
                        "ReferenceError",
                        `Import [${moduleName}] does not exist`,
                        item[1]?.line,
                        item[1]?.col + 1,
                        item[1]
                    );
                } else {
                    imports[moduleName]();
                }
            }  else if (firstKeyword.type === "keyword" && (firstKeyword.value === "var" || firstKeyword.value === "cvar")) {
                let variable = item[1];

                if(item.length < 4) {
                    // get the entire length of the line

                    throw new FS3Error(
                        "SyntaxError",
                        `Invalid variable declaration`,
                        firstKeyword.line,
                        firstKeyword.col,
                        firstKeyword
                    );
                }

                    function resolveVariable(token) {
                        if (!token) return null;

                        if (token.type === "variable") {
                            const result = variables[token.value];
                            if (!result) return null; // undefined variable
                            // If the result itself is a variable, resolve recursively
                            if (result.type === "variable") {
                                return resolveVariable({ value: result.value, type: result.type });
                            }
                            return result;
                        }

                        // If it’s not a variable, just return it
                        return token;
                    }
            

                if(variables[variable.value]) {
                    throw new FS3Error(
                        "ReferenceError",
                        `Variable [${variable.value}] is already defined`,
                        variable.line,
                        variable.col,
                        variable
                    );
                } else {
                    let resolved = resolveVariable(item[3])
                    let type = resolved.type;

                    if(type.includes("array_")) type = "array";
                    variables[variable.value] = {
                        type: type,
                        mutable: firstKeyword.value === "var"
                    };
                }
            }
        });

        // go through every variable and see if its in the variables object
        results.forEach(item => {
            item.forEach(token => {
                if(token.type === "variable") {
                    if(!variables[token.value]) {
                        throw new FS3Error(
                            "ReferenceError",
                            `Variable [${token.value}] is not defined`,
                            token.line,
                            token.col,
                            token
                        );
                    }
                }
            });
        });

        // If no error → clear previous diagnostics
        clearDiagnostics(uri);

    } catch (error) {
        const linesText = text.split("\n");
        const lineText = linesText[error.line || 0] || '';
        const tokenValue = error.token?.value || '';

        // Compute end column dynamically
        let startCol = error.col;
        let endCol = startCol + tokenValue.length

        sendErrorDiagnostic(
            uri,
            error.line || 0,
            startCol,
            endCol,
            `${error.type}: ${error.message}` || "Unknown error"
        );

        //clearVariables()

    }
});

documents.listen(connection);
connection.listen();
