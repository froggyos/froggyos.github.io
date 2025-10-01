const path = require("path");
const vscode = require("vscode");
const { LanguageClient, TransportKind } = require("vscode-languageclient/node");

let client;

const express = require("express");
const http = require("http");
const WebSocket = require("ws");

let server, wss;

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

    const app = express();
    server = http.createServer(app);
    wss = new WebSocket.Server({ server });

    app.get("/mini.html", (req, res) => {
        res.sendFile(path.join(context.extensionPath, "resources", "mini.html"));
    });

    // WebSocket connections
    wss.on("connection", (ws) => {
        console.log("Client connected");

        ws.on("message", (msg) => {
            console.log("Received from browser:", msg.toString());

            // Example: echo back
            ws.send("Echo: " + msg);
        });
    });

    server.listen(3000, () => {
        console.log("Express server running at http://localhost:3000");
    });

    const disposable = vscode.commands.registerCommand('froggyscript3.runFile', async () => {
        // get current document text
        const editor = vscode.window.activeTextEditor;
        const document = editor.document;
        const code = document.getText();

        vscode.env.openExternal("http://localhost:3000");
    });

    context.subscriptions.push(disposable);
    client.start();
}


function deactivate() {
    return client ? client.stop() : undefined;
}

module.exports = { activate, deactivate };