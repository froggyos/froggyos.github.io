const mem = {
    variables: {},
};

function evaluate(expression) {
    Object.keys(mem.variables).forEach(variableName => {
        let variableValue = mem.variables[variableName];
        expression = expression.replaceAll(variableValue.identifier, variableValue.value);
    })
    return math.evaluate(expression);
}

function getVariable(variableName) {
    return mem.variables[variableName];
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

    } else if(value === "true" || value === "false") {
        typeObj.type = "Boolean";
        typeObj.value = (value === "true");

    } else if(/(==|!=|>=|<=)/.test(value)) { // comparison operators
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

            let variableNames = Object.keys(mem.variables).join('|');
            let regex = new RegExp(`(${variableNames})`, 'g');
            typeObj.originalInput = typeObj.originalInput.replace(regex, (match) => {
                return `VARIABLE_IDENTIFIER:${match}`;
            });
        }

    } else if(value.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/g)) { // identifier (variable name)
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

    } else if(value.match(/\d|\+|\-|\\|\*|\^/g)) {
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
            typeObj.value = evaluate(value); // evaluate(value)

            let variableNames = Object.keys(mem.variables).join('|');
            let regex = new RegExp(`(${variableNames})`, 'g');
            typeObj.originalInput = typeObj.originalInput.replace(regex, (match) => {
                return `VARIABLE_IDENTIFIER:${match}`;
            });
        }
    } else {
        typeObj.type = "Error";
        typeObj.value = `TypeifyError -> ${value} <-`;
    }

    // for every instance of [v:.*] in typeObj.value, replace it with the actual value of the variable in mem.variables
    if(typeObj.type == "String") typeObj.value = typeObj.value.replace(/\[v:(.*?)\]/g, (replacer, match, i, j) => {
        if(getVariable(match) != undefined) {
            return getVariable(match).value;
        } else {
            return `[UNDEFINED{!}VARIABLE:${match}]`;
        }
    });

    if(typeObj.type == "String" && /\[UNDEFINED\{!\}VARIABLE:.*\]/g.test(typeObj.value)) {
        let variable = typeObj.value.match(/\[UNDEFINED\{!\}VARIABLE:(.*?)\]/g);
        typeObj.type = "Error";
        typeObj.value = `ReferenceError -> variable [${variable.map(v => v.replace(/\[UNDEFINED\{!\}VARIABLE:/g, '').replace(/\]$/g, '')).join(', ')}] is not defined <-`;
    }

    return typeObj;
}

