function format(input) {
    let formatted = {
        functions: {},
        labels: {},
        lines: [],
        errors: [],
        warnings: []
    };
    
    const disallowedVariableNames = [
        "int", "str", "set", "out", "func", "endfunc", "f:", "label", "goto", "if", "endif", "and", "or", "not", "true", "false", "else"
    ]

    // for each index in input, if it equals "endloop", insert "wait 0" before it
    for (let i = 0; i < input.length; i++) {
        if (input[i] === "endloop") {
            input.splice(i, 0, "wait 0");
            i++;
        }
    }

    // Parse lines into command objects
    input.forEach((line) => {
        let [command, ...args] = line.split(" ");
        formatted.lines.push({ command, args });
    });

    // Parse variable declarations
    formatted.lines.forEach((line) => {
        if (line.command === "int" || line.command === "str") {
            let value = line.args.slice(2).join(" ");
            if(disallowedVariableNames.includes(line.args[0])){
                formatted.errors.push(`Variable name "${line.args[0]}" is not allowed.`);
            }
            line.args = {
                type: line.command,
                name: line.args[0],
                value: value
            };
        }
    });

    // file argument definitions
    formatted.lines.forEach((line) => {
        if (line.command === "define") {
            line.args = {
                type: line.command,
                name: line.args[0],
                value: line.args[1]
            };
        }
    })

    // Parse set commands
    formatted.lines.forEach((line) => {
        if (line.command === "set") {
            let value = line.args.slice(2).join(" ");
            line.args = {
                variable: line.args[0],
                value: value
            };
        }
    });

    // Handle `out` commands
    formatted.lines.forEach((line) => {
        if (line.command === "out") {
            line.args = line.args.join(" ");
        }
    });

    // Parse functions
    for (let i = 0; i < formatted.lines.length; i++) {
        let line = formatted.lines[i];
        if (line.command === "func") {
            let functionName = line.args[0];
            let functionLines = [];
            let j = i + 1;
            let failsafe = 0;

            if(formatted.functions[functionName] !== undefined){
                formatted.errors.push(`Function "${functionName}" already exists.`);
                break;
            }

            while (formatted.lines[j]?.command !== "endfunc") {
                functionLines.push(formatted.lines[j]);
                formatted.lines.splice(j, 1);
                failsafe++;
                
                if(failsafe > formatted.lines.length){
                    formatted.errors.push(`Function "${functionName}" is not closed.`);
                    break;
                }
            }

            formatted.lines.splice(j, 1); // Remove "endfunc"
            formatted.functions[functionName] = functionLines;
            formatted.lines.splice(i, 1); // Remove "func"
            i--; // Adjust index
        }
    }

    // Execute `f:` commands
    for (let i = 0; i < formatted.lines.length; i++) {
        let line = formatted.lines[i];
        if (line.command === "f:") {
            let functionName = line.args[0];
            if (formatted.functions[functionName]) {
                let functionBody = JSON.parse(JSON.stringify(formatted.functions[functionName]));
                formatted.lines.splice(i, 1, ...functionBody);
                i += functionBody.length - 1;
            } else {
                formatted.errors.push(`Function "${functionName}" not defined.`);
            }
        }
    }

    // if
    formatted.lines.forEach((line, i) => {
        if (line.command === "if") {
            let input = line.args.join(" ");
            input = input.replace("{", "");
            input = input.replace("}", "");

            delete line.args 
            line.args = {};
            line.args.condition = input;
        }

        if (line.command === "else") {
            line.args = {
                endifIndex: formatted.lines.findIndex(
                    (item, index) => index > i && item.command === "endif"
                ),
                skip: false
            };
        }
    })

    // ask
    formatted.lines.forEach((line) => {
        if (line.command === "ask") {
            // ask [variable] [output]
            let variable = line.args[0];
            line.args = {
                variable: variable,
            }
        }
    })

    // prompt
    formatted.lines.forEach((line) => {
        if (line.command === "prompt") {
            // prompt [variable] [output]
            let variable = line.args[0];
            let output = line.args.slice(1);
            line.args = {
                variable: variable,
                output: output
            }
        }
    })

    // loop
    formatted.lines.forEach((line, currentIndex) => {
        if (line.command === "loop") {
            let input = line.args.join(" ");
            input = input.replace("{", "");
            input = input.replace("}", "");

            // find the next endloop index, starting at this line
            let endLoopIndex = formatted.lines.findIndex(
                (item, index) => index > currentIndex && item.command === "endloop"
            );

            line.args = {
                condition: input,
                endOfLoop: endLoopIndex
            };
        }
    })

    formatted.lines.forEach((line, endIndex) => {
        if (line.command === "endloop") {
            // Use a stack to track open loops
            let loopIndex = -1;
            let openLoops = 0;

            for (let i = endIndex - 1; i >= 0; i--) {
                if (formatted.lines[i].command === "endloop") {
                    openLoops++;
                } else if (formatted.lines[i].command === "loop") {
                    if (openLoops === 0) {
                        loopIndex = i;
                        break;
                    } else {
                        openLoops--;
                    }
                }
            }

            if (loopIndex !== -1) {
                line.args = {
                    startOfLoop: loopIndex,
                };
            } else {
                formatted.errors.push(`No matching "loop" found for "endloop".`);
            }
        }
    });

    // wait keyword
    formatted.lines.forEach((line) => {
        if (line.command === "wait") {
            let input = line.args.join(" ");
            input = input.replace("{", "");
            input = input.replace("}", "");

            line.args = {
                time: input
            };
        }
    });

    return formatted;
}