function format(input) {
    let formatted = {
        functions: {},
        lines: [],
        errors: [],
        warnings: []
    };

    input.forEach((line, i) => {
        input[i] = line.trim();
    });

    // Parse lines into command objects
    input.forEach((line) => {
        let [command, ...args] = line.split(" ");
        formatted.lines.push({ command, args });
    });

    // Parse variable declarations
    formatted.lines.forEach((line) => {
        if (line.command === "int" || line.command === "str") {
            let value = line.args.slice(2).join(" ");
            line.args = {
                type: line.command,
                name: line.args[0],
                value: value
            };
            if(config.debugMode) console.log(`Formatted variable ${JSON.stringify(line.args)}`);
        }
    });

    // file argument definitions
    formatted.lines.forEach((line) => {
        if (line.command === "filearg") {
            line.args = {
                type: line.command,
                name: line.args[0],
                value: line.args[1]
            };
            if(config.debugMode) console.log(`Formatted filearg ${JSON.stringify(line.args)}`);
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
            if(config.debugMode) console.log(`Formatted set ${JSON.stringify(line.args)}`);
        }
    });

    // Handle `out` commands
    formatted.lines.forEach((line) => {
        if (line.command === "out") {
            line.args = line.args.join(" ");
            if(config.debugMode) console.log(`Formatted out ${JSON.stringify(line.args)}`);
        }
        if(line.command === "outc"){
            let color = line.args[0];
            let output = line.args.slice(1).join(" ");

            if(color === undefined || output === undefined){
                formatted.errors.push(`FormatError: Missing arguments for "outc" keyword.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }

            line.args = {
                color: color,
                output: output
            }
            if(config.debugMode) console.log(`Formatted outc ${JSON.stringify(line.args)}`);
        }
    });

    // if
    formatted.lines.forEach((line, i) => {
        if (line.command === "if") {
            let input = line.args.join(" ");
            input = input.replace("{", "");
            input = input.replace("}", "");

            if(input === ""){
                formatted.errors.push(`FormatError: Missing condition for "if" keyword.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }

            let pairedIf = 0;
            let count = 1;

            for (let j = i + 1; j < formatted.lines.length; j++) {
                if (formatted.lines[j].command === "if") {
                    count++;
                } else if (formatted.lines[j].command === "endif") {
                    count--;
                }

                if (count === 0) {
                    pairedIf = j;
                    break;
                }
            }

            if (count !== 0) {
                formatted.errors.push(`FormatError: No matching "endif" found for "if".`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }

            line.args = {
                condition: input,
                pairedIf: pairedIf
            };

            if(config.debugMode) console.log(`Formatted if ${JSON.stringify(line.args)}`);
        }

        if (line.command === "else") {
            line.args = {
                endifIndex: formatted.lines.findIndex(
                    (item, index) => index > i && item.command === "endif"
                ),
                skip: false
            };

            if(config.debugMode) console.log(`Formatted else ${JSON.stringify(line.args)}`);
        }
    })

    // ask
    formatted.lines.forEach((line) => {
        if (line.command === "ask") {
            // ask [variable] [output]
            let variable = line.args[0];

            if (variable === undefined || variable === "") {
                formatted.errors.push(`FormatError: Missing variable for "ask" keyword.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }

            line.args = {
                variable: variable,
            }

            if(config.debugMode) console.log(`Formatted ask ${JSON.stringify(line.args)}`);
        }
    })

    // prompt
    formatted.lines.forEach((line) => {
        if (line.command === "prompt") {
            let selectedOption = line.args[0];
            let variable = line.args[1];
            let output = line.args.slice(2);

            if (selectedOption === undefined || selectedOption === "") {
                formatted.errors.push(`FormatError: Missing selected option for "prompt" keyword.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }

            if (variable === undefined || variable === "") {
                formatted.errors.push(`FormatError: Missing variable for "prompt" keyword.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }

            if (output === undefined || output === "") {
                formatted.errors.push(`FormatError: Missing output for "prompt" keyword.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }

            line.args = {
                variable: variable,
                selectedOption: selectedOption,
                output: output
            }

            if(config.debugMode) console.log(`Formatted prompt ${JSON.stringify(line.args)}`);
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

            if(config.debugMode) console.log(`Formatted loop ${JSON.stringify(line.args)}`);
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
                
                if(config.debugMode) console.log(`Formatted endloop: ${JSON.stringify(line.args)}`);
            } else {
                formatted.errors.push(`FormatError: No matching "loop" found for "endloop".`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }
        }
    });

    // wait keyword
    formatted.lines.forEach((line) => {
        if (line.command === "wait") {
            let input = line.args.join(" ");
            input = input.replace("{", "");
            input = input.replace("}", "");

            if (input === "") {
                formatted.errors.push(`FormatError: Missing time for "wait" keyword.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }

            line.args = {
                time: input
            };

            if(config.debugMode) console.log(`Formatted wait ${JSON.stringify(line.args)}`);
        }
    });

    // free keyword
    formatted.lines.forEach((line) => {
        if (line.command === "free") {
            let input = line.args[0];

            if (input === undefined) {
                formatted.errors.push(`FormatError: Missing variable for "free" keyword.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }

            line.args = {
                variable: input
            };

            if(config.debugMode) console.log(`Formatted free ${JSON.stringify(line.args)}`);
        }
    });

    // append keyword
    formatted.lines.forEach((line) => {
        if (line.command === "append") {
            let input = line.args.splice(1).join(" ");

            if (line.args[0] === undefined) {
                formatted.errors.push(`FormatError: Missing variable for "append" keyword.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }

            if (input === "") {
                formatted.errors.push(`FormatError: Missing input for "append" keyword.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }

            line.args = {
                variable: line.args[0],
                value: input
            };

            if(config.debugMode) console.log(`Formatted append ${JSON.stringify(line.args)}`);
        }
    });

    // Parse functions
    for (let i = 0; i < formatted.lines.length; i++) {
        let line = formatted.lines[i];
        if (line.command === "func") {
            let functionName = line.args[0];
            let startLine = i;
            let endLine = -1;

            let j = i + 1;
            let failsafe = 0;

            if(formatted.functions[functionName] !== undefined){
                formatted.errors.push(`FormatError: Function "${functionName}" already exists.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
                break;
            }

            while (j < formatted.lines.length && endLine === -1) {
                if (formatted.lines[j].command === "endfunc") {
                    endLine = j;
                }
                j++;
                failsafe++;
                if (failsafe > formatted.lines.length) {
                    formatted.errors.push(`FormatError: No matching "endfunc" found for "func".`);
                    if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
                    break;
                }
            }

            formatted.functions[functionName] = {
                start: startLine,
                end: endLine,
            };

            if(config.debugMode) console.log(`Formatted function ${functionName}`);
        }
    }

    formatted.lines.forEach((line, i) => {
        if(line.command === "func" || line.command === "f:"){
            let functionName = line.args[0];
            if(formatted.functions[functionName] === undefined){
                formatted.errors.push(`FormatError: Function "${functionName}" not defined.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            } else {
                let startingIndex = formatted.functions[functionName].start;
                let endingIndex = formatted.functions[functionName].end;

                line.args = {
                    function: functionName,
                    start: startingIndex,
                    end: endingIndex
                }

                if(line.command === "f:" && config.debugMode) console.log(`Formatted f: ${JSON.stringify(line.args)}`);
                if(line.command === "func" && config.debugMode) console.log(`Formatted function ${JSON.stringify(line.args)}`);
            }
        }
    })
    
    return formatted;
}