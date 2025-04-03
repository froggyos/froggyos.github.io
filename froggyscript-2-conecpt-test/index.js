const mem = {
    variables: {},
};

function typeify(value) {
    let typeObj = {
        type: null,
        value: null,
        originalInput: value,
    };
    // string
    if(value.match(/^["'].*["']$/g)) {
        typeObj.type = "string";
        typeObj.value = value.replace(/^["']|["']$/g, '');

    } else if(value === "true" || value === "false") {
        typeObj.type = "boolean";
        typeObj.value = (value === "true");

    } else if(value.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/g)) { // identifier (variable name)
        typeObj.type = "variable identifier";

    } else if(value.match(/\d/g)) {
        let error = false;
        let errMsg = null;
        try {
            math.evaluate(value)
        } catch (e) {
            error = true;
            errMsg = e.message;
        }

        if (error) {
            typeObj.type = "error";
            typeObj.value = `Error evaluating: ${typeObj.originalInput}`;
        } else {
            typeObj.type = "number";
            typeObj.value = math.evaluate(value);
        }

    } else {
        typeObj.type = "error";
        typeObj.value = `Cannot typeify: ${value}`;
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
                    type: "error",
                    value: `Syntax error: str must be followed by a variable assignment`,
                };
            } else {
                let assignedValue = input.replace(/^str\s+/, '').split('=')[1].trim();
                token = {...token, ...typeify(assignedValue) };
            }
        } break;
    }
    return token;
}

function interpreter(input) {
    let lines = input.split('\n');
    for (let line of lines) {
        let token = lexer(line);
        console.log(token);
    }
}