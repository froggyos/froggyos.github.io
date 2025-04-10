const FroggyscriptMemory = {
    variables: {},
    functions: {},
};

let OS_RUNTIME_START = Date.now();

const defaultVariables = {
    Pi: {
        type: "Number",
        value: Math.PI,
        identifier: "Pi",
        mutable: false,
    },
    true: {
        type: "Boolean",
        value: true,
        identifier: "true",
        mutable: false,
    },
    false: {
        type: "Boolean",
        value: false,
        identifier: "false",
        mutable: false,
    },


    Time_OSRuntime: {
        type: "Number",
        value: 0,
        identifier: "Time_OSRuntime",
        mutable: false,
    },
    Time_ProgramRuntime: {
        type: "Number",
        value: 0,
        identifier: "Time_ProgramRuntime",
        mutable: false,
    },
    Time_MsEpoch: {
        type: "Number",
        value: Date.now(),
        identifier: "Time_MsEpoch",
        mutable: false,
    },
}

class ScriptError {
    constructor(type, message, line) {
        this.type = "Error"
        this.error = type
        this.value = message
        this.line = line
    }
}

function output(value) {
    createTerminalLine(value.toString(), "", {translate: false});
}

function outputWithFormatting(value, formatArray) {
    createTerminalLine(value.toString(), "", {translate: false, formatting: formatArray});
}

function resetTerminalForUse(interval){
    resetVariables()
    clearInterval(interval);
    setSetting("showSpinner", ["false"])
    setSetting("currentSpinner", [getSetting("defaultSpinner")]);
}

function outputError(token, interval) {
    createTerminalLine("", config.programErrorText.replace("{{}}", token.error), {translate: false});
    createTerminalLine(" ", "", {translate: false});
    createTerminalLine(token.value, "", {translate: false});
    createTerminalLine(`At line: ${token.line+1}`, "", {translate: false});
    resetTerminalForUse(interval);
    createEditableTerminalLine(config.currentPath + ">");
}

function resetVariables() {
    delete FroggyscriptMemory.variables;
    delete FroggyscriptMemory.functions;

    FroggyscriptMemory.variables = {};
    // initialize default variables
    Object.keys(defaultVariables).forEach(variableName => {
        let variableValue = defaultVariables[variableName];
        if(variableValue) {
            FroggyscriptMemory.variables[variableName] = variableValue;
        }
    });

    FroggyscriptMemory.functions = {};
}

// change this to evaluate the token and return the token
function evaluate(expression) {
    let variableNames = Object.keys(FroggyscriptMemory.variables);

    let scope = {};

    variableNames.forEach(variableName => {
        let variableValue = FroggyscriptMemory.variables[variableName];
        if(variableValue) {
            scope[variableName] = variableValue.value;
        }
    })

    return math.evaluate(expression, scope);
}

function getVariable(variableName) {
    return FroggyscriptMemory.variables[variableName];
}

