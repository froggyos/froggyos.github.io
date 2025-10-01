const path = require("path");
const vscode = require("vscode");
const { LanguageClient, TransportKind } = require("vscode-languageclient/node");

let client;

function activate(context) {
    console.log("FS3 client activating...");

    let serverModule = context.asAbsolutePath(
        path.join("server", "server.js")
    );

    let serverOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: { execArgv: ["--nolazy", "--inspect=6009"] } }
    };

    let clientOptions = {
        documentSelector: [{ scheme: "file", language: "froggyscript3" }]
    };

    client = new LanguageClient(
        "fs3LanguageServer",
        "FS3 Language Server",
        serverOptions,
        clientOptions
    );

    const disposable = vscode.commands.registerCommand('froggyscript3.runFile', async () => {
        // get current document text
        const editor = vscode.window.activeTextEditor;
        const document = editor.document;
        const code = document.getText();

        vscode.env.openExternal(vscode.Uri.parse("https://froggyos.xyz/versions/1.16/index.html?code=" + encodeURIComponent(code)));
    });

    context.subscriptions.push(disposable);
    client.start();
}


function deactivate() {
    return client ? client.stop() : undefined;
}

module.exports = { activate, deactivate };