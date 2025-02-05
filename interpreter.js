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

function interpreter(formatted, vars){

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
        console.log("Formatting complete. Ready!")
        document.getElementById('debug-program-memory').textContent = "program memory\n"+JSON.stringify(variables, null, 2) + "\n----------\n" + JSON.stringify(debugObject, null, 2);
    }

    function runParser(){
        let line = formatted.lines[lineIndex];
        let command = line.command;

        async function parseNext(){
            if(config.debugMode){
                await waitForButtonClick("froggyscript-debug-button");
                document.getElementById('debug-program-memory').textContent = "program memory\n"+JSON.stringify(variables, null, 2) + "\n----------\n" + JSON.stringify(debugObject, null, 2);
                console.log(`{${iteration}} Line ${lineIndex}: ${command} ${JSON.stringify(line.args)}`);
            }
            lineIndex++;
            iteration++;
            runParser();
        }

        function endProgram(error){
            createTerminalLine(`${error}`, config.errorText);
            createEditableTerminalLine(`${config.currentPath}>`);
            config.showLoadingSpinner = false;
            config.currentProgram = null;

            if(config.debugMode){
                document.getElementById('debug-program-memory').textContent = `program memory\nprogram ended with error\n${error}`;
                console.error(error);
            }
        }

        switch(command){
            // FIX FUNCTION PARSING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ==================================================
            case "append": {
                let variable = line.args.variable;
                let value = line.args.value;

                if(variables["v:" + variable] == undefined){
                    endProgram(`Variable "${variable}" does not exist.`);
                    break;
                }

                if(variables["v:" + variable].type != "str"){
                    endProgram(`Variable "${variable}" must be of type str.`);
                    break;
                }

                for(let variable in variables){
                    value = value.replaceAll(new RegExp(`\\b${variable}\\b`, 'g'), variables[variable].value);
                }

                variables["v:" + variable].value += value;
                parseNext();
            } break;
            case "free": {
                let variable = line.args.variable;
                if(variables[variable] == undefined){
                    endProgram(`Variable "${variable}" does not exist.`);
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
                // check if its a variable, must be type int
                if(time.includes("v:")){
                    time = time.replaceAll(/v:(\w+)/g, (match, variable) => {
                        if(variables["v:" + variable] == undefined){
                            endProgram(`Variable "${variable}" does not exist.`);
                            return;
                        }
                        if(variables["v:" + variable].type != "int"){
                            endProgram(`Variable "${variable}" must be of type int.`);
                            return;
                        }
                        return variables["v:" + variable].value;
                    });
                }
                if(isNaN(time)){
                    endProgram(`Invalid time value.`);
                    break;
                }
                if(time < 0){
                    endProgram(`Time value cannot be negative.`);
                    break;
                }
                setTimeout(() => {
                    config.showLoadingSpinner = false;
                    parseNext();
                }, time);
                config.showLoadingSpinner = true;
            } break;
            case "endloop": {
                let loopCondition = formatted.lines[line.args.startOfLoop].args.condition;

                if(loopCondition.includes("v:")){
                    loopCondition = loopCondition.replaceAll(/v:(\w+)/g, (match, variable) => {
                        if(variables["v:" + variable] == undefined){
                            endProgram(`Variable "${variable}" does not exist.`);
                        }
                        return variables["v:" + variable].value;
                    });
                }

                if(evaluate(loopCondition) == null) {
                    endProgram(`Invalid loop condition.`);
                    break;
                }
                if(evaluate(loopCondition)){
                    config.showLoadingSpinner = true;
                    lineIndex = line.args.startOfLoop;

                    try {
                        parseNext();
                    } catch (err) {
                        endProgram(`Callstack size exceeded. This is a JavaScript problem.`);
                    }
                } else {
                    config.showLoadingSpinner = false;
                    parseNext();
                }
            } break;
            case "prompt": {
                let options = line.args.output;
                let selectedOption = line.args.selectedOption;
                let variable = line.args.variable;

                // check if variable is a valid variable
                if(variables["v:" + variable] == undefined){
                    endProgram(`Variable "${variable}" does not exist.`);
                    break;
                }

                if(variables["v:" + variable].type != "str"){
                    endProgram(`Variable "${variable}" must be of type str.`);
                    break;
                }

                let selectedIndex = 0;
                if(typeof +selectedOption == "number" && !isNaN(+selectedOption)){
                    selectedIndex = +selectedOption;
                } else {
                    if(variables["v:" + selectedOption] == undefined){
                        endProgram(`Variable "${selectedOption}" does not exist.`);
                        break;
                    }
                    if(variables["v:" + selectedOption].type != "int"){
                        endProgram(`Variable "${selectedOption}" must be of type int.`);
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
                        config.showLoadingSpinner = false;
                        parseNext();

                    }
                };

                document.body.addEventListener('keyup', promptHandler);
                terminal.appendChild(terminalLineElement);
                config.showLoadingSpinner = true;
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
                    if(e.key == "Enter"){
                        e.preventDefault();
                        inputElement.setAttribute('contenteditable', 'false');

                        // RESUME PAUSE HERE
                        config.showLoadingSpinner = false;

                        let userInput = inputElement.textContent;
                        let variable = line.args.variable;

                        if(variables["v:" + variable] == undefined){
                            endProgram(`Variable "${variable}" does not exist.`);
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
                config.showLoadingSpinner = true;
            break;
            case "filearg":
                if (!line.args || !line.args.name || !line.args.type || !line.args.value) {
                    endProgram(`Invalid filearg syntax.`);
                    break;
                }

                let name = line.args.name;
                let type = line.args.value;  

                if(variables["v:" + name] != undefined){
                    endProgram(`Variable "${name}" already exists.`);
                    break;
                }

                // count the number of variables with the type of "define"
                fileargCount++;

                if(args.length - 1 < fileargCount){
                    endProgram(`Missing argument ${fileargCount} (type ${type}).`);
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
                    endProgram(`String "${line.args.name}" already exists.`);
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
                    endProgram(`Integer "${line.args.name}" already exists.`);
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
            case "set":
                let variableName = "v:" + line.args?.variable;
                let value = line.args?.value;
        
                if (!variableName || !value) {
                    endProgram(`Invalid "set" declaration syntax.`);;
                    break;
                }

                if(variables[variableName] == undefined){
                    endProgram(`Variable "${variableName}" does not exist.`);
                    break;
                }

                for(let variable in variables){
                    if(variable == variableName){
                        value = value.replaceAll(new RegExp(`\\b${variableName}\\b`, 'g'), variables[variableName].value);

                        if(variables[variable].type == "int"){
                            // evaluate value
                            let parsedValue = evaluate(value);
                            if(isNaN(parsedValue) || parsedValue == null){
                                endProgram(`Invalid integer value.`);
                                break;
                            }
                        }
                    }   
                }

                let parsedValue;
                try {
                    parsedValue = new Function(`return (${value});`)();
                } catch (err) {
                    endProgram(`Error evaluating: "${value}".`);
                    break;
                }

                variables[variableName].value = parsedValue;
                parseNext();
            break;
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
                let elseIndex = formatted.lines.findIndex((line, index) => line.command == "else" && index > lineIndex);
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
                let color = line.args.color;
                let out = line.args.output;

                // Replace variables in the "out" statement
                for (let variable in variables) {
                    let variableRegex = new RegExp(`\\b${variable}\\b`, "g"); // Ensure full match for variable name
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
                    out = cleanInnerQuotes(out); // Clean any nested or extra quotes
                    parsedOut = new Function(`return (${out});`)(); // Evaluate the expression
                } catch (err) {
                    endProgram(`Error evaluating statement: "${out}".`);
                    break;
                }

                // Output the parsed result to the terminal
                createTerminalLine(parsedOut, ">", color);
                parseNext();
            } break;
            case "out": {
                if (!line.args) {
                    endProgram(`Invalid "out" syntax.`);
                    break;
                }

                let out = line.args;

                // Replace variables in the "out" statement
                for (let variable in variables) {
                    let variableRegex = new RegExp(`\\b${variable}\\b`, "g"); // Ensure full match for variable name
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
                    out = cleanInnerQuotes(out); // Clean any nested or extra quotes
                    parsedOut = new Function(`return (${out});`)(); // Evaluate the expression
                } catch (err) {
                    endProgram(`Error evaluating statement: "${out}".`);
                    break;
                }

                // Output the parsed result to the terminal
                createTerminalLine(parsedOut, ">");
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