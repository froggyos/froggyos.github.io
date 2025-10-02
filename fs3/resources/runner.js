const e = require("express");
const { FroggyScript3 } = require("./interpreter.js");
const fs = require("fs");
const path = require("path");

const terminalKit = require("terminal-kit").terminal;

const filePath = process.argv[2];

if(!filePath) {
    console.error("No file path provided.");
    process.exit(1);
}

process.on("unhandledRejection", (reason, promise) => {
    terminalKit(" -- ").bgRed(reason.type)(" -- \n")
    terminalKit(reason.message + "\n")
    terminalKit(`    at line: ${reason.line}\n`)
    terminalKit(`    at  col: ${reason.col}`)
});

const fileName = path.basename(filePath);

const code = fs.readFileSync(filePath, "utf-8").split("\n").map(l => l.trim()).filter(l => l.length > 0);


const fs3 = new FroggyScript3({
    out: (token) => {
        terminalKit("\n> "+token.value);
    },
    err: (token) => {
        terminalKit(" -- ").bgRed(token.type)(" -- \n")
        terminalKit(token.message + "\n")
        terminalKit(`    at line: ${token.line}\n`)
        terminalKit(`     at col: ${token.col}`)
    },
    onComplete: () => {
        terminalKit.green("\n\nFS3 END ----------------------\n");
        process.exit(0);
    }
});

terminalKit.green("\nFS3 BEGIN --------------------\n\n");
fs3.interpret(code, fileName, []);
