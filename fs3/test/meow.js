const {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    CompletionItemKind,
    DiagnosticSeverity,
    InsertTextFormat
} = require("vscode-languageserver/node");
const { TextDocument } = require("vscode-languageserver-textdocument");

const keywordDocumentation = require("../resources/keyword-docs.json");
const methodDocumentation = require("../resources/method-docs.json");
const { FroggyScript3, Keyword, Method } = require("../resources/interpreter.js");

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

// process.on("uncaughtException", (err) => {
//   console.error("Uncaught Exception:", err);
// });

// process.on("unhandledRejection", (reason) => {
//   console.error("Unhandled Rejection:", reason);
// });

connection.onInitialize(() => ({
    capabilities: {
        textDocumentSync: documents.syncKind,
        hoverProvider: true,
        signatureHelpProvider: {
            triggerCharacters: [],
            retriggerCharacters: []
        },
        completionProvider: {
            triggerCharacters: ['>'], // 👈 trigger IntelliSense when > is typed
        },
    }
}));

const diagnosticsMap = new Map();

const variables = {
    "false": { type: "number", mutable: false },
    "true": { type: "number", mutable: false },
    "MAX_LOOP_ITERATIONS": { type: "number", mutable: false },
};

const tempVariables = {};

const functions = {}

function clearVariables() {
    for (let key in variables) {
        delete variables[key];
    }

    for (let key in tempVariables) {
        delete tempVariables[key];
    }

    variables["false"] = { type: "number", mutable: false };
    variables["true"] = { type: "number", mutable: false };
    variables["MAX_LOOP_ITERATIONS"] = { type: "number", mutable: false };
}

function clearFunctions() {
    for (let key in functions) {
        delete functions[key];
    }
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

console.log("FS3 language server initialized");

function _vscode_tokenize(lines) {
    let checker = new FS3Checker();
    const tokenized = checker.tokenize(lines);

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
                        "Opening bracket expected",
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
            unclosed.value = "["
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

function collapseArrays(tokens) {
    let result = [];
    for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];

        // start of an array
        if (token.type === "array_start") {
            let arrayTokens = [];
            i++; // move past '['

            while (i < tokens.length && tokens[i].type !== "array_end") {
                if (tokens[i].type !== "comma") {
                    arrayTokens.push(tokens[i]);
                }
                i++;
            }

            // safety: ensure it ended correctly
            if (i >= tokens.length || tokens[i].type !== "array_end") {
                throw new Error("SyntaxError: missing array_end token");
            }

            result.push({
                type: "array",
                value: arrayTokens
            });
        } 
        else {
            result.push(token);
        }
    }

    return result;
}

// --- Hover support ---
connection.onSignatureHelp((params) => {
    const document = documents.get(params.textDocument.uri);
    if (!document) return null;

    const offset = document.offsetAt(params.position);
    const text = document.getText();
    const before = text.slice(0, offset);

    const methodName = findActiveMethod(before);
    if (!methodName) return null;

    const signatures = methodDocumentation[methodName];
    if (!signatures) return null;

    function getActiveParameter(signature) {
        let depth = 0;
        let paramIndex = 0;
        for (let i = before.length - 1; i >= 0; i--) {
            const ch = before[i];
            if (ch === ')') depth++;
            else if (ch === '(') {
                if (depth === 0) break;
                depth--;
            } else if (ch === ',' && depth === 0) {
                paramIndex++;
            }
        }
        return Math.min(paramIndex, signature.parameters.length - 1);
    }
        

    return {
        signatures,
        activeSignature: 0, // or compute based on overload if needed
        activeParameter: getActiveParameter(signatures[0])
    };
});

