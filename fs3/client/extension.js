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

    client.start();
}

function deactivate() {
    return client ? client.stop() : undefined;
}

module.exports = { activate, deactivate };