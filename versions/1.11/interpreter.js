const FroggyscriptMemory = {
    variables: {},
    functions: {},
    savedData: {},
    CLOCK_INTERVAL: 0,
    CLOCK_PAUSED: false,
    lines: [],
    temporaryVariables: {},
    CLOCK_CYCLE_LENGTH: 1,
};

let OS_RUNTIME_START = Date.now();

const defaultVariables = {
    undefined: {
        type: "Undefined",
        value: undefined,
        identifier: "undefined",
        mutable: false,
    },
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
    OS_ProgramName: {
        type: "String",
        value: null,
        identifier: "OS_ProgramName",
        mutable: false,
    }
}

let frozenMemory = () => structuredClone(FroggyscriptMemory);

let freeze = (obj) => structuredClone(obj);

class ScriptError {
    constructor(type, message) {
        this.type = "Error"
        this.error = type
        this.value = message
        this.line = FroggyscriptMemory.CLOCK_INTERVAL
    }
}

function output(token) {
    createTerminalLine(token.value, "", {translate: false});
}

function outputWithFormatting(token) {
    createTerminalLine(token.value, "", {translate: false, formatting: token.format});
}

function resetTerminalForUse(interval){
    resetMemState()
    clearInterval(interval);
    setSetting("showSpinner", "false")
    setSetting("currentSpinner", getSetting("defaultSpinner"));
    config.currentProgram = "cli";
}

// error trace is the token of the function that called the error
function outputError(token, interval, error_trace) {
    createTerminalLine("", config.programErrorText.replace("{{}}", token.error), {translate: false});
    createTerminalLine(" ", "", {translate: false});
    let debugCommand;
    if(error_trace == undefined){
        createTerminalLine(token.value, "", {translate: false});
        createTerminalLine(`  line: ${token.line+1}`, "", {translate: false});
        debugCommand = `[[BULLFROG]]gotoprogramline ${token.currentProgram} ${token.line}`
    } else {
        createTerminalLine("Error trace:", "", {translate: false});
        createTerminalLine(`  Function [${error_trace.name}]\n    line: ${token.line+1}`, "", {translate: false});
        createTerminalLine(`  ${token.value}\n    line: ${error_trace.line+1}`, "", {translate: false});
        debugCommand = `[[BULLFROG]]gotoprogramline ${token.currentProgram} ${error_trace.line}`
    }
    resetTerminalForUse(interval);
    createEditableTerminalLine(config.currentPath + ">");

    config.commandHistory = [debugCommand].concat(config.commandHistory);
}

function singleLineError(message){
    createTerminalLine(message, config.errorText, {translate: false});
}

function resetMemState() {
    delete FroggyscriptMemory.variables;
    delete FroggyscriptMemory.functions;
    delete FroggyscriptMemory.savedData;
    delete FroggyscriptMemory.CLOCK_INTERVAL;
    delete FroggyscriptMemory.CLOCK_PAUSED;
    delete FroggyscriptMemory.lines;
    delete FroggyscriptMemory.temporaryVariables;

    FroggyscriptMemory.variables = {};
    // initialize default variables
    Object.keys(defaultVariables).forEach(variableName => {
        let variableValue = defaultVariables[variableName];
        if(variableValue) {
            FroggyscriptMemory.variables[variableName] = variableValue;
        }
    });

    FroggyscriptMemory.functions = {};
    FroggyscriptMemory.savedData = {};
    FroggyscriptMemory.CLOCK_INTERVAL = 0;
    FroggyscriptMemory.CLOCK_PAUSED = false;
    FroggyscriptMemory.lines = [];
    FroggyscriptMemory.temporaryVariables = {};

    config.currentProgram = "cli";
}

// change this to evaluate the token and return the token
function evaluate(expression) {
    let methodIndex = findMethodIdentifier(expression);

    if(methodIndex != -1) {
        expression = expression.slice(0, methodIndex).trim();
    }

    let variableNames = Object.keys(FroggyscriptMemory.variables);

    let scope = {};

    variableNames.forEach(variableName => {
        let variableValue = FroggyscriptMemory.variables[variableName];
        if(variableValue) {
            scope[variableName] = variableValue.value;
        }
    })

    let result = null;
    let error = false;

    try {
        result = math.evaluate(expression, scope);
    } catch (e) {
        error = true;
    }

    if (error) {
        return new ScriptError("EvaluationError", `Cannot evaluate [${expression}]`);
    } else {
        return result;
    }
}

function getVariable(variableName) {
    if (FroggyscriptMemory.temporaryVariables[variableName]) return FroggyscriptMemory.temporaryVariables[variableName];
    else return FroggyscriptMemory.variables[variableName];
}