// bro. ITS BROKEN. WHY.
connection.onHover((params) => {
    const { position, textDocument } = params;
    const document = documents.get(textDocument.uri);
    if (!document) return null;

    const cursor_line = position.line;
    const cursor_pos = position.character;
    const lines = document.getText().split("\n");

    let checker = new FroggyScript3({checkerMode: true, checkerModeFunction: (line) => {
        console.log(line);
    }});

    let tokens;

    try {
        tokens = checker.tokenize(lines);
    } catch (error) {
        return null;
    }

    let tokenLine = tokens[cursor_line];

    // find the token at the cursor position
    let token = null;
    for (let tok of tokenLine) {
        if (tok.col <= cursor_pos && (tok.col + (tok.value?.length || 1)) >= cursor_pos) {
            token = tok;
            break;
        }
    }

    if (!token) return null;

    try {
        if(token.type == "variable"){
            switch(token.value){
                case "__loop_index__": {
                    return {
                        contents: {
                            kind: "markdown",
                            value: "`__loop_index__` is a special variable available inside loops that represents the current iteration index (starting from 0)."
                        }
                    };
                }
                case "__item__": {
                    return {
                        contents: {
                            kind: "markdown",
                            value: "`__item__` is a special variable available inside loops that represents the current item in the array being iterated over."
                        }
                    };
                }
            }
        }

        if(token.type === "keyword" && keywordDocumentation[token.value] && Keyword.table[token.value]) {
            const doc = keywordDocumentation[token.value];

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

function findActiveMethod(before) { 
    let depth = 0; 
    let lastMethod = null; 
    for (let i = 0; i < before.length; i++) { 
        const ch = before[i]; 
        if (ch === '(') depth++; 
        else if (ch === ')') depth = Math.max(0, depth - 1);
        else if (ch === '>' && depth === 0) { 
            const rest = before.slice(i + 1); 
            const m = rest.match(/^([a-zA-Z_]\w*)/); 
            if (m) lastMethod = m[1]; 
        } 
    } 
    return lastMethod; 
}

let lastCursor = { uri: null, position: null };

connection.onNotification('custom/cursorPosition', (params) => {
    lastCursor.uri = params.uri;
    lastCursor.position = params.position; // { line, character }
});

connection.onCompletion((params) => {
    try {
        const document = documents.get(params.textDocument.uri);
        if (!document) return [];

        const text = document.getText();
        const offset = document.offsetAt(params.position);
        const before = text.slice(0, offset);

        // Only trigger on a single ">" (not ">>")
        if (!before.endsWith('>') || before.endsWith('>>')) return [];

        // Optionally detect type (if you have that logic)
        // For now, just offer all methods
        const allMethods = Object.entries(methodDocumentation)
            .flatMap(([methodName, entries]) => {
                // Ensure it's always an array
                const list = Array.isArray(entries) ? entries : [entries];
                return list.map((entry) => ({
                    label: methodName,
                    kind: CompletionItemKind.Method,
                    detail: entry.label,
                    documentation: {
                        kind: 'markdown',
                        value: `**${entry.label}**\n\n${entry.documentation}`
                    },
                    insertText: entry.parameters?.length
                        ? `${methodName}($0)`
                        : methodName,
                    insertTextFormat: InsertTextFormat.Snippet,
                }));
            });

        return allMethods;

    } catch (err) {
        console.error('Completion error:', err);
        return [];
    }
});

// signature hints
// documents.onDidChangeContent((change) => {
//     try {
//         const document = change.document;
//         const offset = document.offsetAt(lastCursor.position);

//         const text = document.getText();
//         const before = text.slice(0, offset);
//         const activeMethod = findActiveMethod(before);

//         if(before.endsWith(")") || before.endsWith(">")) {
//             return;
//         }

//         if(activeMethod) {
//             connection.sendNotification('custom/triggerSignatureHelp');
//         }
//     } catch (error) {
//         console.error(error);
//     }
// })

// --- Live diagnostics ---
documents.onDidChangeContent(async (change) => {
    const uri = change.document.uri;
    const text = change.document.getText();

    const lines = text.split('\n');

    let checker = new FroggyScript3({checkerMode: true});

    clearDiagnostics(uri);


    await checker.interpret(lines, "<file>", []).catch(error => {
        let line = error.line;

        let startCol = 0;
        let endCol = 1;

        if(error.tok == undefined) {
            console.log("Malformed error object:", error);
        } else {
            startCol = error.tok.col;

            let length = error.tok.name?.length || error.tok.value?.length

            if(error.tok.variableName){
                length = error.tok.variableName.length;
            }

            if(error.tok.type == "string" && error.tok.variableName == undefined){
                length += 2;
            }

            endCol = startCol + length;
        }

        sendErrorDiagnostic(
            uri,
            line,
            startCol,
            endCol,
            `${error.type}: ${error.message}` || "Unknown error"
        );
    })

});

documents.listen(connection);
connection.listen();
