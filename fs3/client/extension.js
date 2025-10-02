const path = require("path");
const vscode = require("vscode");
const { LanguageClient, TransportKind } = require("vscode-languageclient/node");

function activate(context) {
    // get document text from the lsp
    // -- start language server as before --
    let serverModule = context.asAbsolutePath(path.join("server", "server.js"));
    let serverOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: { execArgv: ["--nolazy", "--inspect=6009"] } }
    };
    let clientOptions = { documentSelector: [{ scheme: "file", language: "froggyscript3" }] };
    client = new LanguageClient("fs3LanguageServer", "FS3 Language Server", serverOptions, clientOptions);


    // command to open the page externally (uses the actual port)
    const disposable = vscode.commands.registerCommand('froggyscript3.runFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if(!editor) {
            vscode.window.showErrorMessage("No active editor found.");
            return;
        }

        let filePath = editor.document.uri.fsPath;

        // output to terminal
        let terminal = vscode.window.terminals.find(t => t.name === "FroggyScript3");
        if(!terminal) terminal = vscode.window.createTerminal("FroggyScript3");

        terminal.show();

        terminal.sendText(`node "${context.extensionPath}/resources/runner.js" "${filePath}"`);
    });
    context.subscriptions.push(disposable);

    // start LSP client
    client.start();
}

// on document change


function deactivate() {
    if (client) client.stop();
    if (server) server.close();
}

module.exports = { activate, deactivate };