function parseArrayWithout$(str){
    let values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (char === `'`) {
            inQuotes = !inQuotes;
            current += char;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    if (current.length > 0) {
        values.push(current.trim());
    }

    let typedValues = [];
    values.forEach(v => typedValues.push(typeify(v)));

    return typedValues;
}

function getMethods(v){
    let methods = [];
    if(findMethodIdentifier(v) != -1){
        let methodArray = v.slice(findMethodIdentifier(v)+1).split(">")

        methodArray.forEach(methodString => {
            let method = {
                name: methodString.split("(")[0].trim(),
                args: [],
            };

            // get everything between the first ( and last )
            let argsStart = methodString.indexOf("(");
            let argsEnd = methodString.lastIndexOf(")");

            if(argsStart != -1 && argsEnd != -1) {

                let args = splitArguments(methodString.slice(argsStart + 1, argsEnd).trim())

                args.forEach(arg => {
                    method.args.push(arg)
                })
            }

            
            methods.push(method);
        })

        v = v.slice(0, findMethodIdentifier(v)).trim();
    }

    return methods;
}

async function runFunctionBody(funcBody, typeObj) {
    return new Promise(resolve => {
        let lastToken;
        let subclock_interval = 0;

        FroggyscriptMemory.CLOCK_PAUSED = true;

        const subclock = setInterval(() => {
            if (subclock_interval >= funcBody.length) {
                clearInterval(subclock);
                FroggyscriptMemory.CLOCK_PAUSED = false;
                FroggyscriptMemory.temporaryVariables = {};
                return resolve(lastToken);
            }

            let line = funcBody[subclock_interval].trim();
            lastToken = interpretSingleLine(subclock, line, undefined, true);

            if (lastToken.type === "Error") {
                lastToken.line--;
                let errorTrace = {
                    name: typeObj.functionName,
                    line: subclock_interval + funcBody.indexOf(line) + 1
                };
                outputError(lastToken, subclock, errorTrace);

                clearInterval(subclock);
                return resolve(lastToken); // still resolve so the caller can catch
            }

            subclock_interval++;
        }, FroggyscriptMemory.CLOCK_CYCLE_LENGTH);
    });
}

function typeify(value) {
    let typeObj = {
        type: null,
        value: null,
        originalInput: value,
    };

    let methods = getMethods(value);

    if(!/^@.*$/g.test(value) && methods.length != 0) {
        let rawValue = value.slice(0, findMethodIdentifier(value)).trim();

        let methodToken = typeify(rawValue);
        methodToken.methods = methods;

        typeObj = methodParser(methodToken)
    }

    if(value == undefined) return new ScriptError("TypeAssignmentError", `Cannot assign type to [${value}]`);

    if(/^@.*$/g.test(value)) {
        const match = value.match(/^@([a-zA-Z_][a-zA-Z0-9_]*)\((.*)\)$/);
        if (!match) {
            return new ScriptError("SyntaxError", `Invalid function syntax: ${value}`);
        }
    

        let matchedValue = match[2].trim();

        typeObj.functionName = match[1];
        typeObj.value = 'undefined';
        typeObj.type = "Undefined";
        typeObj.origin = "Function";

        let functionArguments = extractFunctionArguments(matchedValue).map(x => typeify(x))

        let func = FroggyscriptMemory.functions[typeObj.functionName];

        if(func == undefined) {
            typeObj = new ScriptError("ReferenceError", `Function [${typeObj.functionName}] does not exist`);
            return typeObj;
        }

        let expectedArguments = func.args;

        for(let i = 0; i < expectedArguments.length; i++) {
            let funcArg = functionArguments[i];
            let expectedArg = expectedArguments[i];

            if(funcArg == undefined){
                let expectedLen = expectedArguments.length;
                let foundLen = functionArguments.length;
                typeObj = new ScriptError("ArgumentError", `Function [${typeObj.functionName}] expected ${expectedLen} argument${expectedLen != 1 ? "s" : ""}, found ${foundLen}`);
                break;
            }

            if(funcArg.type == "Error"){
                typeObj = funcArg;
                break;
            }

            if(expectedArg.type == "Any") continue;

            if(funcArg.type != expectedArg.type) {
                typeObj = new ScriptError("TypeError", `Function [${typeObj.functionName}] argument [${i+1}] expected type ${expectedArg.type}, found type ${funcArg.type}`);
                break;
            }
        }    

        if(typeObj.type == "Error") return typeObj;

        let funcBody = func.body;

        for(let i = 0; i < functionArguments.length; i++){
            let variableName = expectedArguments[i].name;

            FroggyscriptMemory.temporaryVariables[variableName] = {
                identifier: variableName,
                type: functionArguments[i].type,
                value: functionArguments[i].value,
                mutable: true,
            }
        }

        FroggyscriptMemory.CLOCK_PAUSED = true;

        // runFunctionBody(funcBody, typeObj).then((result) => {
        //     typeObj.value = result.value;
        // });

        typeObj.body = funcBody,
        typeObj.origin = "Function";

    } else if(value.match(/^("|').*\1$/g)) {// string
        typeObj.type = "String";
        typeObj.value = value.replace(/^("|')|("|')$/g, '');

        let literals = []

        const regex = /\$\|(.+?)\|/g;
        const matches = [...value.matchAll(regex)];
    
        literals = matches.map(match => ({
            literal: match[0],       //  "$|name|"
            symbol: match[1].trim()  //  "name"
        }));

        literals.forEach((literal, i) => {
            let evaluated = evaluate(literal.symbol);
            if(evaluated.type == "Error"){
                typeObj = evaluated;
                typeObj.value = `String literal [${i}]: ${typeObj.value}`
            } else {
                typeObj.value = typeObj.value.replaceAll(literal.literal, evaluated)
            }
        })

        typeObj.origin = "String";
    } else if(value.match(/^\$("|'|\d|\w).*("|'|\d|\w)\$$/)){

        value = value.replace(/^\$/, '');
        value = value.replace(/\$$/, '');

        let values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < value.length; i++) {
            const char = value[i];

            if (char === `'`) {
                inQuotes = !inQuotes;
                current += char;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        if (current.length > 0) {
            values.push(current.trim());
        }

        let typedValues = [];
        values.forEach(v => typedValues.push(typeify(v)));

        typeObj.originalInput = typeObj.originalInput.replace(/ \$/, " [FORCE_ARRAY]").replace(/\$$/, "[FORCE_ARRAY]");

        if(typedValues.some(value => value.type == "Error")){
            typeObj = typedValues[typedValues.findIndex(value => value.type == "Error")]
        } else {
            typeObj.type = "Array";
            typeObj.value = typedValues;
        }

        typeObj.origin = "Array";
    } else if(evaluate(value) === true || evaluate(value) === false) {
        typeObj.type = "Boolean";
        let error = false;
        try {
            evaluate(value)
        } catch (e) {
            error = true;
        }

        if (error) {
            typeObj = new ScriptError("EvaluationError", `Cannot evaluate [${value}]`);
        } else {
            if(findMethodIdentifier(value) != -1){
                typeObj = new ScriptError("TypeifyError", `Cannot use methods in a Boolean`);
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

        }

        typeObj.origin = "Boolean";

    } else if(value.match(/^[a-zA-Z_]+$/g)) {
        let name = value;

        let variableValue = getVariable(name);

        if (variableValue != undefined) {
            typeObj.originalInput = "[VARIABLE_IDENTIFIER]"+value;
            typeObj.value = variableValue.value;
            typeObj.type = variableValue.type;
        } else {
            typeObj = new ScriptError("ReferenceError", `Variable [${value}] is not defined`);
        }

        typeObj.origin = "VariableIdentifier";

    } else if(typeof evaluate(value) === 'number') {
        let error = false;
        try {
            evaluate(value);
        } catch (e) {
            error = true;
            errMsg = e.message;
        }

        if (error) {
            typeObj = new ScriptError("EvaluationError", `Cannot evaluate [${value}]`);
        } else {
            typeObj.type = "Number";
            typeObj.value = evaluate(value);

            if(Object.keys(FroggyscriptMemory.variables).length > 0) {
                let variableNames = Object.keys(FroggyscriptMemory.variables).join('|');
                let regex = new RegExp(`(${variableNames})`, 'g');
                typeObj.originalInput = typeObj.originalInput.replace(regex, (match) => {
                    return `[VARIABLE_IDENTIFIER]${match}`;
                });
            }
        }

        typeObj.origin = "Number";
    } else {
        if(methods.length != 0 && typeObj.type != "Function") {
            typeObj.methods = methods;
        } else typeObj = new ScriptError("TypeifyError", `Cannot assign type to [${value}]`);
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

function findMethodIdentifier(str) {
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        // Toggle quote states (ignoring escaping)
        if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
        } else if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
        }

        // Check for unquoted, unspaced '>'
        if (char === '>' && !inSingleQuote && !inDoubleQuote) {
            const left = str[i - 1];
            const right = str[i + 1];

            if (left !== ' ' && right !== ' ') {
                return i;
            }
        }
    }

    return -1;
}

function splitArguments(str) {
    let result = [];
    let current = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;

    for (let i = 0; i < str.length; i++) {
        const char = str[i];

        if (char === "'" && !inDoubleQuote && str[i - 1] !== '\\') {
            inSingleQuote = !inSingleQuote;
            current += char;
        } else if (char === '"' && !inSingleQuote && str[i - 1] !== '\\') {
            inDoubleQuote = !inDoubleQuote;
            current += char;
        } else if (char === ';' && !inSingleQuote && !inDoubleQuote) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    if (current) {
        result.push(current.trim());
    }

    return result;
}

function extractFunctionArguments(input) {
    let result = [];
    let current = '';
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let inDollar = false;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        if (char === "'" && !inDoubleQuote && input[i - 1] !== '\\') {
            inSingleQuote = !inSingleQuote;
            current += char;
        } else if (char === '"' && !inSingleQuote && input[i - 1] !== '\\') {
            inDoubleQuote = !inDoubleQuote;
            current += char;
        } else if (char === '$' && !inSingleQuote && !inDoubleQuote) {
            inDollar = !inDollar;
            current += char;
        } else if (char === ';' && !inSingleQuote && !inDoubleQuote && !inDollar) {
            if (current.trim().length > 0) {
                result.push(current.trim());
                current = '';
            }
        } else {
            current += char;
        }
    }

    if (current.trim().length > 0) {
        result.push(current.trim());
    }

    return result;
}

function processSingleLine(input) {
    input = input.trim();
    
    let token = {};

    let keyword = input.split(" ")[0];

    token.keyword = keyword;

    if(token.keyword.startsWith("@")) {
        let functionToken = typeify(input);

        if(functionToken.type == "Error") return functionToken
        else {
            runFunctionBody(functionToken.body, functionToken);
            token.keyword = "SKIP_LINE";
            return token;
        }
    }

    switch (keyword) {        
        case "func": {
            let functionName = input.split(" ")[1].trim();
            let functionArguments = input.split(" ").slice(2)

            let func = {
                name: functionName,
                args: [],
                body: []
            };

            functionArguments.forEach(arg => {
                let argument = {
                    name: arg.replace(/^!/, '').replace(/:[SNBA\*]{1}$/g, '').trim(),
                    type: null,
                }

                if(arg.slice(-2, -1) == ":") {
                    let type = arg.slice(-1)

                    if(type == "S") argument.type = "String"
                    else if(type == "N") argument.type = "Number"
                    else if(type == "B") argument.type = "Boolean"
                    else if(type == "A") argument.type = "Array"
                    else if(type == "*") argument.type = "Any"
                    else argument.type = "Any"
                } else {
                    argument.type = "Any"
                }

                func.args.push(argument)
            })

            let stack = [];
            let endIndex = null;

            for (let i = FroggyscriptMemory.CLOCK_INTERVAL + 1; i < FroggyscriptMemory.lines.length; i++) {
                let currentKeyword = FroggyscriptMemory.lines[i].trim().split(" ")[0];
                
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

            if(endIndex == null) {
                token = new ScriptError("SyntaxError", `[func] must have a matching [endfunc]`);
            } else {
                func.body = FroggyscriptMemory.lines.slice(FroggyscriptMemory.CLOCK_INTERVAL + 1, endIndex);
                FroggyscriptMemory.CLOCK_INTERVAL = endIndex;
                FroggyscriptMemory.functions[functionName] = func;
            }
        } break;

        case "loaddata": {
            let variable = input.split(" ")[1].trim();
            let key = input.split(" ").slice(2).join(" ").trim();

            if(getVariable(variable) == undefined) {
                token = new ScriptError("ReferenceError", `Variable [${variable}] does not exist`);
            } else if(getVariable(variable).mutable === false) {
                token = new ScriptError("PermissionError", `Variable [${variable}] is immutable and cannot be reassigned`);
            }

            token = { ...token, variableName: variable, key: key };
        } break;

        case "savedata": {
            let key = input.split(" ")[1].trim();
            let value = input.split(" ").slice(2).join(" ").trim();

            if(key == ''){
                token = new ScriptError("SyntaxError", `[savedata] must be followed by a key`);
            } else if(value == ''){
                token = new ScriptError("SyntaxError", `[savedata] must be followed by a value`);
            }

            let typed = typeify(value);
            if(typed.type == "Error"){
                token = typed;
            } else {
                let value = typed.value;
                token = { ...token, key: key, value: value };
            }
        } break;

        case "prompt": {
            // prompt [variable] [default highlighted option] [...options]
            let variable = input.split(" ")[1].trim();
            let defaultOption = input.split(" ")[2].trim();
            let options = input.replace(/^prompt\s+\w+\s+\w+\s+/, '');

            if(variable == undefined) {
                token = new ScriptError("SyntaxError", `[prompt] must be followed by a variable name`);
            } else if(getVariable(variable) == undefined) {
                token = new ScriptError("ReferenceError", `Variable [${variable}] does not exist`);
            } else if(getVariable(variable).mutable === false) {
                token = new ScriptError("PermissionError", `Variable [${variable}] is immutable and cannot be reassigned`);
            }

            options = typeify(options);
            defaultOption = typeify(defaultOption);

            if(options.type == "Error") {
                token = options;
                break;
            }

            if(defaultOption.type == "Error") {
                token = defaultOption;
                break;
            }

            if(options.type != "Array") {
                token = new ScriptError("TypeError", `[prompt] options must be type Array, found type ${options.type}`);
                break;
            }

            if(defaultOption.type != "Number") {
                token = new ScriptError("TypeError", `[prompt] default option must be type Number, found type ${defaultOption.type}`);
                break;
            }

            token = { ...token, variableType: getVariable(variable).type, variableName: variable, defaultOption: defaultOption, options: options };

        } break;

        case "return": {
            let returnValue = input.replace(/^return\s+/, '').trim();
            if(returnValue.trim() == "") {
                token = new ScriptError("SyntaxError", `[return] must be followed by a value`);
            } else {
                let typeValue = typeify(returnValue);
                if(typeValue.type == "Error"){
                    token = typeValue;
                } else {
                    token = { ...token, ...typeValue };
                }
            }
        } break;

        case "arr": {
            let value = input.replace(/^arr\s+/, '').split('=')[1].trim();
            let name = input.replace(/^arr\s+/, '').split('=')[0].trim();

            if(name.trim() == ""){
                token = new ScriptError("SyntaxError", `[arr] must be followed by a variable name`);
                break;
            }

            if(value.trim() == ""){
                token = new ScriptError("SyntaxError", `[arr] must be followed by a value`);
                break;
            }

            let values = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < value.length; i++) {
                const char = value[i];

                if (char === `'`) {
                    inQuotes = !inQuotes;
                    current += char;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }

            if (current.length > 0) {
                values.push(current.trim());
            }

            values = values.map(value => value.replace(/^\$/, "").replace(/\$$/, ""));

            // if(token.type != "Array"){
            //     token = new ScriptError("TypeError", `[arr] declaration can only be assigned type Array, found type ${token.type}`);
            //     break;
            // }

            if(getVariable(name) != undefined) {
                token = new ScriptError("ReferenceError", `Variable [${name}] already exists, cannot override`);
                break;
            }
            if(values.length == 0){
                token = new ScriptError("SyntaxError", `[arr] must be followed by a value`);
            } else {
                let typedValues = [];

                values.forEach(value => typedValues.push(typeify(value)));

                // if any index has a type of Error
                if(typedValues.some(value => value.type == "Error")){
                    // find the index of the last Error
                    let index = typedValues.lastIndexOf(typedValues.find(value => value.type == "Error"));
                    token = typedValues[index]

                    token.value = `Index [${index}]: ${token.value}`

                } else {
                    token = { ...token, identifier: name, type: "Array", value: typedValues };
                }
            }
        } break;

        case "stringify": {
            let variable = input.split(" ")[1].trim();
            if(typeify(variable).type == "Error") {
                token = typeify(variable);
            } else {
                token = { ...token, variableName: variable, variableType: getVariable(variable).type };
            }
        } break;

        case "outf": {
            // match the first instance of \{.*\} 
            let formatting = input.match(/\{.*?\}/)

            if(formatting == null){
                token = new ScriptError("SyntaxError", `[outf] must be followed by a formatting string`);
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
                                token = new ScriptError("TypeError", `[${key}] must be followed by a 1 or 0, found ${value}`);
                            }
                        } else if (key == "tr" || key == "br" || key == "ir") {
                            let [start, end] = value.split("-").map(value => value.trim());

                            let rangeError = false;

                            try {
                                typeify(start);
                                typeify(end);
                            } catch (e){
                                rangeError = true;
                            }

                            if(rangeError){
                                token = new ScriptError("RangeError", `[${key}] in:\n${formatting[i].trim()}\nmust be followed by a range (start-end)`);
                            } else {

                                let typedStart = typeify(start);
                                let typedEnd = typeify(end);

                                if(typedStart.type != "Number") {
                                    token = new ScriptError("TypeError", `[${key}] range start in:\n${formatting[i].trim()}\nmust be followed by a Number, found type ${typedStart.type} ${typedStart.type == "Error" ? `\n${typedStart.error} -> ${typedStart.value}`:""}`);
                                } else if(typedEnd.type != "Number") {
                                    token = new ScriptError("TypeError", `[${key}] range end in:\n${formatting[i].trim()}\nmust be followed by a Number, found type ${typedEnd.type} ${typedEnd.type == "Error" ? `\n${typedEnd.error} -> ${typedEnd.value}`:""}`);
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
                    let typedOutput = typeify(input.replace(/outf/g, "").replace(/\{.*?\}/, "").trim());

                    
                    if(output == "") {
                        token = new ScriptError("SyntaxError", `[outf] must be followed by a value`);
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
                            token = new ScriptError("SyntaxError", `[${error}] in:\n${formatting[errorIndex].trim()}\nmust be followed by a color code (cXX)`);
                        } else token = { ...token, format: formatArray, value: typedOutput.value };
                    }
                }
            }
        } break;

        case "ask": {
            let variable = input.split(" ")[1].trim();
            let prefix = input.replace(`ask ${variable}`, "").trim();

            if(prefix.trim() == "") prefix = "'?'";

            if(variable == undefined) {
                token = new ScriptError("SyntaxError", `[ask] must be followed by a variable name`);
            } else if(getVariable(variable) == undefined) {
                token = new ScriptError("ReferenceError", `Variable [${variable}] does not exist`);
            } else {
                let typedPrefix = typeify(prefix);
                if(typedPrefix.type == "Error") {
                    token = typedPrefix;
                } else if(typedPrefix.type != "String") {
                    token = new ScriptError("TypeError", `[ask] prefix must be type String, found type ${typedPrefix.type}`);
                } else {
                    token = { ...token, variableName: variable, variableType: getVariable(variable).type, prefix: typedPrefix };
                }
            }
        } break;

        case "filearg": {
            let variable = input.split(" ")[1].trim();
            let type = input.split(" ")[2].trim();

            if(type !== "String" && type !== "Number") {
                token = new ScriptError("TypeError", `[filearg] must be followed by a type (String, Number), found [${type}]`);
            } else if(variable == undefined) {
                token = new ScriptError("SyntaxError", `[filearg] must be followed by a variable name`);
            } else {
                token = { ...token, variableName: variable, variableType: type };
            }
        } break;

        case "endquickloop": {
            let startOfQuickloopIndex = +input.split(" ")[1]; // remove the keyword to find the loop start index
            token = { ...token, goto: startOfQuickloopIndex }
        } break;

        case "quickloop": {
            let times = input.replace(/^quickloop\s+/, '').trim();
            if(!times) {
                token = new ScriptError("SyntaxError", `[quickloop] must have a loop count`);
                break;
            }
            let timesType = typeify(times);
            if(timesType.type !== "Number" && timesType.type !== "Error") {
                token = new ScriptError("TypeError", `[quickloop] must evaluate to Number, found type ${timesType.type}`);
            } else {
                token = {...token, ...timesType, originalInput: times };
            }
        } break;

        case "wait": {
            let waitTime = input.replace(/^wait\s+/, '').trim();
            if(!waitTime) {
                token = new ScriptError("SyntaxError", `[wait] cannot be empty`);
                break;
            }
            let waitTimeType = typeify(waitTime);
            if(waitTimeType.type !== "Number" && waitTimeType.type !== "Error") {
                token = new ScriptError("TypeError", `[wait] must evaluate to Number, found type ${waitTimeType.type}`);
                
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
                token = new ScriptError("SyntaxError", `[loop] condition cannot be empty`);
                break;
            }
            let conditionType = typeify(condition);
            if(conditionType.type !== "Boolean" && conditionType.type !== "Error") {
                token = new ScriptError("TypeError", `[loop] condition must evaluate to Boolean, found type ${conditionType.type}`);
            } else {
                token = {...token, ...conditionType, originalInput: condition, endloopIndex: null };
            }
        } break;

        case "if": {
            let condition = input.replace(/^if\s+/, '').split('then')[0].trim();
            if(!condition) {
                token = new ScriptError("SyntaxError", `[if] condition cannot be empty`);
                break;
            }
            let conditionType = typeify(condition);
            token = {...token, ...conditionType, endKeywordIndex: null, elseKeywordIndex: null };
            
        } break;

        case "error": 
        case "out": {
            let argument = input.replace(/^(out|error)/, '').trim();

            if(argument.trim() == "") {
                token = new ScriptError("SyntaxError", `[${keyword}] must be followed by a value`);
                break;
            }

            let typed = typeify(argument);
            
            token = {...token, ...typed };
        } break;

        case "cstr":
        case "str": {
            // str(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^(c?)str\s+\w+\s+\=\s+/g)) {
                token = new ScriptError("SyntaxError", `[${keyword}] declaration must be followed by a variable assignment`);
            } else {
                let assignedValue = input.replace(/^(c?)str\s+/, '').split('=')[1].trim();

                let identifier = input.replace(/^(c?)str\s+/, '').split('=')[0].trim();

                if(getVariable(identifier) != undefined){
                    token = new ScriptError("ReferenceError", `Variable [${identifier}] already exists, cannot override`);
                    break;
                } 
                token = {...token, ...typeify(assignedValue), identifier: identifier }; 

                if(token.type != "String"){
                    token = new ScriptError("TypeError", `[${keyword}] declaration can only be assigned type String, found type ${token.type}`);
                    break;
                }
                
                if(keyword == "str") token = { ...token, mutable: true }
                else token = { ...token, mutable: false };
                
            }
        } break;

        case "cnum":
        case "num": {
            // num(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^(c?)num\s+\w+\s+\=\s+/g)) {
                token = new ScriptError("SyntaxError", `[${keyword}] declaration must be followed by a variable assignment`);
            } else {
                let assignedValue = input.replace(/^(c?)num\s+/, '').split('=')[1].trim();

                let identifier = input.replace(/^(c?)num\s+/, '').split('=')[0].trim();

                if(getVariable(identifier) != undefined){
                    token = new ScriptError("ReferenceError", `Variable [${identifier}] already exists, cannot override`);
                    break;
                }

                let typed = typeify(assignedValue)
                token = {...token, ...typed, identifier: identifier };

                if(typed.type == "Error"){
                    token = typed;
                    break;
                }

                if(typed.type != "Number"){
                    token = new ScriptError("TypeError", `[${keyword}] declaration can only be assigned type Number, found type ${typed.type}`);
                    break;
                }

                if(/\bpi\b/g.test(token.originalInput)) {
                    token = new ScriptError("EvaluationError", `[pi] is unreliable, use [Pi] instead`);
                } else {
                    if(keyword == "num") token = { ...token, mutable: true }
                    else token = { ...token, mutable: false };
                }
                
                
            }
        } break;

        case "cbln":
        case "bln": {
            // bln(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^(c?)bln\s+\w+\s+\=\s+/g)) {
                token = new ScriptError("SyntaxError", `[${keyword}] declaration must be followed by a variable assignment`);
            } else {
                let assignedValue = input.replace(/^(c?)bln\s+/, '').split('=')[1].trim();

                let identifier = input.replace(/^(c?)bln\s+/, '').split('=')[0].trim();

                if(getVariable(identifier) != undefined){
                    token = new ScriptError("ReferenceError", `Variable [${identifier}] already exists, cannot override`);
                    break;
                }
                token = {...token, ...typeify(assignedValue), identifier: identifier };

                if(token.type != "Boolean"){
                    token = new ScriptError("TypeError", `[${keyword}] declaration can only be assigned type Boolean, found type ${token.type}`);
                    break;
                }

                if(keyword == "bln") token = { ...token, mutable: true }
                else token = { ...token, mutable: false };
                
                
            }
        } break;

        // change so you can set variable indexes !!!!!!!!!!!!!!!!!!!!!!!!!!!
        case "set": {
            // set(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^set\s+\w+\s+\=\s+/g)) {
                token = new ScriptError("SyntaxError", `[set] declaration must be followed by a variable assignment`);
            } else {
                let assignedValue = input.replace(/^set\s+/, '').split('=')[1].trim();
                let identifier = input.replace(/^set\s+/, '').split('=')[0].trim();

                token = {...token, ...typeify(assignedValue), identifier: identifier };
            }
        } break;

        case "free": {
            // free(any # whitespace)<variable_name>(any # whitespace)=(any # whitespace)
            if(!input.match(/^free\s+\w+/g)) {
                token = new ScriptError("SyntaxError", `[free] declaration must be followed by a variable name`);
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
                token = new ScriptError("SyntaxError", `[goto] declaration must be followed by a variable name`);
            } else {
                let identifier = input.replace(/^goto\s+/, '').split(' ')[0].trim();
                let typeifyValue = typeify(identifier);
                if(typeifyValue.type != "Number") {
                    token = new ScriptError("TypeError", `[goto] declaration can only be assigned type Number, found type ${typeifyValue.type}`);
                    break;
                }

                token = {...token, ...typeifyValue};
            }
        }
    }

    if(token.type == "Error") return token;

    return token;
}

// remove this function eventually
function typeErrorCheckers(token) {
    switch(token.keyword){
        case "cbln":
        case "bln": {
            if(token.type != "Boolean") token = new ScriptError("TypeError", `[${token.keyword}] declaration can only be assigned type Boolean, found type ${token.type}`);
        } break;
    }

    return token;
}

function methodParser(startToken){
    let methods = startToken.methods;

    let token = startToken;

    for(let i = 0; i < methods.length; i++){
        
        let method = methods[i];

        let methodName = method.name;

        if(method.args[0] == "(") {
            token = new ScriptError("SyntaxError", `Incorrect syntax for [>${methodName}]`);
            break;
        }

        let methodArgs = method.args.map(arg => typeify(arg));

        if(methodArgs[0] == "(") {
            token = new ScriptError("SyntaxError", `Incorrect syntax for [>${methodName}]`);
            break;
        }

        if(token.type == "Error"){
            token.value += ` (acted on by [>${methodName}])`;
            break;
        }

        if(methodArgs.some(arg => arg.type == "Error")){
            let errorIndex = methodArgs.findIndex(arg => arg.type == "Error");
            token = methodArgs[errorIndex];
            token.value += ` (Argument ${errorIndex+1} of [>${methodName}])`;
            break;
        }

        switch(methodName){
            case ":":
            case "index": {
                let index = methodArgs[0];
                if(index == undefined) {
                    token = new ScriptError("SyntaxError", `[>${methodName}()] must have an index argument`);
                    break;
                }
                if(token.type != "Array") {
                    token = new ScriptError("TypeError", `[>${methodName}()] expects type Array, found type ${token.type}`);
                    break;
                }
                if(index.type != "Number") {
                    token = new ScriptError("TypeError", `[>${methodName}()] expects type Number, found type ${index.type}`);
                    break;
                }
                if(index.value < 0 || index.value >= token.value.length) {
                    token = new ScriptError("RangeError", `[>${methodName}()] index out of range`);
                    break;
                }

                let indexValue = structuredClone(token.value[index.value])

                token.value = indexValue.value;
                token.type = indexValue.type;
            } break;

            case "join": {
                let arg1 = methodArgs[0];
                if(arg1 == undefined || arg1.type == "Error") arg1 = typeify("','")

                if(token.type != "Array") {
                    token = new ScriptError("TypeError", `[>join()] expects type Array, found type ${token.type}`);
                    break;
                }
                if(arg1.type != "String") {
                    token = new ScriptError("TypeError", `[>join()] expects type String, found type ${arg1.type}`);
                    break;
                }
                token.type = "String";
                token.value = token.value.map(x => x.value).join(arg1.value);
            } break;

            case "replace": {
                let arg1 = methodArgs[0];
                let arg2 = methodArgs[1];

                if(arg1 == undefined) {
                    token = new ScriptError("SyntaxError", `[>replace()] must have a search argument (arg 1)`);
                    break;
                }
                if(arg2 == undefined) {
                    token = new ScriptError("SyntaxError", `[>replace()] must have a replace argument (arg 2)`);
                    break;
                }
                if(token.type != "String") {
                    token = new ScriptError("TypeError", `[>replace()] expects type String, found type ${token.type}`);
                    break;
                }
                if(arg1.type != "String") {
                    token = new ScriptError("TypeError", `[>replace()] search expects type String, found type ${arg1.type}`);
                    break;
                }
                if(arg2.type != "String") {
                    token = new ScriptError("TypeError", `[>replace()] replace expects type String, found type ${arg2.type}`);
                    break;
                }

                token.value = token.value.replace(arg1.value, arg2.value);
            } break;

            case "stringify": {
                if(token.type == "Array") {
                    token.value = "{{Array}}";
                } else if(token.type == "Number") {
                    token.value = token.value.toString();
                } else {
                    token = new ScriptError("TypeError", `[>stringify()] expects type Number or Array, found type ${token.type}`);
                    break;
                }	
                token.type = "String";
            } break;

            case "append": {
                let arg1 = methodArgs[0]

                if(arg1 == undefined) {
                    token = new ScriptError("SyntaxError", `[>append()] must have an argument`);
                    break;
                }

                if(token.type != "String" && token.type != "Array") {
                    token = new ScriptError("TypeError", `[>append()] expects type String or Array, found type ${token.type}`);
                    break;
                }

                if(arg1.type != "String" && arg1.type != "Array"){
                    token = new ScriptError("TypeError", `[>append()] argument expects type String or Array, found type ${arg1.type}`);
                    break;
                }

                if(token.type == "String" && arg1.type == "Array"){
                    token = new ScriptError("TypeError", `[>append()] cannot append type Array to type String`);
                    break;
                }

                if(token.type == "Array"){
                    if(arg1.type == "String"){
                        token.value.push(arg1);
                    } else {
                        token.value.push(...arg1.value);
                    }
                } else if(token.type == "String"){
                    if(arg1.type == "String"){
                        token.value += arg1.value;
                    }
                }
            } break;

            case "type": {
                token.value = token.type;
                token.type = "String";
            } break

            case "length": {
                if(token.type != "String" && token.type != "Array") {
                    token = new ScriptError("TypeError", `[>length()] expects type String or Array, found type ${token.type}`);
                    break;
                }


                token.value = token.value.length;
                token.type = "Number";

            } break;

            default: {
                token = new ScriptError("SyntaxError", `[${methodName}] is not a valid method`);
            } break;
        }
    }

    return token;
}

resetMemState();

setInterval(() => {
    FroggyscriptMemory.variables.Time_OSRuntime.value = Date.now() - OS_RUNTIME_START
}, 1);

async function interpretSingleLine(interval, single_input, error_trace, block_error) {
    let line = single_input;

    let token = processSingleLine(line);

    if(token.type === "Error") {
        token.currentProgram = structuredClone(config.currentProgram);

        if(!block_error) outputError(token, interval, error_trace);
        clearInterval(interval);
        return token;
    } else {
        if(token.origin == "Function"){
            let lastToken = await runFunctionBody(token.body, token);

            if(lastToken.keyword == "return"){
                token.value = lastToken.value;
                token.type = lastToken.type;
            }
        }
        // process tokens here =======================================================
        switch(token.keyword) {
            case "loaddata": {
                let key = token.key
                let variable = token.variableName;

                if(FroggyscriptMemory.savedData[key] == undefined){
                    token = new ScriptError("ReferenceError", `Key [${key}] does not exist`);
                } else {
                    let retrievedData = FroggyscriptMemory.savedData[key];
                    let valueToSet = retrievedData.value
                    
                    if(retrievedData.type == "String") valueToSet = `"${valueToSet}"`;

                    FroggyscriptMemory.lines[FroggyscriptMemory.CLOCK_INTERVAL] = `set ${variable} = ${valueToSet}`;
                    FroggyscriptMemory.CLOCK_INTERVAL--;
                }
            } break;    

            case "savedata": {
                let key = token.key;
                let value = token.value;
                let valueType = value.type;

                let dataArray = [];

                if(valueType == "Array"){
                    dataArray.push(`KEY ${key} TYPE ${valueType} START`)
                    for(let i = 0; i < value.value.length; i++){
                        let index = value.value[i];
                        dataArray.push(`INDEX TYPE ${index.type} VALUE ${index.value}`)
                    }
                    dataArray.push(`KEY ${key} TYPE ${valueType} END`)
                } else {
                    dataArray.push(`KEY ${key} TYPE ${valueType} VALUE ${value.value} END`)
                }

                let fileData = config.fileSystem['D:/Program-Data'].find(x => x.name == config.currentProgram);

                if(valueType == "Array"){
                    let startIndex = fileData.data.findIndex(x => x.match(new RegExp(`^KEY ${key} TYPE ${valueType} START$`)));

                    let endIndex = fileData.data.findIndex(x => x.match(new RegExp(`^KEY ${key} TYPE ${valueType} END$`)));

                    if((startIndex == -1 && endIndex != -1) || (startIndex != -1 && endIndex == -1)){
                        token = new ScriptError("ProgramDataError", `The program data in D:/Program-Data is malformed. Cannot save data`);
                    }
                } else {
                    let dataIndex = fileData.data.findIndex(x => x.match(new RegExp(`^KEY ${key} TYPE ${valueType} VALUE (.+?) END`)));

                    if(dataIndex == -1){
                        fileData.data.push(...dataArray);
                    } else {
                        fileData.data[dataIndex] = dataArray[0];
                    }
                }
            } break;

            case "prompt": {
                FroggyscriptMemory.CLOCK_PAUSED = true;

                let selectedIndex = token.defaultOption.value;
                let arrayOptions = token.options.value.map(x => x.value);

                if(selectedIndex < 0 || selectedIndex >= arrayOptions.length){
                    token = new ScriptError("RangeError", `[${selectedIndex}] is out of range of options`);
                } else {
                    FroggyscriptMemory.cliPromptCount++;

                    let terminalLineElement = document.createElement('div');
                    terminalLineElement.classList.add('line-container');

                    let spanElement = document.createElement('span');
                    spanElement.textContent = ">";

                    terminalLineElement.appendChild(spanElement);

                    for(let i = 0; i < arrayOptions.length; i++){
                        let option = document.createElement('span');
                        option.setAttribute("data-program", `cli-session-${config.programSession}-${FroggyscriptMemory.cliPromptCount}`);
                        option.textContent = arrayOptions[i];
                        if(i == selectedIndex) {
                            option.classList.add('selected');
                        }
                        option.style.paddingLeft = 0;
                        terminalLineElement.appendChild(option);
                        terminalLineElement.appendChild(document.createTextNode(" "));
                    }

                    function promptHandler(e){
                        let options = document.querySelectorAll(`[data-program='cli-session-${config.programSession}-${FroggyscriptMemory.cliPromptCount}']`);
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
                            document.body.removeEventListener('keyup', promptHandler);
                            setSetting("showSpinner", "false");
                            setSetting("currentSpinner", getSetting("defaultSpinner"));

                            let selectedValue = options[selectedIndex].textContent;
                            
                            FroggyscriptMemory.lines[FroggyscriptMemory.CLOCK_INTERVAL-1] = `set ${token.variableName} = "${selectedValue}"`;
                            FroggyscriptMemory.CLOCK_PAUSED = false;
                            FroggyscriptMemory.CLOCK_INTERVAL--;        
                            

                        }
                    }

                    document.body.addEventListener('keyup', promptHandler);
                    terminal.appendChild(terminalLineElement);
                    setSetting("showSpinner", "true");
                    setSetting("currentSpinner", "prompt-in-progress")
                }
            } break;

            case "arr": {
                let name = token.identifier;
                let values = token.value;
                writeVariable(name, "Array", values, true);
            } break;

            case "stringify": {
                if(getVariable(token.variableName).mutable === false) {
                    token = new ScriptError("PermissionError", `Variable [${token.variableName}] is immutable and cannot be reassigned`);
                }else if(token.variableType != "Number"){
                    token = new ScriptError("TypeError", `[${token.variableName}] must be of type Number`);
                } else {
                    let variable = getVariable(token.variableName);
                    writeVariable(variable.identifier, "String", variable.value.toString(), variable.mutable);
                }
            } break;

            case "clearterminal": {
                document.getElementById("terminal").innerHTML = "";
            } break;

            case "outf": {
                outputWithFormatting(token);
            } break;

            case "ask": {
                FroggyscriptMemory.CLOCK_PAUSED = true;
                let span = document.createElement('span');
                let inputElement = document.createElement('div');
                let elementToAppend = document.createElement('div');
        
                inputElement.setAttribute('contenteditable', 'plaintext-only');
                inputElement.setAttribute('spellcheck', 'true');
        
                span.textContent = token.prefix.value;
        
                elementToAppend.appendChild(span);
                elementToAppend.appendChild(inputElement);
        
                elementToAppend.classList.add('line-container');
        
                terminal.appendChild(elementToAppend);
                inputElement.focus();

                setSetting("currentSpinner", "ask-in-progress")
                setSetting("showSpinner", "true");
                inputElement.addEventListener('keydown', function(e){
                    if(e.key == "Enter") e.preventDefault();
                }); 

                inputElement.addEventListener('keyup', function(e){
                    if(e.key == "Enter") {
                        setSetting("currentSpinner", getSetting("defaultSpinner"))
                        setSetting("showSpinner", "false");
                        e.preventDefault();
                        inputElement.setAttribute('contenteditable', 'false');

                        token = { ...token, value: inputElement.textContent };

                        let expectedType = getVariable(token.variableName).type;

                        if(expectedType == "Number" && /^\d+$/.test(token.value)) token.value = parseInt(token.value);
                        else token.value = `"${token.value}"`;
                        
                        FroggyscriptMemory.lines[FroggyscriptMemory.CLOCK_INTERVAL-1] = `set ${token.variableName} = ${token.value}`;                       
                        FroggyscriptMemory.CLOCK_PAUSED = false;
                        FroggyscriptMemory.CLOCK_INTERVAL--;        
                    }
                }); 

            } break;

            case "filearg": {
                let expectedType = token.variableType;

                let inputValue = FroggyscriptMemory.fileArguments[FroggyscriptMemory.fileArgumentCount];

                if(expectedType === "Number") inputValue = parseFloat(inputValue);

                if(inputValue == undefined){
                    token = new ScriptError("TypeError", `Missing file argument [${fileArgumentCount}] (expecting type ${expectedType})`);

                } else if(FroggyscriptMemory.variables[token.variableName] != undefined) {
                    token = new ScriptError("ReferenceError", `Variable [${token.variableName}] already exists, cannot override`);

                } else if(isNaN(inputValue) && expectedType === "Number") {
                    token = new ScriptError("TypeError", `File argument [${fileArgumentCount}] must be of type [${expectedType}]`);
                } else {
                    writeVariable(token.variableName, token.variableType, inputValue, false);

                    FroggyscriptMemory.fileArgumentCount++;
                }
            } break;

            case "endquickloop": {
                let loopAmount = typeify(FroggyscriptMemory.lines[token.goto].replace("quickloop", "").trim()).value;

                let linesToLoop = FroggyscriptMemory.lines.slice(token.goto + 1).map(x => x.trim()).filter(x => x.length > 0 && x !== "--");

                for(let i = 0; i < loopAmount - 1; i++) {
                    for(let j = 0; j < linesToLoop.length; j++) {
                        let line = linesToLoop[j];
                        let token = processSingleLine(line);
                        if(token.type === "Error") {
                            token.currentProgram = config.currentProgram;
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
                for (let i = FroggyscriptMemory.CLOCK_INTERVAL + 1; i < FroggyscriptMemory.lines.length; i++) {
                    let currentKeyword = FroggyscriptMemory.lines[i].trim().split(" ")[0];
                    
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
                    token = new ScriptError("SyntaxError", `Missing matching [endquickloop] for [quickloop]`);
                } else {
                    setSetting("showSpinner", ["true"])
                    setSetting("currentSpinner", ["quickloop-in-progress"])

                    token.endQuickloopIndex = endIndex;
                    FroggyscriptMemory.lines[token.endQuickloopIndex] += " " + FroggyscriptMemory.CLOCK_INTERVAL;
                }
            } break;

            case "wait": {
                let ms = token.value;

                FroggyscriptMemory.CLOCK_PAUSED = true;

                setTimeout(() => {
                    FroggyscriptMemory.CLOCK_PAUSED = false;
                }, ms);

            } break;

            case "endprog": {
                resetMemState()
                clearInterval(interval);
                setSetting("showSpinner", ["false"])
                setSetting("currentSpinner", [getSetting("defaultSpinner")]);
                createEditableTerminalLine(config.currentPath + ">");
                return;
            } break;

            case "endloop": {
                if(isNaN(token.goto)) {
                    token = new ScriptError("SyntaxError", `[endloop] cannot be used without a matching [loop]`);
                }

                let loopCondition = FroggyscriptMemory.lines[token.goto].replace("loop", "").trim();
                if(evaluate(loopCondition)) {
                    FroggyscriptMemory.CLOCK_INTERVAL = token.goto;
                    setSetting("showSpinner", ["true"])
                } else {
                    setSetting("showSpinner", ["false"])
                }
            } break;

            case "loop": {
                // find paired endloop index
                let stack = [];
                let endIndex = null;
                for (let i = FroggyscriptMemory.CLOCK_INTERVAL + 1; i < FroggyscriptMemory.lines.length; i++) {
                    let currentKeyword = FroggyscriptMemory.lines[i].trim().split(" ")[0];
                    
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
                    token = new ScriptError("SyntaxError", `Missing matching [endloop] for [loop]`);
                }

                if(!token.value){
                    FroggyscriptMemory.CLOCK_INTERVAL = token.endloopIndex;
                } else {
                    FroggyscriptMemory.lines[token.endloopIndex] += " " + FroggyscriptMemory.CLOCK_INTERVAL;
                }
            } break;

            case "free": {
                if(getVariable(token.identifier) == undefined) {
                    token = new ScriptError("ReferenceError", `Variable [${token.identifier}] does not exist`);

                } else if(getVariable(token.identifier).mutable === false) {
                    token = new ScriptError("PermissionError", `Variable [${token.identifier}] is immutable and cannot be freed`);
                } else {
                    delete FroggyscriptMemory.variables[token.identifier];
                }
            } break;

            case "if": {
                let stack = [];
                let elseIndex = null;
                let endIndex = null;
            
                for (let i = FroggyscriptMemory.CLOCK_INTERVAL + 1; i < FroggyscriptMemory.lines.length; i++) {
                    let currentKeyword = FroggyscriptMemory.lines[i].trim().split(" ")[0];
            
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

                if(token.type != "Boolean"){
                    token = new ScriptError("TypeError", `[if] condition must evaluate to Boolean, found type ${token.type}`);
                    break;
                }

                token.elseKeywordIndex = elseIndex;
                token.endKeywordIndex = endIndex;
            
                if (endIndex === null) {
                    token = new ScriptError("SyntaxError", `Missing matching [endif] for [if]`);
                    break;
                }

                if (token.value === true) {
                    if (elseIndex !== null) {
                        FroggyscriptMemory.lines[elseIndex] = `goto ${endIndex}`;
                    }
                    // Do nothing if linkedElse is null
                } else if (token.value === false) {
                    if (elseIndex === null) {
                        FroggyscriptMemory.CLOCK_INTERVAL = endIndex;
                    } else {
                        FroggyscriptMemory.CLOCK_INTERVAL = elseIndex;
                    }
                }
                
            } break;

            case "set": {
                let referencedVar = getVariable(token.identifier);

                if (referencedVar == undefined) {
                    token = new ScriptError("ReferenceError", `Variable [${token.identifier}] does not exist`);
                } else if (referencedVar.mutable === false) {
                    token = new ScriptError("PermissionError", `Variable [${token.identifier}] is immutable and cannot be reassigned`);
                } else {
                    // Write the new value to the variable
                    if (token.type === "Error") {
                        token = new ScriptError("EvaluationError", `Cannot evaluate [${token.originalInput}]`);
                    } else if(referencedVar.type !== token.type) {
                        token = new ScriptError("TypeError", `Cannot assign a value of type [${token.type}] to variable [${token.identifier}], which\nis of type [${referencedVar.type}]`);
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

            case "error":
            case "out": {
                if(token.type == "Array"){
                    token.type = "String";
                    token.value = "{{Array}}";
                }
                if(token.keyword == "error") singleLineError(token.value);
                else output(token);
            } break;

            case "goto": {
                let newI = token.value;
                if(newI >= 0 && newI < FroggyscriptMemory.lines.length) {
                    FroggyscriptMemory.CLOCK_INTERVAL = newI - 1;
                } else {
                    token = new ScriptError("ReferenceError", `Line ${newI} does not exist`);
                }
            } break;

            case "SKIP_LINE":
            case "func":
            case "endfunc":
            case "return":
            case "else":
            case "endif": { } break;

            default: {
                token = new ScriptError("InterpreterError", `Unknown keyword [${token.keyword}]`);
            } break;
        }

        if(token.type === "Error") {
            token.currentProgram = config.currentProgram;
            outputError(token, interval);
            return;
        }
        if(FroggyscriptMemory.CLOCK_INTERVAL >= FroggyscriptMemory.lines.length) {
            resetTerminalForUse(interval);
            return;
        }
    }

    // keywords that reset the temp variables
    // endfunc already does this bc its in the runFunctionBody() function
    switch(token.keyword) {
    }

    return token;
}

function interpreter(input, fileArguments) {
    let lines = input.split('\n').map(x => x.trim()).filter(x => x.length > 0 && x !== "--");

    let fileArgumentCount = 0;

    resetMemState();

    FroggyscriptMemory.lines = lines;
    FroggyscriptMemory.fileArguments = fileArguments;
    FroggyscriptMemory.fileArgumentCount = fileArgumentCount;
    FroggyscriptMemory.cliPromptCount = 0;
    FroggyscriptMemory.CLOCK_PAUSED = false;

    writeVariable("OS_ProgramName", "String", structuredClone(config).currentProgram, false);

    if(FroggyscriptMemory.lines[FroggyscriptMemory.lines.length - 1].trim() !== "endprog") {
        output({value: `PrecheckError -> [endprog] must be the last line of the program <-`});
        createEditableTerminalLine(config.currentPath + ">");
        return;
    }

    const PROGRAM_RUNTIME_START = Date.now();

    let dataError = 0;

    let clock = setInterval(() => {
        if(window.debugWindow){
            FroggyscriptMemory.CLOCK_PAUSED = true;
            window.debugWindow.postMessage({ type: 'data', FroggyscriptMemory }, '*');
        }
    
        if(FroggyscriptMemory.CLOCK_PAUSED) return;
        FroggyscriptMemory.variables.Time_ProgramRuntime.value = Date.now() - PROGRAM_RUNTIME_START;
        FroggyscriptMemory.variables.Time_MsEpoch.value = Date.now();

        let programDataFile = config.fileSystem['D:/Program-Data'].find(x => x.name == config.currentProgram).data;

        for(let i = 0; i < programDataFile.length; i++){
            let dataLine = programDataFile[i];

            let dataMatchNotArray = dataLine.match(
                /^KEY (.+?) TYPE (String|Number|Boolean) VALUE (.+?) END$/
            )

            if(dataMatchNotArray != null){
                let key = dataMatchNotArray[1];
                let type = dataMatchNotArray[2];
                let value = dataMatchNotArray[3];

                if(type == "String") value = `"${value}"`;

                FroggyscriptMemory.savedData[key] = typeify(value)
            } else {
                let dataMatchArrayStart = dataLine.match(
                    /^KEY (.+?) TYPE Array START$/
                )

                let dataMatchArrayEnd = dataLine.match(
                    /^KEY (.+?) TYPE Array END$/
                )

                if(programDataFile.length != 0 && (dataMatchArrayStart == null || dataMatchArrayEnd == null)){
                    dataError++;
                }

                if(dataMatchArrayStart != null){
                    let key = dataMatchArrayStart[1];
                    let type = "Array";
                    let value = [];

                    for(let j = i + 1; j < programDataFile.length; j++){
                        let arrayDataLine = programDataFile[j];

                        let arrayDataMatch = arrayDataLine.match(
                            /^TYPE (String|Number|Boolean) VALUE (.+?)$/
                        )

                        if(arrayDataMatch != null){
                            let arrayType = arrayDataMatch[1];
                            let arrayValue = arrayDataMatch[2];

                            if(arrayType == "String") arrayValue = `"${arrayValue}"`;
                            value.push(arrayValue)
                        }
                    }

                    value = "$"+value.join(",")
                    FroggyscriptMemory.savedData[key] = {type, value}
                }
            }
        }

        if(dataError == 1){
            createTerminalLine(`Program data is malformed. Some data cannot be loaded`, config.alertText, {translate: false});
        }

        if(FroggyscriptMemory.CLOCK_PAUSED == false) {
            if(FroggyscriptMemory.CLOCK_INTERVAL < FroggyscriptMemory.lines.length) {
                let line = FroggyscriptMemory.lines[FroggyscriptMemory.CLOCK_INTERVAL]
                let token = interpretSingleLine(clock, line);
                FroggyscriptMemory.CLOCK_INTERVAL++;
            } else {
                resetTerminalForUse(clock);
            }
        }
    }, FroggyscriptMemory.CLOCK_CYCLE_LENGTH);

    document.body.addEventListener("keydown", function(e){
        if(e.key == "Delete"){
            clearInterval(clock);
            createTerminalLine("Program escaped.", config.alertText, {translate: false});
            setSetting("showSpinner", ["false"])
            createEditableTerminalLine(config.currentPath + ">");
        }
    }, {once: true});
}