function typeify(value, clock_interval) {
    let typeObj = {
        type: null,
        value: null,
        originalInput: value,
    };
    // string
    if(value.match(/^("|').*("|')$/g)) {
        typeObj.type = "String";
        typeObj.value = value.replace(/^("|')|("|')$/g, '');

        // match every instance of \$\[\w+\]
        let regex = /\$\|[^\|]+\|/g;
        let matches = value.match(regex);

        if(matches) {
            matches.forEach(match => {
                let expression = match.replace(/\$\||\|/g, '');
                try {
                    typeObj.value = typeObj.value.replace(match, evaluate(expression));
                } catch (e) {
                    typeObj = new ScriptError("EvaluationError", `Cannot evaluate [${expression}] in [${typeObj.originalInput}]`, clock_interval);
                }
            })
        }

    } else if(/(==|!=|>=|<=|>|<)/.test(value)) { // comparison operators
        typeObj.type = "Boolean";
        let error = false;
        try {
            evaluate(value)
        } catch (e) {
            error = true;
        }

        if (error) {
            typeObj = new ScriptError("EvaluationError", `Cannot evaluate [${value}]`, clock_interval);
        } else {
            typeObj.value = evaluate(value);

            let variableNames = Object.keys(FroggyscriptMemory.variables).join('|');
            let regex = new RegExp(`(${variableNames})`, 'g');
            if(variableNames && variableNames.length > 0) {
                // replace the variable names in the expression with their values for evaluation
                typeObj.originalInput = typeObj.originalInput.replace(regex, (match) => {
                    let variableValue = getVariable(match);
                    if(variableValue) {
                        return variableValue.value;
                    } else {
                        return match; // fallback to original if not found
                    }
                });
            }
        }

    } else if(value.match(/^[a-zA-Z_]*$/g)) { // identifier (variable name)
        typeObj.type = "VariableIdentifier";
        let variableValue = getVariable(value);
        if (variableValue != undefined) {
            typeObj.value = variableValue.value;
            typeObj.type = variableValue.type;
            typeObj.originalInput = "VARIABLE_IDENTIFIER:"+value;
        } else {
            typeObj = new ScriptError("ReferenceError", `Variable [${value}] is not defined`, clock_interval);
        }

    } else if(value.match(/\d*|\+|\-|\\|\*|\^/g)) {
        let error = false;
        let errMsg = null;
        try {
            evaluate(value);
        } catch (e) {
            error = true;
            errMsg = e.message;
        }

        if (error) {
            typeObj = new ScriptError("EvaluationError", `Cannot evaluate [${value}]`, clock_interval);
        } else {
            typeObj.type = "Number";
            typeObj.value = evaluate(value);

            if(Object.keys(FroggyscriptMemory.variables).length > 0) {
                let variableNames = Object.keys(FroggyscriptMemory.variables).join('|');
                let regex = new RegExp(`(${variableNames})`, 'g');
                typeObj.originalInput = typeObj.originalInput.replace(regex, (match) => {
                    return `VARIABLE_IDENTIFIER:${match}`;
                });
            }
        }
    } else {
        typeObj = new ScriptError("TypeifyError", `Cannot coalesce [${value}]`, clock_interval);
    }

    return typeObj;
}

function writeVariable(identifier, type, value, mut) {
    FroggyscriptMemory.variables[identifier] = {
        type: type,
        value: value,
        identifier: identifier,
        mutable: mut
    };
}

function processSingleLine(input, clock_interval) {
    input = input.trim();
    
    let token = {};
    let keyword = input.split(" ")[0];

    token.keyword = keyword;

    switch (keyword) {
        case "stringify": {
            let variable = input.split(" ")[1].trim();
            if(typeify(variable, clock_interval).type == "Error") {
                token = typeify(variable, clock_interval);
            } else {
                token = { ...token, variableName: variable, variableType: getVariable(variable).type };
            }
        } break;

        case "outf": {
            // match the first instance of \{.*\} 
            let formatting = input.match(/\{.*?\}/)

            if(formatting == null){
                token = new ScriptError("SyntaxError", `[outf] must be followed by a formatting string`, clock_interval);
            } else {
                formatting = formatting[0].replace(/[\{\}]/g, "").trim().split("|");
                let formatArray = [];

                let formatError = null;

            
                for(let i = 0; i < formatting.length; i++){
                    let formattingObject = {};
                    formatting[i].split(",").forEach((format) => {
                        if(format === "") return;
                        format.trim();
                        let [key, value] = format.split("=").map(value => value.trim());

                        if(key == "t" || key == "b" || key == "i"){
                            formattingObject.type = "blanket";
                            formattingObject[key] = value;
                            // if key is i and value isnt 1 or 0
                            if(key == "i" && value != "1" && value != "0") {
                                token = new ScriptError("TypeError", `[${key}] must be followed by a 1 or 0, found ${value}`, clock_interval);
                            }
                        } else if (key == "tr" || key == "br" || key == "ir") {
                            let [start, end] = value.split("-").map(value => value.trim());

                            let rangeError = false;

                            try {
                                typeify(start, clock_interval);
                                typeify(end, clock_interval);
                            } catch (e){
                                rangeError = true;
                            }

                            if(rangeError){
                                token = new ScriptError("TypeError", `[${key}] in:\n${formatting[i].trim()}\nmust be followed by a range (start-end)`, clock_interval);
                            } else {

                                let typedStart = typeify(start, clock_interval);
                                let typedEnd = typeify(end, clock_interval);

                                if(typedStart.type != "Number") {
                                    token = new ScriptError("TypeError", `[${key}] range start in:\n${formatting[i].trim()}\nmust be followed by a Number, found type ${typedStart.type} ${typedStart.type == "Error" ? "(unresolved variable?)":""}`, clock_interval);
                                } else if(typedEnd.type != "Number") {
                                    token = new ScriptError("TypeError", `[${key}] range end in:\n${formatting[i].trim()}\nmust be followed by a Number, found type ${typedEnd.type} ${typedEnd.type == "Error" ? "(unresolved variable?)":""}`, clock_interval);
                                } else {

                                    if(typedStart.type == "Error") formatError = typedStart;
                                    else if(typedEnd.type == "Error") formatError = typedEnd;
                                    else {
                                        formattingObject.type = "range";
                                        formattingObject[`${key}_start`] = typedStart.value.toString();
                                        formattingObject[`${key}_end`] = typedEnd.value.toString();
                                    }
                                }
                            }
                        }
                    })
                    formatArray.push(formattingObject);
                }

                if(formatError != null){
                    token = {...token, ...formatError }
                } else {
                    let output = input.replace(/outf/g, "").replace(/\{.*?\}/, "").trim()
                    let typedOutput = typeify(input.replace(/outf/g, "").replace(/\{.*?\}/, "").trim(), clock_interval);

                    
                    if(output == "") {
                        token = new ScriptError("SyntaxError", `[outf] must be followed by a value`, clock_interval);
                    } else if(typedOutput.type == "Error"){
                        token = new ScriptError(typedOutput.error, typedOutput.value, typedOutput.line)
                    } else {
                        let error = false;
                        let errorIndex = null;
                        formatArray.forEach((format, i) => {
                            if(format.t) if(format.t.length != 3) {
                                error = "t";
                                errorIndex = i
                            }
                            if(format.b) if(format.b.length != 3) {
                                error = "b";
                                errorIndex = i
                            }
                        })

                        if(error != false){
                            token = new ScriptError("SyntaxError", `[${error}] in:\n${formatting[errorIndex].trim()}\nmust be followed by a color code (cXX)`, clock_interval);
                        } else token = { ...token, format: formatArray, output: typedOutput.value };
                    }
                }
            }
        } break;

        case "ask": {
            let variable = input.split(" ")[1].trim();
            let prefix = input.replace(`ask ${variable}`, "").trim();

            if(prefix == "") prefix = "'?'";

            if(variable == undefined) {
                token = new ScriptError("SyntaxError", `[ask] must be followed by a variable name`, clock_interval);
            } else if(getVariable(variable) == undefined) {
                token = new ScriptError("ReferenceError", `Variable [${variable}] does not exist`, clock_interval);
            } else {
                let typedPrefix = typeify(prefix, clock_interval);
                if(typedPrefix.type == "Error") {
                    token = typedPrefix;
                } else if(typedPrefix.type != "String") {
                    token = new ScriptError("TypeError", `[ask] prefix must be type String, found type ${typedPrefix.type}`, clock_interval);
                } else {
                    token = { ...token, variableName: variable, variableType: getVariable(variable).type, prefix: typedPrefix.value };
                }
            }
        } break;
        case "filearg": {
            let variable = input.split(" ")[1].trim();
            let type = input.split(" ")[2].trim();

            if(type !== "String" && type !== "Number") {
                token = new ScriptError("TypeError", `[filearg] must be followed by a type (String, Number), found [${type}]`, clock_interval);
            } else if(variable == undefined) {
                token = new ScriptError("SyntaxError", `[filearg] must be followed by a variable name`, clock_interval);
            } else {
                token = { ...token, variableName: variable, variableType: type };
            }
        } break;

        case "func": {
            let funcName = input.replace(/^func\s+/, '').split(' ')[0].trim();

            token = { ...token, name: funcName };

        } break;

        case "endfunc": {
            let matchingFuncIndex = +input.split(" ")[1]; // remove the keyword to find the func start index

            token = { ...token, match: matchingFuncIndex }
        } break;

        case "f:": {
            let functionName = input.replace(/^f:\s+/, '').split(' ')[0].trim();

            if(FroggyscriptMemory.functions[functionName] == undefined) {
                token = new ScriptError("ReferenceError", `Function [${functionName}] does not exist`, clock_interval);
            }
            else token = { ...token, name: functionName };
        } break;

        case "endquickloop": {
            let startOfQuickloopIndex = +input.split(" ")[1]; // remove the keyword to find the loop start index

            token = { ...token, goto: startOfQuickloopIndex }
        } break;

        case "quickloop": {
            let times = input.replace(/^quickloop\s+/, '').trim();
            if(!times) {
                token = new ScriptError("SyntaxError", `[quickloop] must have a loop count`, clock_interval);
                break;
            }
            let timesType = typeify(times, clock_interval);
            if(timesType.type !== "Number" && timesType.type !== "Error") {
                token = new ScriptError("TypeError", `[quickloop] must evaluate to Number, found type ${timesType.type}`, clock_interval);
            } else {
                token = {...token, ...timesType, originalInput: times };
            }
        } break;

        case "wait": {
            let waitTime = input.replace(/^wait\s+/, '').trim();
            if(!waitTime) {
                token = new ScriptError("SyntaxError", `[wait] cannot be empty`, clock_interval);
                break;
            }
            let waitTimeType = typeify(waitTime, clock_interval);
            if(waitTimeType.type !== "Number" && waitTimeType.type !== "Error") {
                token = new ScriptError("TypeError", `[wait] must evaluate to Number, found type ${waitTimeType.type}`, clock_interval);
                
            } else {
                token = {...token, ...waitTimeType, originalInput: waitTime };
            }
        } break;

        case "endprog": {
            token = { ...token };
        } break;

        case "endloop": {
            let startOfLoopIndex = +input.split(" ")[1]; // remove the keyword to find the loop start index

            token = { ...token, goto: startOfLoopIndex }
        } break;

        case "loop": {
            let condition = input.replace(/^loop\s+/, '').trim();
            if(!condition) {
                token = new ScriptError("SyntaxError", `[loop] condition cannot be empty`, clock_interval);
                break;
            }
            let conditionType = typeify(condition, clock_interval);
            if(conditionType.type !== "Boolean" && conditionType.type !== "Error") {
                token = new ScriptError("TypeError", `[loop] condition must evaluate to Boolean, found type ${conditionType.type}`, clock_interval);
            } else {
                token = {...token, ...conditionType, originalInput: condition, endloopIndex: null };
            }
        } break;

        case "if": {
            let condition = input.replace(/^if\s+/, '').split('then')[0].trim();
            if(!condition) {
                token = new ScriptError("SyntaxError", `[if] condition cannot be empty`, clock_interval);
                break;
            }
            let conditionType = typeify(condition, clock_interval);
            if(conditionType.type !== "Boolean" && conditionType.type !== "Error") {
                token = new ScriptError("TypeError", `[if] condition must evaluate to Boolean, found type ${conditionType.type}`, clock_interval);
            } else {
                token = {...token, ...conditionType, endKeywordIndex: null, elseKeywordIndex: null };
            }
        } break;

        case "out": {
            let argument = input.replace(/^out\s+/, '').trim();
            token = {...token, ...typeify(argument, clock_interval) };
        } break;

        case "cstr":
        case "str": {
            // str(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^(c?)str\s+\w+\s+\=\s+/g)) {
                token = new ScriptError("SyntaxError", `[${keyword}] declaration must be followed by a variable assignment`, clock_interval);
            } else {
                let assignedValue = input.replace(/^(c?)str\s+/, '').split('=')[1].trim();
                let typeValue = typeify(assignedValue, clock_interval);
                if(typeValue.type != "String" && typeValue.type != "Error"){
                    token = new ScriptError("TypeError", `[${keyword}] declaration can only be assigned type String, found type ${typeValue.type}`, clock_interval);
                } else {
                    let identifier = input.replace(/^(c?)str\s+/, '').split('=')[0].trim();

                    if(getVariable(identifier) != undefined){
                        token = new ScriptError("ReferenceError", `Variable [${identifier}] already exists, cannot override`, clock_interval);
                    } else {
                        token = {...token, ...typeify(assignedValue, clock_interval), identifier: identifier }; 
                        if(keyword == "str") token = { ...token, mutable: true }
                        else token = { ...token, mutable: false };
                    }
                }
            }
        } break;

        case "cnum":
        case "num": {
            // num(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^(c?)num\s+\w+\s+\=\s+/g)) {
                token = new ScriptError("SyntaxError", `[${keyword}] declaration must be followed by a variable assignment`, clock_interval);
            } else {
                let assignedValue = input.replace(/^(c?)num\s+/, '').split('=')[1].trim();
                let typeValue = typeify(assignedValue, clock_interval);
                if(typeValue.type != "Number" && typeValue.type != "Error"){
                    token = new ScriptError("TypeError", `[${keyword}] declaration can only be assigned type Number, found type ${typeValue.type}`, clock_interval);
                } else {
                    let identifier = input.replace(/^(c?)num\s+/, '').split('=')[0].trim();

                    if(getVariable(identifier) != undefined){
                        token = new ScriptError("ReferenceError", `Variable [${identifier}] already exists, cannot override`, clock_interval);
                    } else {
                        let typed = typeify(assignedValue, clock_interval)
                        token = {...token, ...typed, identifier: identifier };
                        if(typed.type == "Error") {
                            token = typed;
                        } else {
                            if(/\bpi\b/g.test(token.originalInput)) {
                                token = new ScriptError("EvaluationError", `[pi] is unreliable, use [Pi] instead`, clock_interval);
                            } else {
                                if(keyword == "num") token = { ...token, mutable: true }
                                else token = { ...token, mutable: false };
                            }
                        }
                    }
                }
            }
        } break;

        case "cbln":
        case "bln": {
            // bln(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^(c?)bln\s+\w+\s+\=\s+/g)) {
                token = new ScriptError("SyntaxError", `[${keyword}] declaration must be followed by a variable assignment`, clock_interval);
            } else {
                let assignedValue = input.replace(/^(c?)bln\s+/, '').split('=')[1].trim();
                let typeValue = typeify(assignedValue, clock_interval);
                if(typeValue.type != "Boolean" && typeValue.type != "Error"){
                    token = new ScriptError("TypeError", `[${keyword}] declaration can only be assigned type Boolean, found type ${typeValue.type}`, clock_interval);
                } else {
                    let identifier = input.replace(/^(c?)bln\s+/, '').split('=')[0].trim();

                    if(getVariable(identifier) != undefined){
                        token = new ScriptError("ReferenceError", `Variable [${identifier}] already exists, cannot override`, clock_interval);
                    } else {
                        token = {...token, ...typeify(assignedValue, clock_interval), identifier: identifier };
                        if(keyword == "bln") token = { ...token, mutable: true }
                        else token = { ...token, mutable: false };
                    }
                }
            }
        } break;

        case "set": {
            // set(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^set\s+\w+\s+\=\s+/g)) {
                token = new ScriptError("SyntaxError", `[set] declaration must be followed by a variable assignment`, clock_interval);
            } else {
                let assignedValue = input.replace(/^set\s+/, '').split('=')[1].trim();
                let identifier = input.replace(/^set\s+/, '').split('=')[0].trim();

                token = {...token, ...typeify(assignedValue, clock_interval), identifier: identifier };
            }
        } break;

        case "free": {
            // free(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^free\s+\w+/g)) {
                token = new ScriptError("SyntaxError", `[free] declaration must be followed by a variable name`, clock_interval);
            } else {
                let identifier = input.replace(/^free\s+/, '').split(' ')[0].trim();
                token = { ...token, identifier: identifier };
            }
        } break;

        case "--": {
            token = {
                keyword: "--",
                type: "Comment",
                content: input.replace(/^--\s*/, '').trim()
            }
        } break;

        case "goto": { 
            // goto(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^goto\s+/g)) {
                token = new ScriptError("SyntaxError", `[goto] declaration must be followed by a variable name`, clock_interval);
            } else {
                let identifier = input.replace(/^goto\s+/, '').split(' ')[0].trim();
                let typeifyValue = typeify(identifier, clock_interval);
                if(typeifyValue.type != "Number") {
                    token = new ScriptError("TypeError", `[goto] declaration must be followed by a Number, found type ${typeifyValue.type}`, clock_interval);
                } else {
                    token = {...token, ...typeifyValue};
                }
            }
        }
    }
    return token;
}

