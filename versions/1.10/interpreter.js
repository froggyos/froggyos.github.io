const FroggyscriptMemory = {
    variables: {}
};

const defaultVariables = {
    Pi: {
        type: "Number",
        value: Math.PI,
        identifier: "Pi",
        mutable: false,
    }
}

class Error {
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

function outputError(token) {
    createTerminalLine("", config.programErrorText.replace("{{}}", token.error), {translate: false});
    createTerminalLine(" ", "", {translate: false});
    createTerminalLine(token.value, "", {translate: false});
    createTerminalLine(`At line: ${token.line}`, "", {translate: false});
}

function resetVariables() {
    delete FroggyscriptMemory.variables;
    FroggyscriptMemory.variables = {};
    // initialize default variables
    Object.keys(defaultVariables).forEach(variableName => {
        let variableValue = defaultVariables[variableName];
        if(variableValue) {
            FroggyscriptMemory.variables[variableName] = variableValue;
        }
    });
}

// change this to evaluate the token and return the token
function evaluate(expression) {
    let variableNames = Object.keys(FroggyscriptMemory.variables).filter(variableName => {
        let variableValue = FroggyscriptMemory.variables[variableName];
        if(variableValue && (variableValue.type === "Number")) {
            return true;
        }
        return false;
    })

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

function typeify(value) {
    let typeObj = {
        type: null,
        value: null,
        originalInput: value,
    };
    // string
    if(value.match(/^("|').*("|')$/g)) {
        typeObj.type = "String";
        typeObj.value = value.replace(/^("|')|("|')$/g, '');

        // string literals
        let regex = /\[v:([a-zA-Z_]*)\]/g; // find all [v:variable_name]
        typeObj.value = typeObj.value.replace(regex, (match, variableName) => {
            let variableValue = getVariable(variableName);
            if(variableValue != undefined) {
                return variableValue.value;
            } else {
                return match;
            }
        });

    } else if(value === "true" || value === "false") {
        typeObj.type = "Boolean";
        typeObj.value = (value === "true");

    } else if(/(==|!=|>=|<=|>|<)/.test(value)) { // comparison operators
        typeObj.type = "Boolean";
        let error = false;
        try {
            evaluate(value)
        } catch (e) {
            error = true;
        }

        if (error) {
            typeObj = new Error("EvaluationError", `cannot evaluate [${value}]`, clock_interval);
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
            typeObj = new Error("ReferenceError", `variable [${value}] is not defined`, clock_interval);
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
            typeObj = new Error("EvaluationError", `cannot evaluate [${value}]`, clock_interval);
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
        typeObj = new Error("TypeifyError", `cannot evaluate [${value}]`, clock_interval);
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
        case "wait": {
            let waitTime = input.replace(/^wait\s+/, '').trim();
            if(!waitTime) {
                token = new Error("SyntaxError", `[wait] cannot be empty`, clock_interval);
                break;
            }
            let waitTimeType = typeify(waitTime);
            if(waitTimeType.type !== "Number" && waitTimeType.type !== "Error") {
                token = new Error("TypeError", `[wait] must evaluate to Number, found type ${waitTimeType.type}`, clock_interval);
                
            } else {
                token = {...token, ...waitTimeType, originalInput: waitTime };
            }
        } break;

        case "endprog": {
            token = { ...token };
        }
        case "endloop": {
            let startOfLoopIndex = +input.split(" ")[1]; // remove the keyword to find the loop start index

            token = { ...token, goto: startOfLoopIndex }
        } break;

        case "loop": {
            let condition = input.replace(/^loop\s+/, '').trim();
            if(!condition) {
                token = new Error("SyntaxError", `[loop] condition cannot be empty`, clock_interval);
                break;
            }
            let conditionType = typeify(condition);
            if(conditionType.type !== "Boolean" && conditionType.type !== "Error") {
                token = new Error("TypeError", `[loop] condition must evaluate to Boolean, found type ${conditionType.type}`, clock_interval);
            } else {
                token = {...token, ...conditionType, originalInput: condition, endloopIndex: null };
            }
        } break;

        case "if": {
            let condition = input.replace(/^if\s+/, '').split('then')[0].trim();
            if(!condition) {
                token = new Error("SyntaxError", `[if] condition cannot be empty`, clock_interval);
                break;
            }
            let conditionType = typeify(condition);
            if(conditionType.type !== "Boolean" && conditionType.type !== "Error") {
                token = new Error("TypeError", `[if] condition must evaluate to Boolean, found type ${conditionType.type}`, clock_interval);
            } else {
                token = {...token, ...conditionType, endKeywordIndex: null, elseKeywordIndex: null };
            }
        } break;

        case "out": {
            let argument = input.replace(/^out\s+/, '').trim();
            token = {...token, ...typeify(argument) };
        } break;

        case "cstr":
        case "str": {
            // str(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^(c?)str\s+\w+\s+\=\s+/g)) {
                token = new Error("SyntaxError", `[${keyword}] declaration must be followed by a variable assignment`, clock_interval);
            } else {
                let assignedValue = input.replace(/^(c?)str\s+/, '').split('=')[1].trim();
                let typeValue = typeify(assignedValue);
                if(typeValue.type != "String" && typeValue.type != "Error"){
                    token = new Error("TypeError", `[${keyword}] declaration can only be assigned type String, found type ${typeValue.type}`, clock_interval);
                } else {
                    let identifier = input.replace(/^(c?)str\s+/, '').split('=')[0].trim();

                    if(getVariable(identifier) != undefined){
                        token = new Error("ReferenceError", `variable [${identifier}] already exists, cannot override`, clock_interval);
                    } else {
                        token = {...token, ...typeify(assignedValue), identifier: identifier }; 
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
                token = new Error("SyntaxError", `[${keyword}] declaration must be followed by a variable assignment`, clock_interval);
            } else {
                let assignedValue = input.replace(/^(c?)num\s+/, '').split('=')[1].trim();
                let typeValue = typeify(assignedValue);
                if(typeValue.type != "Number" && typeValue.type != "Error"){
                    token = new Error("TypeError", `[${keyword}] declaration can only be assigned type Number, found type ${typeValue.type}`, clock_interval);
                } else {
                    let identifier = input.replace(/^(c?)num\s+/, '').split('=')[0].trim();

                    if(getVariable(identifier) != undefined){
                        token = new Error("ReferenceError", `variable [${identifier}] already exists, cannot override`, clock_interval);
                    } else {
                        token = {...token, ...typeify(assignedValue), identifier: identifier };
                        if(token.originalInput.includes("pi")) {
                            token = new Error("EvaluationError", `EvaluationError -> [pi] is unreliable, use [Pi] instead`, clock_interval);
                        } else {
                            if(keyword == "num") token = { ...token, mutable: true }
                            else token = { ...token, mutable: false };
                        }
                    }
                }
            }
        } break;

        case "cbln":
        case "bln": {
            // bln(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^(c?)bln\s+\w+\s+\=\s+/g)) {
                token = new Error("SyntaxError", `[${keyword}] declaration must be followed by a variable assignment`, clock_interval);
            } else {
                let assignedValue = input.replace(/^(c?)bln\s+/, '').split('=')[1].trim();
                let typeValue = typeify(assignedValue);
                if(typeValue.type != "Boolean" && typeValue.type != "Error"){
                    token = new Error("TypeError", `[${keyword}] declaration can only be assigned type Boolean, found type ${typeValue.type}`, clock_interval);
                } else {
                    let identifier = input.replace(/^(c?)bln\s+/, '').split('=')[0].trim();

                    if(getVariable(identifier) != undefined){
                        token = new Error("ReferenceError", `variable [${identifier}] already exists, cannot override`, clock_interval);
                    } else {
                        token = {...token, ...typeify(assignedValue), identifier: identifier };
                        if(keyword == "bln") token = { ...token, mutable: true }
                        else token = { ...token, mutable: false };
                    }
                }
            }
        } break;

        case "set": {
            // set(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^set\s+\w+\s+\=\s+/g)) {
                token = new Error("SyntaxError", `[set] declaration must be followed by a variable assignment`, clock_interval);
            } else {
                let assignedValue = input.replace(/^set\s+/, '').split('=')[1].trim();
                let identifier = input.replace(/^set\s+/, '').split('=')[0].trim();

                token = {...token, ...typeify(assignedValue), identifier: identifier };
            }
        } break;

        case "free": {
            // free(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^free\s+\w+/g)) {
                token = new Error("SyntaxError", `[free] declaration must be followed by a variable name`, clock_interval);
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
                token = new Error("SyntaxError", `[goto] declaration must be followed by a variable name`, clock_interval);
            } else {
                let identifier = input.replace(/^goto\s+/, '').split(' ')[0].trim();
                if(typeify(identifier).type != "Number") {
                    token = new Error("TypeError", `[goto] declaration must be followed by a Number, found type ${typeify(identifier).type}`, clock_interval);
                } else {
                    token = {...token, ...typeify(identifier)};
                }
            }
        }
    }
    return token;
}

function interpreter(input) {

    let lines = input.split('\n').map(x => x.trim()).filter(x => x.length > 0 && x !== "--");
    let clock_interval = 0;

    resetVariables()

    if(lines[lines.length - 1].trim() !== "endprog") {
        output(`PrecheckError -> [endprog] must be the last line of the program <-`);
        return;
    }

    let paused = false;

    function interpretSingleLine(interval, single_input) {
        if(clock_interval >= lines.length) {
            clearInterval(interval);
            return;
        }
        let line = single_input;
        let token = processSingleLine(line, clock_interval);
        if(token.type === "Error") {
            outputError(token, true);
            clearInterval(interval);
            setSetting("showSpinner", ["false"])
            createEditableTerminalLine(config.currentPath + ">");
            return;
        } else {
            // process tokens here =======================================================
            switch(token.keyword) {
                case "wait": {
                    let ms = token.value;

                    paused = true;

                    setTimeout(() => {
                        paused = false;
                    }, ms);

                } break;

                case "endprog": {
                    resetVariables()
                    clearInterval(interval);
                    setSetting("showSpinner", ["false"])
                    createEditableTerminalLine(config.currentPath + ">");
                    return;
                } break;

                case "endloop": {
                    if(isNaN(token.goto)) {
                        token = new Error("SyntaxError", `[endloop] cannot be used without a matching [loop]`, clock_interval);
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
                        token = new Error("SyntaxError", `Missing matching [endloop] for [loop]`, clock_interval);
                    }

                    if(!token.value){
                        clock_interval = token.endloopIndex;
                    } else {
                        lines[token.endloopIndex] += " " + clock_interval;
                    }
                } break;

                case "free": {
                    if(getVariable(token.identifier) == undefined) {
                        token = new Error("ReferenceError", `variable [${token.identifier}] does not exist`, clock_interval);
                    } else if(getVariable(token.identifier).mutable === false) {
                        token = new Error("PermissionError", `variable [${token.identifier}] is immutable and cannot be freed`, clock_interval);
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
                        token = new Error("ReferenceError", `variable [${token.identifier}] does not exist`, clock_interval);
                    } else if (referencedVar.mutable === false) {
                        token = new Error("PermissionError", `variable [${token.identifier}] is immutable and cannot be reassigned`, clock_interval);
                    } else {
                        // Write the new value to the variable
                        if (token.type === "Error") {
                            token = new Error("EvaluationError", `cannot evaluate [${token.originalInput}]`, clock_interval);
                        } else if(referencedVar.type !== token.type) {
                            token = new Error("TypeError", `cannot assign type [${token.type}] to variable [${token.identifier}] of type [${referencedVar.type}]`, clock_interval);
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
                        token = new Error("ReferenceError", `gotoError -> Line ${newI} does not exist`, clock_interval);
                    }
                } break;

                case "else":
                case "endif": { } break;

                default: {
                    token = new Error("InterpreterError", `Unknown keyword [${token.keyword}]`, clock_interval);
                } break;
            }

            if(token.type === "Error") {
                resetVariables()
                outputError(token);
                clearInterval(interval);
                return;
            }
            if(clock_interval >= lines.length) {
                resetVariables()
                clearInterval(interval);
                return;
            }
        }

        return token;
    }

    let clock = setInterval(() => {
        if(!paused) {
            if(clock_interval < lines.length) {
                let line = lines[clock_interval]
                interpretSingleLine(clock, line);
                clock_interval++;
            } 
        }
    }, 1);
}