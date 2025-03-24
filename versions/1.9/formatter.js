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
        let [keyword, ...args] = line.split(" ");
        formatted.lines.push({ keyword, args });
    });

    
    formatted.lines.forEach((line) => {
        if(line.keyword === ''){
            formatted.lines.splice(formatted.lines.indexOf(line), 1);
        }
    })

    // Parse variable declarations
    formatted.lines.forEach((line) => {
        if (line.keyword === "int" || line.keyword === "str") {
            let value = line.args.slice(2).join(" ");
            line.args = {
                type: line.keyword,
                name: line.args[0],
                value: value
            };
            if(config.debugMode) console.log(`Formatted variable ${JSON.stringify(line.args)}`);
        }
    });

    // file argument definitions
    formatted.lines.forEach((line) => {
        if (line.keyword === "filearg") {
            line.args = {
                type: line.keyword,
                name: line.args[0],
                value: line.args[1]
            };
            if(config.debugMode) console.log(`Formatted filearg ${JSON.stringify(line.args)}`);
        }
    })

    // Parse set keywords
    formatted.lines.forEach((line) => {
        if (line.keyword === "set") {
            let variable = line.args[0];
            let value = line.args.slice(2).join(" ");

            if(variable === undefined || variable === ""){
                formatted.errors.push(`FormatError: Missing variable for "set" keyword.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }

            if(value === undefined || value === ""){
                formatted.errors.push(`FormatError: Missing value for "set" keyword.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }


            line.args = {
                variable: line.args[0],
                value: value
            };
            if(config.debugMode) console.log(`Formatted set ${JSON.stringify(line.args)}`);
        }
    });

    // Handle `out` keywords
    formatted.lines.forEach((line) => {
        if (line.keyword === "out") {
            let output = line.args.join(" ");
            line.args = {
                output: output
            }
            if(config.debugMode) console.log(`Formatted out ${JSON.stringify(line.args)}`);
        }
        
        if(line.keyword === "outc"){
            let formatting = line.args.join(" ").match(/\{([^}]+)\}/g)?.map(match => match.slice(1, -1))[0]
            let text = line.args.join(" ").replaceAll(`{${formatting}}`, "")

            let formatArray = [];
            formatting = formatting?.split("|")

            if(formatting == undefined){
                formatted.errors.push(`FormatError: Malformed Format object.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }

            for(let i = 0; i < formatting.length; i++){
                let formattingObject = {};
                formatting[i].split(",").forEach((format) => {
                    if(format === "") return;
                    format.trim();
                    let [key, value] = format.split("=").map(value => value.trim());

                    if(key == "t" || key == "b" || key == "i"){
                        formattingObject[key] = value;
                        formattingObject.type = "blanket";
                    } else if (key == "tr" || key == "br" || key == "ir") {
                        let [start, end] = value.split("-").map(value => value.trim());

                        formattingObject.type = "range";
                        formattingObject[`${key}_start`] = start;
                        formattingObject[`${key}_end`] = end;
                    }
                })
                formatArray.push(formattingObject);
            }

            if(formatting == undefined){
                formatted.errors.push(`FormatError: Malformed Format object AGAIN! FIX SOMETHING I DONT THINK YOU SHOULD EVEN BE SEEING THIS ERROR.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            } else {
                if(formatting === undefined || formatting === undefined){
                    formatted.errors.push(`FormatError: Missing arguments for "outc" keyword.`);
                    if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
                }
    
                line.args = {
                    text: text,
                    formatting: formatArray,
                }
    
                if(config.debugMode) console.log(`Formatted outc ${JSON.stringify(line.args)}`);
            }
        }
    });

    // if
    formatted.lines.forEach((line, i) => {
        if (line.keyword === "if") {
            let input = line.args.join(" ").match(/\{([^}]+)\}/g)?.map(match => match.slice(1, -1))[0];

            if(input === undefined || input === ""){
                formatted.errors.push(`FormatError: Missing condition for "if" keyword.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }

            if(input === ""){
                formatted.errors.push(`FormatError: Missing condition for "if" keyword.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }

            let pairedIf = 0;
            let count = 1;

            for (let j = i + 1; j < formatted.lines.length; j++) {
                if (formatted.lines[j].keyword === "if") {
                    count++;
                } else if (formatted.lines[j].keyword === "endif") {
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

        if (line.keyword === "else") {
            line.args = {
                endifIndex: formatted.lines.findIndex(
                    (item, index) => index > i && item.keyword === "endif"
                ),
                skip: false
            };

            if(config.debugMode) console.log(`Formatted else ${JSON.stringify(line.args)}`);
        }
    })

    // ask
    formatted.lines.forEach((line) => {
        if (line.keyword === "ask") {
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
        if (line.keyword === "prompt") {
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
        if (line.keyword === "loop") {
            let input = line.args.join(" ").match(/\{([^}]+)\}/g)?.map(match => match.slice(1, -1))[0];

            if(input === undefined || input === ""){
                formatted.errors.push(`FormatError: Missing condition for "loop" keyword.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }

            // find the next endloop index, starting at this line
            let endLoopIndex = formatted.lines.findIndex(
                (item, index) => index > currentIndex && item.keyword === "endloop"
            );

            line.args = {
                condition: input,
                endOfLoop: endLoopIndex
            };

            if(config.debugMode) console.log(`Formatted loop ${JSON.stringify(line.args)}`);
        }
    })

    formatted.lines.forEach((line, endIndex) => {
        if (line.keyword === "endloop") {
            let loopIndex = -1;
            let openLoops = 0;

            for (let i = endIndex - 1; i >= 0; i--) {
                if (formatted.lines[i].keyword === "endloop") {
                    openLoops++;
                } else if (formatted.lines[i].keyword === "loop") {
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
        if (line.keyword === "wait") {
            let input = line.args.join(" ");

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
        if (line.keyword === "free") {
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
        if (line.keyword === "append") {
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
        if (line.keyword === "func") {
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
                if (formatted.lines[j].keyword === "endfunc") {
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

    formatted.lines.forEach((line) => {
        if (line.keyword === "savedata") {
            let variable = line.args[0];
            if (variable === undefined) {
                formatted.errors.push(`FormatError: Missing variable for "savedata" keyword.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }
            line.args = {
                variable: variable
            }
            if(config.debugMode) console.log(`Formatted savedata ${JSON.stringify(line.args)}`);
        }
        if (line.keyword === "loaddata") {
            let variable = line.args[0];
            if (variable === undefined) {
                formatted.errors.push(`FormatError: Missing variable for "loaddata" keyword.`);
                if(config.debugMode) console.log(`FORMAT ERROR! ${formatted.errors[formatted.errors.length - 1]}`);
            }
            line.args = {
                variable: variable
            }
            if(config.debugMode) console.log(`Formatted loaddata ${JSON.stringify(line.args)}`);
        }
    })

    formatted.lines.forEach((line, i) => {
        if(line.keyword === "func" || line.keyword === "f:"){
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

                if(line.keyword === "f:" && config.debugMode) console.log(`Formatted f: ${JSON.stringify(line.args)}`);
                if(line.keyword === "func" && config.debugMode) console.log(`Formatted function ${JSON.stringify(line.args)}`);
            }
        }
    })

    if(config.debugMode){
        console.log(formatted);
        console.log("Formatting complete. Ready!")
    }
    
    return formatted;
}