const mem = {
    variables: {},
};

function output(value) {
    document.getElementById("out").value += `${value}\n`;
}

// change this to evaluate the token and return the token
function evaluate(expression) {
    let variableNames = Object.keys(mem.variables).filter(variableName => {
        let variableValue = mem.variables[variableName];
        if(variableValue && (variableValue.type === "Number")) {
            return true;
        }
        return false;
    })

    let scope = {};

    variableNames.forEach(variableName => {
        let variableValue = mem.variables[variableName];
        if(variableValue) {
            scope[variableName] = variableValue.value;
        }
    })

    return math.evaluate(expression, scope);
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

function lexer(input) {
    input = input.trim();
    
    let token = {};
    let keyword = input.split(" ")[0];

    token.keyword = keyword;

    switch (keyword) {
        case "out": {
            let argument = input.replace(/^out\s+/, '').trim();
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

        case "num": {
            // num(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^num\s+\w+\s+\=\s+/g)) {
                token = {
                    type: "Error",
                    value: `SyntaxError -> [num] declaration must be followed by a variable assignment <-`,
                };
            } else {
                let assignedValue = input.replace(/^num\s+/, '').split('=')[1].trim();
                let typeValue = typeify(assignedValue);
                if(typeValue.type != "Number" && typeValue.type != "Error"){
                    token = {
                        type: "Error",
                        value: `TypeError -> [num] declaration can only be assigned type Number, found type ${typeify(assignedValue).type} <-`,
                    }
                } else {
                    token = {...token, ...typeify(assignedValue)};

                    let identifier = input.replace(/^num\s+/, '').split('=')[0].trim();

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
                            mem.variables[identifier] = {
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
                    delete mem.variables[identifier];
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
        if(token.type === "Error") {
            output(`${token.value} at line: ${i+1}\n`);
            clearInterval(interval);
            return;
        } else {
            // process tokens here =======================================================
            switch(token.keyword) {
                case "out": {
                    output(token.value)
                } break;
                case "goto": {
                    let newI = token.value - 2;
                    if(newI >= 0 && newI < lines.length) {
                        i = newI; // -1 because of the increment in the outer loop
                    } else {
                        output(`GotoError -> cannot go to line ${newI} <-`);
                    }
                }
            }

            if(token.type === "Error") {
                output(`${token.value} at line: ${i}`);
                clearInterval(interval);
                return;
            }
            if(i >= lines.length) {
                clearInterval(interval);
                return;
            }

            i++;
        }

        return token;
    }
    let clock = setInterval(() => {
        if(i < lines.length) {
            let line = lines[i]
            let token = interpretSingleLine(clock, line);
            console.log(token)
        } else {
            clearInterval(clock);
        }
    }, 3);
}