    // input: String,
    // type: String, // statement, oneliner, function
    // spec: {
    //     // if statement
    //     keyword: String,
    //     args: Array of Tokens // array of strings, numbers, booleans, arrays

    //     // if oneliner
    //     methods: Array of MethodToken,

    //     // if function
    //     name: String,
    //     params: Array,
    //     body: Array of Tokens // array of statements and/or oneliners
    // }
// }

// new Token = {
//     input: String,
//     type: String, // String, Number, Boolean, Array
//     methods: Array of MethodToken, // if any
//     value: evaluator(input)
// }

class Keyword {
    static schemes = {};

    constructor(keyword, scheme, callback) {
        this.keyword = keyword;
        this.scheme = scheme;

        this.fn = (args, interp) => {
            for(let i = 0; i < scheme.length; i++) {
                if (scheme[i] != args[i].type) {
                    return new InterpreterError('TypeError', `Expected ${scheme[i]} but got ${args[i].type}`, args, this.interval, args[i].position);
                }
            }

            if (typeof callback === 'function') {
                callback(args, interp);
            }
        };

        Keyword.schemes[keyword] = this;
    }
}

class Token {
    static specs = [];

    static generateSpecs() {
        Token.specs = [
            ['KEYWORD', new RegExp(`\\b(${Object.keys(Keyword.schemes).join('|')})\\b`)],
            ["ONELINER", /^#/],
            ['NUMBER', /\b\d+\b/],
            ['STRING', /('|")[^\1]*\1/],
            ['ARRAY', /\$([^\$]+)\$/],
            ['BOOLEAN', /\b(true|false)\b/],
            ['IDENTIFIER', /\b[a-zA-Z][a-zA-Z0-9_]*\b/],
            ["FUNCTION_CALL", /\b@[a-zA-Z][a-zA-Z0-9_]/],
            ['ASSIGNMENT', /[=]/],
            ['OPERATOR', /[+]/],
            ['WHITESPACE', /[ \t]+/],
            ['METHOD_INITIATOR', /\>/],
            ["LEFT_PARENTHESIS", /\(/],
            ["RIGHT_PARENTHESIS", /\)/],
            ["COMMA", /,/],
        ]
    }

    static createNewTokenType(name, regex) {
        if (Token.specs.some(([type]) => type === name)) {
            throw new Error(`Token type ${name} already exists`);
        }
        Token.specs.push([name, regex]);
    }

    constructor(type, value, position) {
        this.type = type;
        this.value = value;
        this.position = position;
    }
  
    toString() {
        return `Token(${this.type})`;
    }
}

class InterpreterError {
    constructor(type, message, tokens, line = null, pos = null) {
        this.error = type;
        this.message = message;
        this.tokens = tokens;
        this.line = line;
        this.pos = pos;
    }
}

// meow meow meow meow meow
let KEYWORD_STR = new Keyword('str', ['KEYWORD', 'IDENTIFIER', 'ASSIGNMENT', 'STRING'], (tokens, interp) => {
    let identifier = tokens[1];
    let value = tokens[3];
});

Token.generateSpecs();

class Interpreter {
    static interpreters = [];
    constructor(input) {
        this.lines = input.split("\n").map(line => line.trim()).filter(line => line.length > 0);
        this.variables = {};
        this.functions = {};
        this.paused = false;
        this.clock = null;
        this.interval = 0;
        this.iteration = 0;
        this.interval_length = 1;
        Interpreter.interpreters.push(this);
    }

    tokenize(line) {
        const tokens = [];
        let pos = 0;
    
        while (pos < line.length) {
            let matched = false;
    
            for (const [type, baseRegex] of Token.specs) {
                const regex = new RegExp(baseRegex.source, 'y'); // sticky match
                regex.lastIndex = pos;
    
                const match = regex.exec(line);
    
                if (match) {
                    if (type !== 'WHITESPACE') {
                        tokens.push(new Token(type, match[0], pos));
                    }
                    pos += match[0].length;
                    matched = true;
                    break;
                }
            }
    
            if (!matched) {
                clearInterval(this.clock);
                return new InterpreterError('SyntaxError', `Unexpected ${line[pos]} at position ${pos} in line ${this.interval}`, tokens);
            }
        }

        // for each token, if the type is METHOD_INITIATOR, if the next token is IDENTIFIER, change the type to METHOD
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type === 'METHOD_INITIATOR') {
                if (i + 1 < tokens.length && tokens[i + 1].type === 'IDENTIFIER') {
                    tokens[i + 1].type = 'METHOD';
                } else {
                    return new InterpreterError('SyntaxError', `Expected IDENTIFIER after METHOD_INITIATOR\nline: ${this.interval}\nposition: ${tokens[i].position}`, tokens);
                }
            }
        }

        // parse methods here depending on the type of token, make a Methods class and such
    
        return tokens;
    }

    run() {
        this.clock = setInterval(() => {
            this.iteration++;
            if(this.paused) return;
            if(this.interval >= this.lines.length) {
                clearInterval(this.clock);
                return;
            }
            const line = this.lines[this.interval];

            let tokens = this.tokenize(line);

            if(tokens[0].type === "KEYWORD") {
                let keywordResult = Keyword.schemes[tokens[0].value].fn(tokens, this);
                
                if(keywordResult instanceof InterpreterError) {
                    keywordResult.message += `\nline: ${this.interval + 1}\nposition: ${keywordResult.pos}`;
                    console.log(keywordResult);
                    clearInterval(this.clock);
                }
            }


            this.interval++;
        }, this.interval_length);
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    evaluate(input) {
        return math.evaluate(input);
    }
}