function parse(input) {
    let parsed = {
        functions: {},
        labels: {},
        lines: [],
        errors: [],
        warnings: []
    };
    
    const disallowedVariableNames = [
        "int", "str", "set", "out", "func", "endfunc", "f:", "label", "goto", "if", "endif", "and", "or", "not", "true", "false", "else"
    ]

    // Parse lines into command objects
    input.forEach((line) => {
        let [command, ...args] = line.split(" ");
        parsed.lines.push({ command, args });
    });

    // Parse variable declarations
    parsed.lines.forEach((line) => {
        if (line.command === "int" || line.command === "str") {
            let value = line.args.slice(2).join(" ");
            if(disallowedVariableNames.includes(line.args[0])){
                parsed.errors.push(`Variable name "${line.args[0]}" is not allowed.`);
            }
            line.args = {
                type: line.command,
                name: line.args[0],
                value: value
            };
        }
    });

    // file argument definitions
    parsed.lines.forEach((line) => {
        if (line.command === "define") {
            line.args = {
                type: line.command,
                name: line.args[0],
                value: line.args[1]
            };
        }
    })

    // Parse set commands
    parsed.lines.forEach((line) => {
        if (line.command === "set") {
            let value = line.args.slice(2).join(" ");
            line.args = {
                variable: line.args[0],
                value: value
            };
        }
    });

    // Handle `out` commands
    parsed.lines.forEach((line) => {
        if (line.command === "out") {
            line.args = line.args.join(" ");
        }
    });

    // Parse functions
    for (let i = 0; i < parsed.lines.length; i++) {
        let line = parsed.lines[i];
        if (line.command === "func") {
            let functionName = line.args[0];
            let functionLines = [];
            let j = i + 1;
            let failsafe = 0;

            if(parsed.functions[functionName] !== undefined){
                parsed.errors.push(`Function "${functionName}" already exists.`);
                break;
            }

            while (parsed.lines[j]?.command !== "endfunc") {
                functionLines.push(parsed.lines[j]);
                parsed.lines.splice(j, 1);
                failsafe++;
                
                if(failsafe > parsed.lines.length){
                    parsed.errors.push(`Function "${functionName}" is not closed.`);
                    break;
                }
            }

            parsed.lines.splice(j, 1); // Remove "endfunc"
            parsed.functions[functionName] = functionLines;
            parsed.lines.splice(i, 1); // Remove "func"
            i--; // Adjust index
        }
    }

    // Execute `f:` commands
    for (let i = 0; i < parsed.lines.length; i++) {
        let line = parsed.lines[i];
        if (line.command === "f:") {
            let functionName = line.args[0];
            if (parsed.functions[functionName]) {
                let functionBody = JSON.parse(JSON.stringify(parsed.functions[functionName]));
                parsed.lines.splice(i, 1, ...functionBody);
                i += functionBody.length - 1;
            } else {
                parsed.errors.push(`Function "${functionName}" not defined.`);
            }
        }
    }

    // if
    parsed.lines.forEach((line) => {
        if (line.command === "if") {
            let input = line.args.join(" ");
            input = input.replace("{", "");
            input = input.replace("}", "");

            delete line.args 
            line.args = {};
            line.args.condition = input;
        }
    })

    // ask
    parsed.lines.forEach((line) => {
        if (line.command === "ask") {
            // ask [variable] [output]
            let variable = line.args[0];
            line.args = {
                variable: variable,
            }
        }
    })

    // prompt
    parsed.lines.forEach((line) => {
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
    parsed.lines.forEach((line, currentIndex) => {
        if (line.command === "loop") {
            let input = line.args.join(" ");
            input = input.replace("{", "");
            input = input.replace("}", "");

            // find the next endloop index, starting at this line
            let endLoopIndex = parsed.lines.findIndex(
                (item, index) => index > currentIndex && item.command === "endloop"
            );

            line.args = {
                condition: input,
                endOfLoop: endLoopIndex
            };
        }
    })

    parsed.lines.forEach((line, endIndex) => {
        if (line.command === "endloop") {
            // Use a stack to track open loops
            let loopIndex = -1;
            let openLoops = 0;

            for (let i = endIndex - 1; i >= 0; i--) {
                if (parsed.lines[i].command === "endloop") {
                    openLoops++;
                } else if (parsed.lines[i].command === "loop") {
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
                console.error(`No matching "loop" found for "endloop".`);
            }
        }
    });

    return parsed;
}