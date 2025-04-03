const mem = {
    variables: {},
};

function evaluateWithVariable(expression) {
    // ...
    math.evaluate();
}

function typeify(value) {
    let typeObj = {
        type: null,
        value: null,
        originalInput: value,
    };
    // string
    console.log(value)
    if(value.match(/^["'].*["']$/g)) {
        typeObj.type = "String";
        typeObj.value = value.replace(/^["']|["']$/g, '');

    } else if(value === "true" || value === "false") {
        typeObj.type = "Boolean";
        typeObj.value = (value === "true");

    } else if(/[(==)(!=)(>=)(<=)]/.test(value)) { // comparison operators
        typeObj.type = "Boolean";
        typeObj.value = math.evaluate(value); // evaluateWithVariables(value)

    } else if(value.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/g)) { // identifier (variable name)
        typeObj.type = "VariableIdentifier";

    } else if(value.match(/\d/g)) {
        let error = false;
        let errMsg = null;
        try {
            math.evaluate(value) // evaluateWithVariables(value)
        } catch (e) {
            error = true;
            errMsg = e.message;
        }

        if (error) {
            typeObj.type = "Error";
            typeObj.value = `EvaluationError -> ${typeObj.originalInput} <-`;
        } else {
            typeObj.type = "Number";
            typeObj.value = math.evaluate(value); // evaluateWithVariables(value)
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
                    token = {...token, ...typeify(assignedValue) };
                }
            }
        } break;
    }
    return token;
}

function interpreter(input) {
    let lines = input.split('\n');
    for (let line of lines) {
        let i = lines.indexOf(line) + 1;
        let token = lexer(line);
        if(token.type === "Error") {
            console.error(`${token.value} at line: ${i}`);
            break;
        }
        console.log(token);
    }
}