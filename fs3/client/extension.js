const path = require("path");
const vscode = require("vscode");
const { LanguageClient, TransportKind } = require("vscode-languageclient/node");

let client;

const express = require("express");
const http = require("http");
const WebSocket = require("ws");

let server, wss;

const SERVER_PORT = 3000; // default port if needed

// SWITCH TO TERMINAL OUTPUT INSTEAD OF SERVER . BASICALLY MAKES ALL OF THIS SHIT FUCKING OBSOLETE. YAAAAAY

function activate(context) {
    // get document text from the lsp

    const editor = vscode.window.activeTextEditor;
    if(!editor) {
        vscode.window.showErrorMessage("No active editor found.");
        return;
    }

    const outputChannel = vscode.window.createOutputChannel("FS3 ClientServer");

    outputChannel.appendLine("FS3 ClientServer activating...");

    // -- start language server as before --
    let serverModule = context.asAbsolutePath(path.join("server", "server.js"));
    let serverOptions = {
        run: { module: serverModule, transport: TransportKind.ipc },
        debug: { module: serverModule, transport: TransportKind.ipc, options: { execArgv: ["--nolazy", "--inspect=6009"] } }
    };
    let clientOptions = { documentSelector: [{ scheme: "file", language: "froggyscript3" }] };
    client = new LanguageClient("fs3LanguageServer", "FS3 Language Server", serverOptions, clientOptions);

    // get document text from the lsp



    // -- express + websocket server --
    const app = express();
    server = http.createServer(app);
    wss = new WebSocket.Server({ server });

    // serve the single file

    // redirect root to mini.html so visiting / works too
    app.get("/", (req, res) => {
        res.sendFile(path.join(context.extensionPath, "resources", "mini.html"));
    });

    // websocket connections
    wss.on("connection", (ws) => {
        outputChannel.appendLine("Browser connected via WebSocket");

        ws.on("message", (msg) => {
            outputChannel.appendLine("Received from browser: " + msg);

            let data;
            try { data = JSON.parse(msg); } catch(e) { return; }

            if (data.type === "requestDocument") {
                const editor = vscode.window.activeTextEditor;
                if (!editor) return;
                const code = editor.document.getText().split("\n").map(l => l.trim()).filter(l => l.length > 0);

                ws.send(JSON.stringify({ type: "document", text: code }));
            } else {
                // Echo back
                ws.send(JSON.stringify({ type: "echo", text: data.text || msg }));
            }
        });

        ws.on("close", () => {
            outputChannel.appendLine("Browser disconnected");
        });
    });

    // Listen on an available port (0 picks a free port)
    server.listen(SERVER_PORT, "127.0.0.1", () => {
        outputChannel.appendLine(`ClientServer listening on http://localhost:${SERVER_PORT}`);
    });

    server.on("error", (err) => {
        outputChannel.appendLine("ClientServer error: " + err.message);
    });

    // command to open the page externally (uses the actual port)
    const disposable = vscode.commands.registerCommand('froggyscript3.runFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

            const code = editor.document.getText().split("\n").map(l => l.trim()).filter(l => l.length > 0);

        if (wss.clients.size > 0) {
            // Send code to all connected clients
            wss.clients.forEach(ws => {
                if (ws.readyState === ws.OPEN) {
                    ws.send(JSON.stringify({ type: "document", text: code }) );
                }
            });
        } else {
            // Open (or reopen) the page in the default browser
            await vscode.env.openExternal(vscode.Uri.parse("http://localhost:3000/"));
        }
    });
    context.subscriptions.push(disposable);

    // start LSP client
    client.start();
}

function deactivate() {
    if (client) client.stop();
    if (server) server.close();
}

module.exports = { activate, deactivate };