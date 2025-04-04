const mem = {
    variables: {},
};

// change this to evaluate the token and return the token
function evaluate(type, expression) {
    console.log(type, expression)
    if(type == "String") Object.keys(mem.variables).forEach(variableName => {
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
            evaluate(typeObj.type, value)
        } catch (e) {
            error = true;
        }

        if (error) {
            typeObj.type = "Error";
            typeObj.value = `EvaluationError -> ${typeObj.originalInput} <-`;
        } else {
            typeObj.value = evaluate(typeObj.type,value);

            let variableNames = Object.keys(mem.variables).join('|');
            let regex = new RegExp(`(${variableNames})`, 'g');
            typeObj.originalInput = typeObj.originalInput.replace(regex, (match) => {
                return `VARIABLE_IDENTIFIER:${match}`;
            });
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
            evaluate(typeObj.type, value);
        } catch (e) {
            error = true;
            errMsg = e.message;
        }

        if (error) {
            typeObj.type = "Error";
            typeObj.value = `EvaluationError -> ${typeObj.originalInput} <-`;
        } else {
            typeObj.type = "Number";
            typeObj.value = evaluate(typeObj.type, value); // evaluate(value)

            if(Object.keys(mem.variables).length > 0) {
                let variableNames = Object.keys(mem.variables).join('|');
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

function lexer(input, saveVariables) {
    input = input.trim();
    if(saveVariables == undefined) saveVariables = true;
    
    let token = {};
    let keyword = input.split(" ")[0];

    token.keyword = keyword;

    switch (keyword) {
        case "out": {
            let argument = input.replace(/^out\s+/, '').trim();
            let type = typeify(argument);
            console.log(type)
            token = {...token, ...{value: argument, type: type} };
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
                        if(saveVariables) mem.variables[identifier] = {
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
                        if(saveVariables) mem.variables[identifier] = {
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
                        if(saveVariables) mem.variables[identifier] = {
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
                        } else {
                            if(saveVariables) mem.variables[identifier] = {
                                type: token.type,
                                value: token.value,
                                identifier: identifier,
                            };
                        }
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
                    if(saveVariables) delete mem.variables[identifier];
                } else {
                    token = {
                        type: "Error",
                        value: `ReferenceError -> variable [${identifier}] does not exist <-`,
                    }
                }
            }
        }

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

function parseMultilineKeywords(input) {
    // something will go here soon
    return input;
}

function interpreter(input) {
    mem.variables = {};
    document.getElementById("out").value = "";
    let lines = parseMultilineKeywords(input).split('\n');
    let i = 0;
    function interpretSingleLine(interval, single_input) {
        if(i >= lines.length) {
            clearInterval(interval);
            return;
        }
        let line = single_input;
        let token = lexer(line);
        // process string literals
        if(token.type == "String" && token.value.match(/\[v:\w*\]/)) {
            // get between [v: and ]
            let variableName = token.value.match(/\[v:(\w*)\]/)[1];
            let variableValue = getVariable(variableName);
            if(variableValue != undefined) {
                token.value = variableValue.value;
                token.type = variableValue.type;
            } else {
                token = {
                    type: "Error",
                    value: `ReferenceError -> variable [${variableName}] does not exist <-`,
                };
            }
        }
        if(token.type === "Error") {
            document.getElementById("out").value += `${token.value} at line: ${i+1}\n`;
            clearInterval(interval);
            return;
        } else {
            i++;
            // process tokens here =======================================================
            switch(token.keyword) {
                case "out": {
                    // 
                } break;
                case "goto": {
                    let newI = token.value - 1;
                    if(newI < 0 || newI > lines.length) {
                        token = {
                            type: "Error",
                            value: `ReferenceError -> [goto] out of bounds, line: ${newI} <-`,
                        };
                        clearInterval(interval);
                        return;
                    } else {
                        i = newI;
                    }
                }
            }

            if(token.type === "Error") {
                document.getElementById("out").value += `${token.value} at line: ${i}`;
                clearInterval(interval);
                return;
            }
            if(i >= lines.length) {
                clearInterval(interval);
                return;
            }
        }
    }
    let tokens = lines.map(line => lexer(line, false));
    console.log(tokens);
    let clockInterval = setInterval(() => {
        let line = lines[i].trim();
        interpretSingleLine(clockInterval, line);
    }, 1);
}