function interpreter(input, fileArguments) {
    let lines = input.split('\n').map(x => x.trim()).filter(x => x.length > 0 && x !== "--");
    let clock_interval = 0;

    let fileArgumentCount = 0;

    resetVariables()

    if(lines[lines.length - 1].trim() !== "endprog") {
        output(`PrecheckError -> [endprog] must be the last line of the program <-`);
        createEditableTerminalLine(config.currentPath + ">");
        return;
    }

    let CLOCK_PAUSED = false;

    const PROGRAM_RUNTIME_START = Date.now();

    function interpretSingleLine(interval, single_input) {
        let line = single_input;
        
        let token = processSingleLine(line, clock_interval);
        if(token.type === "Error") {
            outputError(token, interval);
            return;
        } else {
            // process tokens here =======================================================
            switch(token.keyword) {
                case "stringify": {
                    if(getVariable(token.variableName).mutable === false) {
                        token = new ScriptError("PermissionError", `Variable [${token.variableName}] is immutable and cannot be reassigned`, clock_interval);
                    }else if(token.variableType != "Number"){
                        token = new ScriptError("TypeError", `[${token.variableName}] must be of type Number`, clock_interval);
                    } else {
                        let variable = getVariable(token.variableName);
                        writeVariable(variable.identifier, "String", variable.value.toString(), variable.mutable);
                    }
                } break;

                case "clearterminal": {
                    document.getElementById("terminal").innerHTML = "";
                } break;

                case "outf": {
                    outputWithFormatting(token.output, token.format);
                } break;

                case "ask": {
                    CLOCK_PAUSED = true;
                    let span = document.createElement('span');
                    let inputElement = document.createElement('div');
                    let elementToAppend = document.createElement('div');
            
                    inputElement.setAttribute('contenteditable', 'plaintext-only');
                    inputElement.setAttribute('spellcheck', 'true');
            
                    span.textContent = token.prefix;
            
                    elementToAppend.appendChild(span);
                    elementToAppend.appendChild(inputElement);
            
                    elementToAppend.classList.add('line-container');
            
                    terminal.appendChild(elementToAppend);
                    inputElement.focus();

                    setSetting("showSpinner", "true");
                    inputElement.addEventListener('keydown', function(e){
                        if(e.key == "Enter") e.preventDefault();
                    }); 

                    inputElement.addEventListener('keyup', function(e){
                        if(e.key == "Enter") {
                            setSetting("showSpinner", "false");
                            e.preventDefault();
                            inputElement.setAttribute('contenteditable', 'false');

                            token = { ...token, value: inputElement.textContent };

                            let expectedType = getVariable(token.variableName).type;

                            if(expectedType == "Number" && /^\d+$/.test(token.value)) token.value = parseInt(token.value);
                            else token.value = `"${token.value}"`;
                            
                            lines[clock_interval-1] = `set ${token.variableName} = ${token.value}`;                       
                            CLOCK_PAUSED = false;
                            clock_interval--;        
                        }
                    }); 

                } break;

                case "filearg": {
                    let expectedType = token.variableType;

                    let inputValue = fileArguments[fileArgumentCount];

                    if(expectedType === "Number") inputValue = parseFloat(inputValue);

                    if(inputValue == undefined){
                        token = new ScriptError("TypeError", `Missing file argument [${fileArgumentCount}] (expecting type ${expectedType})`, clock_interval);

                    } else if(FroggyscriptMemory.variables[token.variableName] != undefined) {
                        token = new ScriptError("ReferenceError", `Variable [${token.variableName}] already exists, cannot override`, clock_interval);

                    } else if(isNaN(inputValue) && expectedType === "Number") {
                        token = new ScriptError("TypeError", `File argument [${fileArgumentCount}] must be of type [${expectedType}]`, clock_interval);
                    } else {
                        writeVariable(token.variableName, token.variableType, inputValue, false);

                        fileArgumentCount++;
                    }
                    
                } break;

                case "func": {
                    // find matching endfunc
                    let stack = [];
                    let endIndex = null;
                    for (let i = clock_interval + 1; i < lines.length; i++) {
                        let currentKeyword = lines[i].trim().split(" ")[0];
                        
                        if (currentKeyword === "func") {
                            stack.push("func");
                        } else if (currentKeyword === "endfunc") {
                            if (stack.length === 0) {
                                endIndex = i;
                                break;
                            } else {
                                stack.pop();
                            }
                        }
                    }
                    token.endfuncIndex = endIndex;

                    if (endIndex === null) {
                        token = new ScriptError("SyntaxError", `Missing matching [endfunc] for [func]`, clock_interval);
                    }

                    lines[token.endfuncIndex] += " " + clock_interval;

                    FroggyscriptMemory.functions[token.name] = {
                        start: clock_interval,
                        end: token.endfuncIndex,
                        name: token.name,
                    }

                    clock_interval = token.endfuncIndex;
                } break;

                case "f:": {
                    let functionName = token.name;
                    let func = FroggyscriptMemory.functions[functionName];
                    let funcStart = func.start;
                    let funcEnd = func.end;
                    let funcLines = lines.slice(funcStart + 1, funcEnd).map(x => x.trim()).filter(x => x.length > 0 && x !== "--");

                    for(let i = 0; i < funcLines.length; i++) {
                        let line = funcLines[i];
                        let token = processSingleLine(line, clock_interval);
                        if(token.type === "Error") {
                            outputError(token);
                            return;
                        } else {
                            interpretSingleLine(interval, line);
                        }
                    }
                } break;

                case "endquickloop": {
                    let loopAmount = typeify(lines[token.goto].replace("quickloop", "").trim(), clock_interval).value;

                    let linesToLoop = lines.slice(token.goto + 1, clock_interval).map(x => x.trim()).filter(x => x.length > 0 && x !== "--");

                    for(let i = 0; i < loopAmount - 1; i++) {
                        for(let j = 0; j < linesToLoop.length; j++) {
                            let line = linesToLoop[j];
                            let token = processSingleLine(line, clock_interval);
                            if(token.type === "Error") {
                                outputError(token);
                                return;
                            } else {
                                interpretSingleLine(interval, line);
                            }
                        }
                    }
                } break; 

                case "quickloop": {
                    let stack = [];
                    let endIndex = null;
                    for (let i = clock_interval + 1; i < lines.length; i++) {
                        let currentKeyword = lines[i].trim().split(" ")[0];
                        
                        if (currentKeyword === "quickloop") {
                            stack.push("quickloop");
                        } else if (currentKeyword === "endquickloop") {
                            if (stack.length === 0) {
                                endIndex = i;
                                break;
                            } else {
                                stack.pop();
                            }
                        }
                    }

                    if(endIndex === null) {
                        token = new ScriptError("SyntaxError", `Missing matching [endquickloop] for [quickloop]`, clock_interval);
                    } else {
                        setSetting("showSpinner", ["true"])
                        setSetting("currentSpinner", ["quickloop-in-progress"])

                        token.endQuickloopIndex = endIndex;
                        lines[token.endQuickloopIndex] += " " + clock_interval;
                    }
                } break;

                case "wait": {
                    let ms = token.value;

                    CLOCK_PAUSED = true;

                    setTimeout(() => {
                        CLOCK_PAUSED = false;
                    }, ms);

                } break;

                case "endprog": {
                    resetVariables()
                    clearInterval(interval);
                    setSetting("showSpinner", ["false"])
                    setSetting("currentSpinner", [getSetting("defaultSpinner")]);
                    createEditableTerminalLine(config.currentPath + ">");
                    return;
                } break;

                case "endloop": {
                    if(isNaN(token.goto)) {
                        token = new ScriptError("SyntaxError", `[endloop] cannot be used without a matching [loop]`, clock_interval);
                    }

                    let loopCondition = lines[token.goto].replace("loop", "").trim();
                    if(evaluate(loopCondition)) {
                        clock_interval = token.goto;
                        setSetting("showSpinner", ["true"])
                    } else {
                        setSetting("showSpinner", ["false"])
                    }
                } break;

                case "loop": {
                    // find paired endloop index
                    let stack = [];
                    let endIndex = null;
                    for (let i = clock_interval + 1; i < lines.length; i++) {
                        let currentKeyword = lines[i].trim().split(" ")[0];
                        
                        if (currentKeyword === "loop") {
                            stack.push("loop");
                        } else if (currentKeyword === "endloop") {
                            if (stack.length === 0) {
                                endIndex = i;
                                break;
                            } else {
                                stack.pop();
                            }
                        }
                    }
                    token.endloopIndex = endIndex;

                    if (endIndex === null) {
                        token = new ScriptError("SyntaxError", `Missing matching [endloop] for [loop]`, clock_interval);
                    }

                    if(!token.value){
                        clock_interval = token.endloopIndex;
                    } else {
                        lines[token.endloopIndex] += " " + clock_interval;
                    }
                } break;

                case "free": {
                    if(getVariable(token.identifier) == undefined) {
                        token = new ScriptError("ReferenceError", `Variable [${token.identifier}] does not exist`, clock_interval);

                    } else if(getVariable(token.identifier).mutable === false) {
                        token = new ScriptError("PermissionError", `Variable [${token.identifier}] is immutable and cannot be freed`, clock_interval);
                    } else {
                        delete FroggyscriptMemory.variables[token.identifier];
                    }
                } break;

                case "if": {
                    let stack = [];
                    let elseIndex = null;
                    let endIndex = null;
                
                    for (let i = clock_interval + 1; i < lines.length; i++) {
                        let currentKeyword = lines[i].trim().split(" ")[0];
                
                        if (currentKeyword === "if") {
                            stack.push("if");
                        } else if (currentKeyword === "endif") {
                            if (stack.length === 0) {
                                endIndex = i;
                                break;
                            } else {
                                stack.pop();
                            }
                        } else if (currentKeyword === "else" && stack.length === 0) {
                            elseIndex = i;
                        }
                    }

                    token.elseKeywordIndex = elseIndex;
                    token.endKeywordIndex = endIndex;
                
                    if (endIndex === null) {
                        token = {
                            type: "Error",
                            value: `SyntaxError -> Missing matching [endif] for [if] <-`,

                        }
                    } else {
                        if (token.value === true) {
                            if (elseIndex !== null) {
                                lines[elseIndex] = `goto ${endIndex}`;
                            }
                            // Do nothing if linkedElse is null
                        } else if (token.value === false) {
                            if (elseIndex === null) {
                                clock_interval = endIndex;
                            } else {
                                clock_interval = elseIndex;
                            }
                        }
                    }
                } break;

                case "set": {
                    let referencedVar = getVariable(token.identifier);

                    if (referencedVar == undefined) {
                        token = new ScriptError("ReferenceError", `Variable [${token.identifier}] does not exist`, clock_interval);
                    } else if (referencedVar.mutable === false) {
                        token = new ScriptError("PermissionError", `Variable [${token.identifier}] is immutable and cannot be reassigned`, clock_interval);
                    } else {
                        // Write the new value to the variable
                        if (token.type === "Error") {
                            token = new ScriptError("EvaluationError", `Cannot evaluate [${token.originalInput}]`, clock_interval);
                        } else if(referencedVar.type !== token.type) {
                            token = new ScriptError("TypeError", `Cannot assign a value of type [${token.type}] to variable [${token.identifier}], which\nis of type [${referencedVar.type}]`, clock_interval);
                        } else {
                            writeVariable(token.identifier, referencedVar.type, token.value, true);
                        }
                    }
                } break;

                case "cstr":
                case "cnum":
                case "cbln": {
                    writeVariable(token.identifier, token.type, token.value, false);
                } break;
                
                case "num":
                case "bln":
                case "str": {
                    writeVariable(token.identifier, token.type, token.value, true);
                } break;

                case "out": {
                    output(token.value);
                } break;

                case "goto": {
                    let newI = token.value;
                    if(newI >= 0 && newI < lines.length) {
                        clock_interval = newI - 1;
                    } else {
                        token = new ScriptError("ReferenceError", `Line ${newI} does not exist`, clock_interval);
                    }
                } break;

                case "else":
                case "endfunc":
                case "endif": { } break;

                default: {
                    token = new ScriptError("InterpreterError", `Unknown keyword [${token.keyword}]`, clock_interval);
                } break;
            }

            if(token.type === "Error") {
                outputError(token, interval);
                return;
            }
            if(clock_interval >= lines.length) {
                resetTerminalForUse(interval);
                return;
            }
        }

        return token;
    }

    let clock = setInterval(() => {
        if(CLOCK_PAUSED == false) {

            FroggyscriptMemory.variables.Time_OSRuntime.value = Date.now() - OS_RUNTIME_START;
            FroggyscriptMemory.variables.Time_ProgramRuntime.value = Date.now() - PROGRAM_RUNTIME_START;
            FroggyscriptMemory.variables.Time_MsEpoch.value = Date.now();

            if(clock_interval < lines.length) {
                let line = lines[clock_interval]
                let token = interpretSingleLine(clock, line);
                clock_interval++;
            } 
        }
    }, 1);

    // window.pauseInterpreter = () => {
    //     CLOCK_PAUSED = true;
    // }

    // window.debugFroggyScript = () => {
    //     CLOCK_PAUSED = false;
    //     setTimeout(() => CLOCK_PAUSED = true, 1);
    // }

    document.body.addEventListener("keydown", function(e){
        if(e.key == "Delete"){
            clearInterval(clock);
            createTerminalLine("Program escaped.", config.alertText, {translate: false});
            setSetting("showSpinner", ["false"])
            createEditableTerminalLine(config.currentPath + ">");
        }
    }, {once: true});
}