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

function output(value, isError) {
    if(isError == undefined) isError = false;
    if(isError) createTerminalLine(value.toString(), config.errorText, {translate: false});
    else createTerminalLine(value.toString(), "", {translate: false});
    //document.getElementById("out").value += value + "\n";
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
            typeObj.type = "Error";
            typeObj.value = `EvaluationError -> ${typeObj.originalInput} <-`;
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
            typeObj.type = "Error";
            typeObj.value = `ReferenceError -> variable [${value}] is not defined <-`;
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
            typeObj.type = "Error";
            typeObj.value = `EvaluationError -> ${typeObj.originalInput} <-`;
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
        typeObj.type = "Error";
        typeObj.value = `TypeifyError -> ${value} <-`;
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

function processSingleLine(input) {
    input = input.trim();
    
    let token = {};
    let keyword = input.split(" ")[0];

    token.keyword = keyword;

    switch (keyword) {
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
                token = {
                    type: "Error",
                    value: `SyntaxError -> [loop] condition cannot be empty <-`,
                };
                break;
            }
            let conditionType = typeify(condition);
            if(conditionType.type !== "Boolean" && conditionType.type !== "Error") {
                token = {
                    type: "Error",
                    value: `TypeError -> [loop] condition must evaluate to Boolean, found type ${conditionType.type} <-`,
                };
            } else {
                token = {...token, ...conditionType, originalInput: condition, endloopIndex: null };
            }
        } break;

        case "if": {
            let condition = input.replace(/^if\s+/, '').split('then')[0].trim();
            if(!condition) {
                token = {
                    type: "Error",
                    value: `SyntaxError -> [if] condition cannot be empty <-`,
                };
                break;
            }
            let conditionType = typeify(condition);
            if(conditionType.type !== "Boolean" && conditionType.type !== "Error") {
                token = {
                    type: "Error",
                    value: `TypeError -> [if] condition must evaluate to Boolean, found type ${conditionType.type} <-`,
                };
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
                token = {
                    type: "Error",
                    value: `SyntaxError -> [${keyword}] declaration must be followed by a variable assignment <-`,
                };
            } else {
                let assignedValue = input.replace(/^(c?)str\s+/, '').split('=')[1].trim();
                let typeValue = typeify(assignedValue);
                if(typeValue.type != "String" && typeValue.type != "Error"){
                    token = {
                        type: "Error",
                        value: `TypeError -> [${keyword}] declaration can only be assigned type String, found type ${typeify(assignedValue).type} <-`,
                    }
                } else {
                    let identifier = input.replace(/^(c?)str\s+/, '').split('=')[0].trim();

                    if(getVariable(identifier) != undefined){
                        token = {
                            type: "Error",
                            value: `ReferenceError -> variable [${identifier}] already exists, cannot override <-`,
                        }
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
                token = {
                    type: "Error",
                    value: `SyntaxError -> [${keyword}] declaration must be followed by a variable assignment <-`,
                };
            } else {
                let assignedValue = input.replace(/^(c?)num\s+/, '').split('=')[1].trim();
                let typeValue = typeify(assignedValue);
                if(typeValue.type != "Number" && typeValue.type != "Error"){
                    token = {
                        type: "Error",
                        value: `TypeError -> [${keyword}] declaration can only be assigned type Number, found type ${typeify(assignedValue).type} <-`,
                    }
                } else {
                    let identifier = input.replace(/^(c?)num\s+/, '').split('=')[0].trim();

                    if(getVariable(identifier) != undefined){
                        token = {
                            type: "Error",
                            value: `ReferenceError -> variable [${identifier}] already exists, cannot override <-`,
                        }
                    } else {
                        token = {...token, ...typeify(assignedValue), identifier: identifier };
                        if(token.originalInput.includes("pi")) {
                            token.type = "Error";
                            token.value = `EvaluationError -> [pi] is unreliable, use [Pi] instead <-`;
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
                token = {
                    type: "Error",
                    value: `SyntaxError -> [${keyword}] declaration must be followed by a variable assignment <-`,
                };
            } else {
                let assignedValue = input.replace(/^(c?)bln\s+/, '').split('=')[1].trim();
                let typeValue = typeify(assignedValue);
                if(typeValue.type != "Boolean" && typeValue.type != "Error"){
                    token = {
                        type: "Error",
                        value: `TypeError -> [${keyword}] declaration can only be assigned type Boolean, found type ${typeify(assignedValue).type} <-`,
                    }
                } else {
                    let identifier = input.replace(/^(c?)bln\s+/, '').split('=')[0].trim();

                    if(getVariable(identifier) != undefined){
                        token = {
                            type: "Error",
                            value: `ReferenceError -> variable [${identifier}] already exists, cannot override <-`,
                        }
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
                token = {
                    type: "Error",
                    value: `SyntaxError -> [set] declaration must be followed by a variable assignment <-`,
                };
            } else {
                let assignedValue = input.replace(/^set\s+/, '').split('=')[1].trim();
                let identifier = input.replace(/^set\s+/, '').split('=')[0].trim();

                token = {...token, ...typeify(assignedValue), identifier: identifier };
            }
        } break;

        case "free": {
            // free(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^free\s+\w+/g)) {
                token = {
                    type: "Error",
                    value: `SyntaxError -> [free] declaration must be followed by a variable <-`,
                };
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
                token = {
                    type: "Error",
                    value: `SyntaxError -> [goto] declaration must be followed by a value <-`,
                };
            } else {
                let identifier = input.replace(/^goto\s+/, '').split(' ')[0].trim();
                if(typeify(identifier).type != "Number") {
                    token = {
                        type: "Error",
                        value: `TypeError -> [goto] declaration must be followed by a Number, found type ${typeify(identifier).type} <-`,
                    }
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
        output(`SyntaxError -> [endprog] must be the last line of the program <-`, true);
        return;
    }

    function interpretSingleLine(interval, single_input) {
        if(clock_interval >= lines.length) {
            clearInterval(interval);
            return;
        }
        let line = single_input;
        let token = processSingleLine(line);
        if(token.type === "Error") {
            output(`${token.value} at line: ${clock_interval}\n`, true);
            clearInterval(interval);
            return;
        } else {
            // process tokens here =======================================================
            switch(token.keyword) {
                case "endprog": {
                    resetVariables()
                    clearInterval(interval);
                    createEditableTerminalLine(config.currentPath);
                    return;
                } break;

                case "endloop": {
                    if(isNaN(token.goto)) {
                        token = {
                            type: "Error",
                            value: `SyntaxError -> [endloop] cannot be used without a matching [loop] <-`,
                        };
                    }

                    let loopCondition = lines[token.goto].replace("loop", "").trim();
                    if(evaluate(loopCondition)) {
                        clock_interval = token.goto;
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
                        token = {
                            type: "Error",
                            value: `SyntaxError -> Missing matching [endloop] for [loop] <-`,
                        };
                    }

                    if(!token.value){
                        clock_interval = token.endloopIndex;
                    } else {
                        lines[token.endloopIndex] += " " + clock_interval;
                    }
                } break;

                case "free": {
                    if(getVariable(token.identifier) == undefined) {
                        token = {
                            type: "Error",
                            value: `ReferenceError -> variable [${token.identifier}] does not exist <-`,
                        };
                    } else if(getVariable(token.identifier).mutable === false) {
                        token = {
                            type: "Error",
                            value: `PermissionError -> variable [${token.identifier}] is immutable and cannot be freed <-`,
                        };
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
                        token = {
                            type: "Error",
                            value: `ReferenceError -> variable [${token.identifier}] does not exist <-`,
                        };
                    } else if (referencedVar.mutable === false) {
                        token = {
                            type: "Error",
                            value: `PermissionError -> variable [${token.identifier}] is immutable and cannot be reassigned <-`,
                        };
                    } else {
                        // Write the new value to the variable
                        if (token.type === "Error") {
                            token = {
                                type: "Error",
                                value: `EvaluationError -> cannot evaluate [${token.originalInput}] <-`,
                            };
                        } else if(referencedVar.type !== token.type) {
                            token = {
                                type: "Error",
                                value: `TypeError -> cannot assign type [${token.type}] to variable [${token.identifier}] of type [${referencedVar.type}] <-`,
                            };
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
                        token = {
                            type: "Error",
                            value: `GotoError -> Line ${newI} does not exist <-`,
                        }
                    }
                } break;

                case "else":
                case "endif": { } break;

                default: {
                    token = {
                        type: "Error",
                        value: `InterpreterError -> Unknown keyword [${token.keyword}] <-`,
                    }
                } break;
            }

            if(token.type === "Error") {
                resetVariables()
                output(`${token.value} at line: ${clock_interval}`, true);
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
        if(clock_interval < lines.length) {
            let line = lines[clock_interval]
            let token = interpretSingleLine(clock, line);
            clock_interval++;
        } 
    }, 1);
}