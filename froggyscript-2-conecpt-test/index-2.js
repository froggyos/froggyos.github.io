// math evaluate
const mem = {
    variables: {},
};

class Number {
    constructor(value) {
        this.displayValue = `${value}`;
        this.value = +value;
    }
}

class String {

}

class Error {
    constructor(type, message, line) {
        this.type = type;
        this.message = message;
        this.line = line;
    }

    get display() {
        return `${this.type} -> ${this.message} <- at line: ${this.line}`;
    }
}

function checkType(value) {
}

function parser(input){
    let lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let parsed = [];
    for(let line of lines) {
        let lineNumber = lines.indexOf(line) + 1;
        let keyword = line.split(' ')[0];
        let args = line.split(' ').slice(1).join(" ");
        
        if (keyword === "nmb") {
            // check if the declaration is valid with regex
            let regex = /nmb\s+([a-zA-Z_]*)\s*=\s*([0-9]+(\.[0-9]+)?)/;
            let match = line.match(regex);
            if (match) {
                let varName = match[1];
                let value = match[2];
                mem.variables[varName] = new Number(value);
                parsed.push(mem.variables[varName]);
            } else {
                parsed.push(new Error("SyntaxError", "invalid number declaration", lineNumber));
            }
        }
        
        //parsed.push(keyword, args);   
    }
    return parsed;
}

function interpreter(lines) {
    mem.variables = {};
    let parsed = parser(lines);
    let i = 0;
    let clock = setInterval(() => {
        let line = parsed[i];
        console.log(line)
        i++;
        if (i >= parsed.length) {
            clearInterval(clock);
            return;
        }
    }, 1);
}