function lexer(input) {
    input = input.trim();
    
    let token = {};
    let keyword = input.split(" ")[0];

    token.keyword = keyword;

    switch (keyword) {
        case "out": {
            let argument = input.split(" ").slice(1).join(" ").trim();
            token = {...token, ...typeify(argument) };
        } break;

        case "str": {
            // str(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^str\s+\w+\s+\=\s+/g)) {
                token = {
                    type: "Error",
                    value: `SyntaxError -> [str] declaration must be followed by a variable assignment <-`,
                };
            } else {
                let assignedValue = input.replace(/^str\s+/, '').split('=')[1].trim();
                let typeValue = typeify(assignedValue);
                if(typeValue.type != "String" && typeValue.type != "Error"){
                    token = {
                        type: "Error",
                        value: `TypeError -> [str] declaration can only be assigned type String, found type ${typeify(assignedValue).type} <-`,
                    }
                } else {
                    token = {...token, ...typeify(assignedValue)};

                    let identifier = input.replace(/^str\s+/, '').split('=')[0].trim();

                    if(getVariable(identifier) == undefined){
                        mem.variables[identifier] = {
                            type: token.type,
                            value: token.value,
                            identifier: identifier,
                        };
                    } else {
                        token = {
                            type: "Error",
                            value: `ReferenceError -> variable [${identifier}] already exists, cannot override <-`,
                        }
                    }
                }
            }
        } break;

        case "int": {
            // int(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^int\s+\w+\s+\=\s+/g)) {
                token = {
                    type: "Error",
                    value: `SyntaxError -> [int] declaration must be followed by a variable assignment <-`,
                };
            } else {
                let assignedValue = input.replace(/^int\s+/, '').split('=')[1].trim();
                let typeValue = typeify(assignedValue);
                if(typeValue.type != "Number" && typeValue.type != "Error"){
                    token = {
                        type: "Error",
                        value: `TypeError -> [int] declaration can only be assigned type Number, found type ${typeify(assignedValue).type} <-`,
                    }
                } else {
                    token = {...token, ...typeify(assignedValue)};

                    let identifier = input.replace(/^int\s+/, '').split('=')[0].trim();

                    if(getVariable(identifier) == undefined){
                        mem.variables[identifier] = {
                            type: token.type,
                            value: token.value,
                            identifier: identifier,
                        };
                    } else {
                        token = {
                            type: "Error",
                            value: `ReferenceError -> variable [${identifier}] already exists, cannot override <-`,
                        }
                    }
                }
            }
        } break;

        case "bln": {
            // bln(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^bln\s+\w+\s+\=\s+/g)) {
                token = {
                    type: "Error",
                    value: `SyntaxError -> [bln] declaration must be followed by a variable assignment <-`,
                };
            } else {
                let assignedValue = input.replace(/^bln\s+/, '').split('=')[1].trim();
                let typeValue = typeify(assignedValue);
                if(typeValue.type != "Boolean" && typeValue.type != "Error"){
                    token = {
                        type: "Error",
                        value: `TypeError -> [bln] declaration can only be assigned type Boolean, found type ${typeify(assignedValue).type} <-`,
                    }
                } else {
                    token = {...token, ...typeify(assignedValue)};

                    let identifier = input.replace(/^bln\s+/, '').split('=')[0].trim();

                    if(getVariable(identifier) == undefined){
                        mem.variables[identifier] = {
                            type: token.type,
                            value: token.value,
                            identifier: identifier,
                        };
                    } else {
                        token = {
                            type: "Error",
                            value: `ReferenceError -> variable [${identifier}] already exists, cannot override <-`,
                        }
                    }
                }
            }
        }

        case "set": {
            // set(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^set\s+\w+\s+\=\s+/g)) {
                token = {
                    type: "Error",
                    value: `SyntaxError -> [set] declaration must be followed by a variable assignment <-`,
                };
            } else {
                let assignedValue = input.replace(/^set\s+/, '').split('=')[1].trim();
                let typeValue = typeify(assignedValue);
                if(typeValue.type != "Number" && typeValue.type != "String" && typeValue.type != "Boolean" && typeValue.type != "Error"){
                    token = {
                        type: "Error",
                        value: `TypeError -> [set] declaration can only be assigned type Number, String or Boolean, found type ${typeify(assignedValue).type} <-`,
                    }
                } else {
                    token = {...token, ...typeify(assignedValue)};

                    let identifier = input.replace(/^set\s+/, '').split('=')[0].trim();
                    let variable = getVariable(identifier);
                    if(variable != undefined){
                        if(variable.type != token.type) {
                            token = {
                                type: "Error",
                                value: `TypeError -> variable [${variable.identifier}] is type ${variable.type}, cannot assign type ${token.type} <-`,
                            }
                        }
                        mem.variables[identifier] = {
                            type: token.type,
                            value: token.value,
                            identifier: identifier,
                        };
                    }
                    else {
                        token = {
                            type: "Error",
                            value: `ReferenceError -> variable [${identifier}] does not exist <-`,
                        }
                    }
                }
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
                let variable = getVariable(identifier);
                if(variable != undefined){
                    delete mem.variables[identifier];
                } else {
                    token = {
                        type: "Error",
                        value: `ReferenceError -> variable [${identifier}] does not exist <-`,
                    }
                }
            }
        }
    }
    return token;
}

function parseMultilineKeywords(input) {
    // something will go here soon
    return input;
}

function interpreter(input) {
    mem.variables = {};
    let lines = parseMultilineKeywords(input).split('\n');
    let i = 0;
    let interval = setInterval(() => {
        if(i >= lines.length) {
            clearInterval(interval);
            return;
        }
        let line = lines[i].trim();
        token = lexer(line);
        if(token.type === "Error") {
            console.error(`${token.value} at line: ${i}`);
            clearInterval(interval);
        } else {
            console.log(token)
            i++;
            if(i >= lines.length) {
                clearInterval(interval);
            }
        }
    }, 1);
}