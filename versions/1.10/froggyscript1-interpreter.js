function FROGGYSCRIPT1_format(input) {
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

function waitForButtonClick(buttonId) {
    return new Promise(resolve => {
        const button = document.getElementById(buttonId);
        const handleClick = () => {
            button.removeEventListener("click", handleClick); // Cleanup event listener
            resolve();
        };
        button.addEventListener("click", handleClick);
    });
}

function weirdError(){
    createTerminalLine("Wow.............................. really................ smh.......", config.errorText, {translate: false});
    createTerminalLine("U really gonna brick poor old Froggy like that???? smh....", config.errorText, {translate: false})
    createTerminalLine("add [wait 0] before an endloop keyword idk", config.errorText, {translate: false});
    createTerminalLine("I cant really do anything but ill reload froggy os in a few seconds", config.errorText, {translate: false});
    let decrement = 10;
    setTimeout(() => {
        let interval = setInterval(() => {
            createTerminalLine(`Reloading in ${decrement-1} seconds...`, "", {translate: false});
            decrement--;
            if(decrement == 0){
                clearInterval(interval);
                location.reload();
            }
        }, 1000);
        setTimeout(() => {
            sendCommand("/", ["r"], true);
        }, 10000)
    }, 5000);
}

function FROGGYSCRIPT1_interpreter(formatted){

    let lineIndex = 0;
    let iteration = 0;

    let variables = {};
    let fileargCount = 0;
    let cliPromptCount = 0;

    let debugObject = {
        fileargCount: fileargCount,
        cliPromptCount: cliPromptCount,
        functions: formatted.functions,
        errors: formatted.errors,
        warnings: formatted.warnings,
    }

    if(config.debugMode) {
        document.getElementById('debug-program-memory').textContent = "program memory\n"+JSON.stringify(variables, null, 2) + "\n----------\n" + JSON.stringify(debugObject, null, 2);
    }


    function runParser(){
        let lines = formatted.lines;
        let line = formatted.lines[lineIndex];
        let keyword = line.keyword;

        let IS_ERROR = false;

        async function parseNext(){
            if(config.debugMode) await waitForButtonClick("froggyscript-debug-button");
            if(config.debugMode){
                let programFile = config.fileSystem["D:/Program-Data"].find(file => file.name == config.currentProgram).data;
                document.getElementById('debug-program-memory').textContent = 
                "program memory:\n"+ JSON.stringify(programFile, null,2) +
                "\ninstance memory:\n"+JSON.stringify(variables, null, 2) + 
                "\nformatted memory:\n" + JSON.stringify(debugObject, null, 2);
                console.log(`{${iteration}} Line ${lineIndex}: ${keyword} ${JSON.stringify(line.args)}`);
            }
            if(IS_ERROR) return;
            lineIndex++;
            iteration++;
            try {
                runParser();
            } catch (err) {
                console.error("good job bud. u bricked froggy. how could u. smh. well ur cooked i cant do nothin. if u were doing stuff its all lost. gg.")
            }
        }

        function endProgram(error){
            IS_ERROR = true;
            createTerminalLine(`${error}`, config.errorText, {translate: false});
            createTerminalLine("Error Data:", "", {translate: false});
            createTerminalLine(`Keyword: ${keyword}`, "", {translate: false});
            createTerminalLine(`Args: ${JSON.stringify(line.args, null, 2)}`, "", {translate: false});
            createEditableTerminalLine(`${config.currentPath}>`);
            setSetting("showSpinner", "false");
            config.currentProgram = null;

            if(config.debugMode){
                document.getElementById('debug-program-memory').textContent = `program memory\nprogram ended with error\n${error}`;
                console.error(error);
            }
        }

        switch(keyword){
            case "": {
                parseNext();
            } break;
            case "loaddata": { // =========================================================
                let variable = line.args.variable;
                let data = '##NUL###';
                let file = config.fileSystem["D:/Program-Data"].find(file => file.name == config.currentProgram);

                let malformedData = false;

                for(let i = 0; i < file.data.length; i++){
                    if(file.data[i].startsWith(variable+`¦°¦¨¦¦`)){
                        data = file.data[i].split(`¦°¦¨¦¦`)[1];
                        break;
                    }
                }
                if(malformedData){
                    endProgram(`Malformed data in file.`);
                    break;
                }

                if(variable["v:" + variable] == undefined){
                } else {
                    let variableType = variable["v:" + variable].type;
                    if(variableType == "int" && data == '##NUL###') data = 0;
                }
                parseNext();
            } break;
            case "savedata": { // =========================================================
                let variable = line.args.variable;
                let variableData = '';
                if(variables["v:" + variable] != undefined){
                    variableData = variables["v:" + variable].value;
                }

                let data = variable+`¦°¦¨¦¦`+variableData;
                // find the corresponding file in directory D:Program-Files
                let file = config.fileSystem["D:/Program-Data"].find(file => file.name == config.currentProgram);

                // for each line in fileData, check if the line starts with the variable name
                let found = false;
                for(let i = 0; i < file.data.length; i++){
                    if(file.data[i].startsWith(variable+`¦°¦¨¦¦`)){
                        file.data[i] = data;
                        found = true;
                        break;
                    }
                }

                if(!found) file.data.push(data);
                parseNext();
            } break;
             // gonna need some error checking here
            case "f:": {
                let end = line.args.end;
                lines[end].args = {
                    goto: lineIndex
                };
                lineIndex = line.args.start;
                parseNext();
            } break;
            case "endfunc": {
                lineIndex = line.args.goto;
                parseNext();
            } break;
            case "func": {
                lineIndex = line.args.end;
                parseNext();
            } break;
            case "append": {
                let variable = line.args.variable;
                let value = line.args.value;

                if(variables["v:" + variable] == undefined){
                    endProgram(`Variable [${variable}] does not exist.`);
                    break;
                }

                if(variables["v:" + variable].type != "str"){
                    endProgram(`Variable [${variable}] must be of type str.`);
                    break;
                }

                for(let variable in variables){
                    value = value.replaceAll(new RegExp(`\\b${variable}\\b`, 'g'), variables[variable].value);
                }

                variables["v:" + variable].value += value;
                variables["v:" + variable].value = cleanQuotes(variables["v:" + variable].value);
                parseNext();
            } break;
            case "free": {
                let variable = line.args.variable;
                if(variables[variable] == undefined){
                    endProgram(`Variable [${variable}] does not exist.`);
                    break;
                }
                delete variables[variable];
                parseNext();
            } break;
            case "clearterminal": {
                sendCommand("cl", [], false);
                parseNext();
            } break;
            case "wait": {
                let time = line.args.time;
                if(time.includes("v:")){
                    time = time.replaceAll(/v:(\w+)/g, (match, variable) => {
                        if(variables["v:" + variable] == undefined){
                            endProgram(`Variable [${variable}] does not exist.`);
                            IS_ERROR = true;
                            return;
                        }
                        if(variables["v:" + variable].type != "int"){
                            endProgram(`Variable [${variable}] must be of type int.`);
                            IS_ERROR = true;
                            return;
                        }
                        return variables["v:" + variable].value;
                    });
                }
                if(isNaN(time)){
                    endProgram(`Invalid time value.`);
                    break;
                }
                // if(time < 0){
                //     endProgram(`Time value cannot be negative.`);
                //     break;
                // }
                let timeout = setTimeout(() => {
                    setSetting("showSpinner", "false");
                    clearTimeout(timeout);
                    parseNext();
                }, time);
                setSetting("showSpinner", "true");
            } break;
            case "endloop": {
                try {
                    let loopCondition = formatted.lines[line.args.startOfLoop].args.condition;

                    if(loopCondition.includes("v:")){
                        loopCondition = loopCondition.replaceAll(/v:(\w+)/g, (match, variable) => {
                            if(variables["v:" + variable] == undefined){
                                endProgram(`Variable [${variable}] does not exist.`);
                                IS_ERROR = true;
                            }
                            return variables["v:" + variable].value;
                        });
                    }

                    if(evaluate(loopCondition) == null) {
                        endProgram(`Invalid loop condition.`);
                        IS_ERROR = true;
                    }
                    if(evaluate(loopCondition)){
                        setSetting("showSpinner", "true");
                        lineIndex = line.args.startOfLoop;

                        try {
                            parseNext();
                        } catch (err) {
                            endProgram(`Callstack size exceeded. This is a JavaScript problem.`);
                        }
                    } else {
                        setSetting("showSpinner", "false");
                        parseNext();
                    }
                } catch (err) {
                    weirdError();

                }
            } break;
            case "prompt": {
                let options = line.args.output;
                let selectedOption = line.args.selectedOption;
                let variable = line.args.variable;

                // check if variable is a valid variable
                if(variables["v:" + variable] == undefined){
                    endProgram(`Variable [${variable}] does not exist.`);
                    break;
                }

                if(variables["v:" + variable].type != "str"){
                    endProgram(`Variable [${variable}] must be of type str.`);
                    break;
                }

                let selectedIndex = 0;
                if(typeof +selectedOption == "number" && !isNaN(+selectedOption)){
                    selectedIndex = +selectedOption;
                } else {
                    if(variables["v:" + selectedOption] == undefined){
                        endProgram(`Variable [${selectedOption}] does not exist.`);
                        break;
                    }
                    if(variables["v:" + selectedOption].type != "int"){
                        endProgram(`Variable [${selectedOption}] must be of type int.`);
                        break;
                    }
                    selectedIndex = variables["v:" + selectedOption].value;
                }


                if(selectedIndex < 0 || selectedIndex >= options.length){
                    endProgram(`Selected option is out of range.`);
                    break;
                }

                

                cliPromptCount++;

                let terminalLineElement = document.createElement('div');
                terminalLineElement.classList.add('line-container');

                let spanElement = document.createElement('span');
                spanElement.textContent = ">";

                terminalLineElement.appendChild(spanElement);

                for(let i = 0; i < options.length; i++){
                    let option = document.createElement('span');
                    option.setAttribute("data-program", `cli-session-${config.programSession}-${cliPromptCount}`);
                    option.textContent = options[i];
                    if(i == selectedIndex) {
                        option.classList.add('selected');
                    }
                    option.style.paddingLeft = 0;
                    terminalLineElement.appendChild(option);
                    terminalLineElement.appendChild(document.createTextNode(" "));
                }

                function promptHandler(e){
                    let options = document.querySelectorAll(`[data-program='cli-session-${config.programSession}-${cliPromptCount}']`);
                    e.preventDefault();

                    if(e.key == "ArrowLeft"){
                        if(selectedIndex > 0) selectedIndex--;
                        options.forEach(option => option.classList.remove('selected'));
                        options[selectedIndex].classList.add('selected');
                    }

                    if(e.key == "ArrowRight"){
                        if(selectedIndex < options.length - 1) selectedIndex++;
                        options.forEach(option => option.classList.remove('selected'));
                        options[selectedIndex].classList.add('selected');
                    }

                    if(e.key == "Enter"){
                        e.preventDefault();
                        variables["v:" + variable].value = options[selectedIndex].textContent;
                        document.body.removeEventListener('keyup', promptHandler);
                        setSetting("showSpinner", "false");
                        parseNext();

                    }
                };

                document.body.addEventListener('keyup', promptHandler);
                terminal.appendChild(terminalLineElement);
                setSetting("showSpinner", "true");
                // PAUSE HERE
            } break;
            case "ask":
                let span = document.createElement('span');
                let inputElement = document.createElement('div');
                let elementToAppend = document.createElement('div');

                inputElement.setAttribute('contenteditable', 'true');
                inputElement.setAttribute('spellcheck', 'true');

                span.textContent = "?";

                elementToAppend.appendChild(span);
                elementToAppend.appendChild(inputElement);

                elementToAppend.classList.add('line-container');

                terminal.appendChild(elementToAppend);
                inputElement.focus();

                inputElement.addEventListener('keydown', function(e){
                    if(e.key == "Enter") e.preventDefault();
                }); 

                inputElement.addEventListener('keyup', function(e){
                    if(e.key == "Enter"){
                        e.preventDefault();
                        inputElement.setAttribute('contenteditable', 'false');

                        // RESUME PAUSE HERE
                        setSetting("showSpinner", "false");

                        let userInput = inputElement.textContent;
                        let variable = line.args.variable;

                        if(variables["v:" + variable] == undefined){
                            endProgram(`Variable [${variable}] does not exist.`);
                            return;
                        }

                        if(variables["v:" + variable].type == "str"){
                            variables["v:" + variable].value = userInput;
                        }

                        if(variables["v:" + variable].type == "int"){
                            if(isNaN(userInput)){
                                endProgram(`Invalid integer value.`);
                                return;
                            } else {
                                variables["v:" + variable].value = parseInt(userInput);
                            }
                        }
                        
                        parseNext();
                    }
                });

                // PAUSE HERE
                setSetting("showSpinner", "true");
            break;
            case "filearg":
                if (!line.args || !line.args.name || !line.args.type || !line.args.value) {
                    endProgram(`Invalid filearg syntax.`);
                    break;
                }

                let name = line.args.name;
                let type = line.args.value;  

                if(variables["v:" + name] != undefined){
                    endProgram(`Variable [${name}] already exists.`);
                    break;
                }

                // count the number of variables with the type of "define"
                fileargCount++;

                if(args.length - 1 < fileargCount){
                    endProgram(`Missing argument [${fileargCount}] (type ${type}).`);
                    break;
                }

                let varVal = args[fileargCount];

                variables["v:" + name] = {
                    type: type,
                    value: varVal,
                    name: name,
                };
                parseNext();
            break;
            case "str":
                if (!line.args || !line.args.name) {
                    endProgram(`Invalid str declaration syntax.`);
                    break;
                }
                // if the variable already exist, throw error
                if(variables[line.args.name] != undefined){
                    endProgram(`String [${line.args.name}] already exists.`);
                    break;
                }

                for(let variable in variables){
                    if(line.args.value.includes(variable)){
                        line.args.value = line.args.value.replaceAll(new RegExp(`\\b${variable}\\b`, 'g'), cleanQuotes(variables[variable].value));
                    }
                }

                line.args.value = cleanQuotes(line.args.value);
                variables["v:" + line.args.name] = line.args;
                parseNext();
            break;
            case "int":
                if (!line.args || !line.args.name) {
                    endProgram(`Invalid int declaration syntax.`);
                    break;
                }
                if(variables[line.args.name] != undefined){
                    endProgram(`Integer [${line.args.name}] already exists.`);
                    break;
                }

                let argument = line.args.value;
                let parsedArgument = evaluate(argument);
                
                // check if parsedArgument is a number
                if(isNaN(parsedArgument) || parsedArgument == null){
                    endProgram(`Invalid integer value.`);
                    break;
                }

                line.args.value = parsedArgument + [];
                variables["v:" + line.args.name] = line.args;
                parseNext();
            break;
            case "set": {
                let variableName = "v:" + line.args?.variable;
                let value = line.args?.value;
                let parsedValue;
                let type;

                if(variables[variableName] == undefined){
                    endProgram(`Variable [${variableName}] does not exist.`);
                    break;
                }

                for(let variable in variables){
                    if(variable == variableName){
                        value = value.replaceAll(new RegExp(`\\b${variableName}\\b`, 'g'), variables[variableName].value);

                        if(variables[variable].type == "int"){
                            parsedValue = evaluate(value);
                        }
                    }   
                }

                if(type == "int" && (isNaN(parsedValue) || parsedValue == null)){
                    endProgram(`Invalid integer value.`);
                    break;
                }
                
                try {
                    parsedValue = new Function(`return (${value});`)();
                } catch (err) {
                    endProgram(`Error evaluating [${value}]`);
                    break;
                }

                variables[variableName].value = parsedValue;
                parseNext();
            } break;
            case "if":
                let condition = line.args.condition;
        
                for(let variable in variables){
                    if(condition.includes(variable)){
                        let varType = variables[variable].type;
                        condition = condition.replaceAll(new RegExp(`\\b${variable}\\b`, 'g'), `¶v¬${varType}¦${variables[variable].value}¶v¬${varType}¦`);
                    }
                }


                condition = condition.replaceAll("¶v¬str¦", "\"");
                condition = condition.replaceAll("¶v¬int¦", "");

                let parsedCondition = evaluate(condition);

                if(parsedCondition == null){
                    endProgram(`Invalid condition.`);
                    break;
                }

                // find the else statement
                let elseIndex = formatted.lines.findIndex((line, index) => line.keyword == "else" && index > lineIndex);
                let endifIndex = line.args.pairedIf;

                if(endifIndex == -1){
                    endProgram(`"endif" not found.`);
                    break;
                }

                if (parsedCondition) {
                    if(elseIndex != -1){
                        formatted.lines[elseIndex].args.skip = true;
                    }
                } else {
                    if(elseIndex != -1){
                        lineIndex = elseIndex;
                    } else {
                        lineIndex = endifIndex;
                    }
                }
                parseNext();
            break;
            case "else":
                if(formatted.lines[lineIndex].args.skip){
                    lineIndex = formatted.lines[lineIndex].args.endifIndex;
                }
                parseNext();
            break;
            case "outc": {
                let text = line.args.text;
                let formatting = line.args.formatting;

                for(let i = 0; i < formatting.length; i++){
                    for(let key in formatting[i]){
                        let value = formatting[i][key];

                        if([key, value].includes(undefined)){
                            endProgram(`Invalid FormatObject (RANGE) syntax.`);
                            break;
                        }

                        // replace variables
                        if(value.includes("v:")){
                            for(let variable in variables){
                                value = value.replaceAll(new RegExp(`\\b${variable}\\b`, 'g'), variables[variable].value);
                            }

                            value = value.replaceAll(/v:(\w+)/g, (match, variable) => {
                                if(variables["v:" + variable] == undefined){
                                    endProgram(`Variable [${variable}] does not exist.`);
                                    return;
                                } else if (variables["v:" + variable].type != "int") {
                                    endProgram(`Variable [${variable}] must be of type int.`);
                                    return;
                                }
                                return variables["v:" + variable].value;
                            });
                        }

                        if(key == "t" || key == "b"){
                            if(value.length == 1) value = `c0${value}`;
                            else if (value.length == 2) value = `c${value}`;
                        }

                        formatting[i][key] = value;
                    }
                }

                // go through the text and replace variables
                for(let variable in variables){
                    text = text.replaceAll(new RegExp(`\\b${variable}\\b`, 'g'), variables[variable].value);
                }


                let parsedText;
                try {
                    parsedText = new Function(`return (${(text)});`)(); // Evaluate the expression
                } catch (err) {
                    endProgram(`Error evaluating: [${text}]`);
                    break;
                }

                if(IS_ERROR) return;
                createTerminalLine(parsedText, ">", {
                    formatting: formatting,
                    translate: false
                });
                parseNext();
            } break;
            case "out": {
                if (!line.args) {
                    endProgram(`Invalid "out" syntax.`);
                    break;
                }

                let out = line.args.output;

                // Replace variables in the "out" statement
                for (let variable in variables) {
                    let variableRegex = new RegExp(`${variable}`, "g"); // Ensure full match for variable name
                    if (variableRegex.test(out)) {
                        let value = variables[variable].value;
                        if (variables[variable].type === "str") {
                            value = `'${value}'`; // Wrap string variables in quotes
                        }
                        out = out.replace(variableRegex, value);
                    }
                }

                // Check for unresolved variables
                if (/v:\w+/.test(out)) {
                    endProgram(`Variable does not exist in "out" statement.`);
                    break;
                }

                let parsedOut;
                try {
                    parsedOut = new Function(`return (${(out)});`)(); // Evaluate the expression
                } catch (err) {
                    endProgram(`Error evaluating [${out}]`);
                    break;
                }

                // Output the parsed result to the terminal
                if(IS_ERROR) return;
                createTerminalLine(parsedOut, ">", {translate: false});
                parseNext();
            } break;
            case "endprog":
                config.currentProgram = "cli";
                document.getElementById('debug-program-memory').textContent = `program memory\nprogram ended`;
                createEditableTerminalLine(`${config.currentPath}>`);
            break;
            default:
                parseNext();
            break;
        }
    }
    runParser();
}