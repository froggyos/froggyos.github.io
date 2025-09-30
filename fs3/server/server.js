const {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    CompletionItemKind,
    DiagnosticSeverity
} = require("vscode-languageserver/node");
const { TextDocument } = require("vscode-languageserver-textdocument");

const { FroggyScript3, Keyword, FS3Error, imports } = require("../resources/interpreter.js");

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

const fs3 = new FroggyScript3();

console.log("FS3 language server initialized");

// --- Hover support ---
connection.onHover((params) => {
    const { position, textDocument } = params;
    const document = documents.get(textDocument.uri);
    if (!document) return null;

    const cursor_line = position.line;
    const cursor_pos = position.character;
    const lines = document.getText().split("\n");

    try {
        const tokenized = fs3.tokenize(lines);
        const lineTokens = tokenized[cursor_line];
        if (!lineTokens) return null;

        // Find token containing cursor
        const hoveredToken = lineTokens.find(token => {
            const startCol = token.col;
            const endCol = startCol + (token.value?.length || 1);
            return cursor_pos >= startCol && cursor_pos < endCol;
        });

        if (!hoveredToken) return null;

        return {
            contents: {
                kind: "markdown",
                value: `Token: \`${hoveredToken.value}\` (type: ${hoveredToken.type})`
            }
        };

    } catch (error) {
        console.error(error);
        return null;
    }
});

/*
todo:
    make variables, functions, etc actually get stored
    be able to check if a variable/function actually exists or not
*/

// --- Live diagnostics ---
documents.onDidChangeContent(async (change) => {
    const uri = change.document.uri;
    const text = change.document.getText();
    const lines = text.split('\n');

    try {
        // Try parsing or tokenizing FS3 code
        fs3.tokenize(lines);

        const results = fs3._vscode_process(lines);

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
            }
        });

        // If no error → clear previous diagnostics
        clearDiagnostics(uri);

    } catch (error) {
        const linesText = text.split("\n");
        const lineText = linesText[error.line || 0] || '';
        const tokenValue = error.token?.value || '';

        console.log(error);

        // Compute end column dynamically
        let startCol = error.col;
        let endCol = startCol + tokenValue.length

        sendErrorDiagnostic(
            uri,
            error.line || 0,
            startCol,
            endCol,
            error.message || "Unknown error"
        );
    }
});

documents.listen(connection);
connection.listen();
