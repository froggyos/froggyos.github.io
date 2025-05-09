/**
 * Represents a language keyword in the interpreter.
 * Each keyword has a type, a parsing scheme, and optional pre- and post-processing functions.
 */
class Keyword {
    /**
     * A mapping of all registered keywords to their corresponding Keyword instances.
     * @type {Object.<string, Keyword>}
     */
    static schemes = {};

    /**
     * Constructs a new Keyword and registers it in the static schemes map.
     *
     * @param {string} keyword - The literal keyword string (e.g., 'str', 'out').
     * @param {string} type - The type of keyword (e.g., 'basic', 'assigner').
     * @param {string[]} scheme - An array describing the expected token types.
     * @param {function(Token[], Interpreter): void} [post] - A function called after validation to execute keyword logic.
     * @param {function(Token[], Interpreter, Keyword): void} [pre] - A function called before validation, allows modification of the keyword or environment.
     * @example
     * let KEYWORD_STR = new Keyword('str', "assigner", ['Assigner', 'Assignee', 'Assignment', 'String'], {
     *     post: (tokens, interp) => {
     *         let identifier = tokens[1];
     *         let value = tokens[3];
     *         interp.setVariable(identifier.value, value.value, 'String', true);
     *     }
     * });
     * @example
     * const KEYWORD_SET = new Keyword('set', "assigner", ['Assigner', 'Assignee', 'Assignment', '*'], {
     *     pre: (tokens, interp, keyword) => {
     *         keyword.scheme[3] = interp.getVariable(tokens[1].value).type;
     *     },
     *     post: (tokens, interp) => {
     *         let identifier = tokens[1];
     *         let value = tokens[3];
     * 
     *         interp.setVariable(identifier.value, value.value, interp.getVariable(tokens[1].value).type, true);
     *     }
     * });
     */
    constructor(keyword, type, scheme, options = {}) {
        this.keyword = keyword;
        this.scheme = scheme;
        this.type = type;

        const { post, pre } = options;

        /**
         * The function executed after token validation.
         * @type {function(Token[], Interpreter): void}
         */
        this.fn = (args, interp) => {
            for(let i = 0; i < this.scheme.length; i++) {
                if(!args[i]) {
                    return interp.outputError(new InterpreterError('SyntaxError', `Expected [${this.scheme[i]}]`, args, interp.interval, i));
                }
                if (!new RegExp(args[i].type).test(this.scheme[i])) {
                    if(scheme[i] == "Assignment"){
                        return interp.outputError(new InterpreterError('SyntaxError', `Expected assignment, found ${args[i].type}`, args, interp.interval, args[i].position));
                    } else {
                        return interp.outputError(new InterpreterError('TypeError', `Expected type ${this.scheme[i]}, found type ${args[i].type}`, args, interp.interval, args[i].position));
                    }

                }
            }

            if (typeof post === 'function') {
                post(args, interp);
            }
        };

        /**
         * The function executed before token validation.
         * @type {function(Token[], Interpreter, Keyword): void}
         */
        this.prefn = (args, interp) => {
            if (typeof pre === 'function') {
                pre(args, interp, this);
            }
        }

        Keyword.schemes[keyword] = this;
    }
}

class Token {
    static specs = [];

    static generateSpecs() {
        let basicKeywords = []
        let assignerKeywords = []
        for (const [keyword, scheme] of Object.entries(Keyword.schemes)) {
            if (scheme.type === 'basic') {
                basicKeywords.push(keyword);
            }
            if (scheme.type === 'assigner') {
                assignerKeywords.push(keyword);
            }
        }
        
        Token.specs = [
            ['Keyword', new RegExp(`\\b(${basicKeywords.join('|')})\\b`)],
            ['Assigner', new RegExp(`\\b(${assignerKeywords.join('|')})\\b`)],
            ['Number', /\b\d+\b/],
            ["Oneliner", /^#/],
            ['String', /('|")[^\1]*\1/],
            ['Array', /\$([^\$]+)\$/],
            ['Boolean', /\b(true|false)\b/],
            ["Calculate", /%/],
            ['Identifier', /\b[a-zA-Z][a-zA-Z0-9_]*\b/],
            ["FunctionCall", /\b@[a-zA-Z][a-zA-Z0-9_]*/],
            ['Assignment', /[=]/],
            ["Comma", /,/],
            ['Operator', /[+-/\*]/],
            ['Whitespace', /[ \t]+/],
            ['MethodInitiator', /\>/],
            ["LeftParenthesis", /\(/],
            ["RightParenthesis", /\)/],
        ]
    }

    static createNewTokenType(name, regex) {
        if (Token.specs.some(([type]) => type === name)) {
            throw new Error(`Token type [${name}] already exists`);
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

    toString() {
        return `${this.message}\n\u00A0in line: ${this.line}\n\u00A0at position: ${this.pos}`;
    }
}

// meow meow meow meow meow

class Interpreter {
    static interpreters = [];
    constructor(input) {
        this.lines = input.split("\n").map(line => line.trim()).filter(line => line.length > 0);
        this.variables = {};
        this.temporaryVariables = {};
        this.functions = {};
        this.paused = false;
        this.clock = null;
        this.interval = 0;
        this.iteration = 0;
        this.interval_length = 1;
        Interpreter.interpreters.push(this);
        this.error = false;
        this.running = false
    
    }

    output(value) {
        document.getElementById('out').value += `${value}\n`;
    }

    outputError(error) {
        if(this.error) return;
        this.error = true;
        document.getElementById('out').value += `\n${error.toString()}`;
        this.kill();
    }

    evaluate(tokens) {
        let expr = '';

        for (let token of tokens) {
            if (token.type === 'Number' || token.type === 'Operator') {
                expr += token.value;
            } else if (token.type === 'LeftParenthesis') {
                expr += '(';
            } else if (token.type === 'RightParenthesis') {
                expr += ')';
            } else {
                return this.outputError(`Unsupported token type: ${token.type}`);
            }
        }

        try {
            return math.evaluate(expr);
        } catch (err) {
            this.outputError('Math evaluation failed:', expr);
            throw err;
        }
    }

    getVariable(name) {
        if(this.variables[name]) {
            return this.variables[name];
        } else if(this.temporaryVariables[name]) {
            return this.temporaryVariables[name];
        } else {
            return false;
        }
    }

    setVariable(name, value, type, mutable) {
        if(this.variables[name] && this.variables[name].mutable) {
            try {
                this.variables[name].value = math.evaluate(value);
            } catch (er) {
                this.variables[name].value = value;
            }
            this.variables[name].type = type;
            this.variables[name].mutable = mutable;
        } else {
            if(!this.variables[name]) {
                this.variables[name] = {
                    type: type,
                    mutable: mutable,
                };

                try {
                    this.variables[name].value = math.evaluate(value);
                } catch (er) {
                    this.variables[name].value = value;
                }
            }
        }
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
                    if (type !== 'Whitespace') {
                        tokens.push(new Token(type, match[0], pos));
                    }
                    pos += match[0].length;
                    matched = true;
                    break;
                }
            }
    
            if (!matched) {
                return new InterpreterError('SyntaxError', `Unexpected [${line[pos]}]`, tokens, this.interval, pos);
            }
        }

        // define mutations here
        // for each token, if the type is METHOD_INITIATOR, if the next token is IDENTIFIER, change the type to METHOD
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type === 'MethodInitiator') {
                if (i + 1 < tokens.length && tokens[i + 1].type === 'Identifier') {
                    tokens[i + 1].type = 'Method';
                } else {
                    return InterpreterError('SyntaxError', `Expected Method after MethodInitiator`, tokens, this.interval, tokens[i].position);
                }
            }
        }

        // if there is a sequence of "Assigner", "Identifier", "Assignment", change "Identifier" to "Asignee"
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type === 'Assigner') {
                if (i + 1 < tokens.length && tokens[i + 1].type === 'Identifier') {
                    tokens[i + 1].type = 'Assignee';
                } else {
                    return new InterpreterError('SyntaxError', `Expected Identifier after Assigner`, tokens, this.interval, tokens[i].position);
                }
            }
        }


        // parse methods here depending on the type of token, make a Methods class and such
        tokens.forEach((token, index) => {
            if (token.type === 'Calculate') {
                if (tokens[index + 1]?.type !== 'LeftParenthesis') {
                    return new InterpreterError('SyntaxError', `Expected [(] after [calc]`, tokens, this.interval, tokens[index].position);
                }

                let openParens = 1;
                let exprTokens = [];
                let i = index + 2;

                while (i < tokens.length && openParens > 0) {
                    const t = tokens[i];
                    if (t.type === 'LeftParenthesis') openParens++;
                    else if (t.type === 'RightParenthesis') openParens--;

                    if (openParens > 0) exprTokens.push(t);
                    i++;
                }

                if (openParens !== 0) {
                    return new InterpreterError('SyntaxError', `Unmatched parentheses in [calc] expression`, tokens, this.interval, tokens[index].position);
                }

                const expr = exprTokens.map(t => t.value).join('');
                let result;
                try {
                    result = math.evaluate(expr);
                } catch (err) {
                    return new InterpreterError('EvalError', `Invalid expression: [${expr}]`, tokens, this.interval, tokens[index].position);
                }

                // Replace from Calculate to closing parenthesis with result token
                const endIndex = i; // one past the last token used
                tokens.splice(index, endIndex - index, new Token('Number', result, token.position));
            }
        });

        tokens.forEach((token, index) => {
            if(token.type == "Identifier") {
                let variable = this.getVariable(token.value);

                if(variable == false){
                    return new InterpreterError('ReferenceError', `Variable [${token.value}] is not defined`, tokens, this.interval, token.position);
                }

                token.type = variable.type;
                token.value = variable.value;
            }
        })

        return tokens;
    }

    run() {
        if(this.running) return;
        this.running = true;
        Token.generateSpecs();
        this.error = false;
        this.clock = setInterval(() => {
            this.iteration++;
            if(this.paused) return;

            let line = this.lines[this.interval];

            if(line == undefined) {
                this.kill();
                return;
            }

            let token = this.tokenize(line);

            if(token instanceof InterpreterError) {
                this.outputError(token);
            }

            if(token.some(t => t instanceof InterpreterError)) {
                this.outputError(token.find(t => t instanceof InterpreterError));
            }

            if(["Keyword", "Assigner"].includes(token[0].type)) {
                Keyword.schemes[token[0].value].prefn(token, this);
                let keywordResult = Keyword.schemes[token[0].value].fn(token, this);


                if(keywordResult instanceof InterpreterError) {
                    this.outputError(keywordResult);
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

    resetMemory() {
        this.variables = {};
        this.temporaryVariables = {};
        this.functions = {};
        this.paused = false;
        this.clock = null;
        this.interval = 0;
        this.iteration = 0;
        this.interval_length = 1;
        Interpreter.interpreters.push(this);
        this.error = false;
        this.running = false;
    }

    kill() {
        clearInterval(this.clock);
        this.resetMemory();
        Interpreter.interpreters = Interpreter.interpreters.filter(interp => interp !== this);
    }
}

const KEYWORD_STR = new Keyword('str', "assigner", ['Assigner', 'Assignee', 'Assignment', 'String'], {
    post: (tokens, interp) => {
        let identifier = tokens[1];
        let value = tokens[3];
        interp.setVariable(identifier.value, value.value, 'String', true);
    }
});

const KEYWORD_NUM = new Keyword('num', "assigner", ['Assigner', 'Assignee', 'Assignment', 'Number'], {
    post: (tokens, interp) => {
        let identifier = tokens[1];
        let value = tokens[3];

        interp.setVariable(identifier.value, math.evaluate(value.value), 'Number', true);
    }
});

const KEYWORD_BOOL = new Keyword('bln', "assigner", ['Assigner', 'Assignee', 'Assignment', 'Boolean'], {
    post: (tokens, interp) => {
        let identifier = tokens[1];
        let value = tokens[3];

        interp.setVariable(identifier.value, value.value, 'Boolean', true);
    }
});

const KEYWORD_OUT = new Keyword('out', "basic", ['Keyword', 'String|Number|Boolean'], {
    post: (tokens, interp) => {
        let value = tokens[1];
        interp.output(value.value);
    }
});

const KEYWORD_SET = new Keyword('set', "assigner", ['Assigner', 'Assignee', 'Assignment', '*'], {
    pre: (tokens, interp, keyword) => {
        keyword.scheme[3] = interp.getVariable(tokens[1].value).type;
    },
    post: (tokens, interp) => {
        let identifier = tokens[1];
        let value = tokens[3];

        interp.setVariable(identifier.value, value.value, interp.getVariable(tokens[1].value).type, true);
    }
});

const KEYWORD_ARR = new Keyword('arr', "assigner", ['Assigner', 'Assignee', 'Assignment', 'Array'], {
    post: (tokens, interp) => {
        let identifier = tokens[1];
        let value = tokens[3];

        value.value = value.value.slice(1, -1);

        let tokenizedArray = interp.tokenize(value.value);

        let valueArray = [];

        tokenizedArray.forEach((token, index) => {
            if(token.type != "Comma") {
                if(token.type == "String") {
                    token.value = math.evaluate(token.value);
                    valueArray.push(token);
                } else if(token.type == "Number" && typeof token.value == "string") {
                    token.value = math.evaluate(token.value);
                    valueArray.push(token);
                } else if(token.type == "Number" || token.type == "Boolean") {
                    valueArray.push(token);
                }
            }
        })

        interp.setVariable(identifier.value, valueArray, 'Array', true);
    }
});