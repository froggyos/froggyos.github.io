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
     * @param {Object} [options] - Optional settings for the keyword.
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
        this.argumentOverride = null;

        const { post, pre } = options;

        /**
         * The function executed after token validation.
         * @type {function(Token[], Interpreter): void}
         */
        this.fn = (args, interp) => {
            if(this.argumentOverride) args = this.argumentOverride;
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
                this.argumentOverride = null;
            }
        };

        /**
         * The function executed before token validation.
         * @type {function(Token[], Interpreter, Keyword): void}
         */
        this.prefn = (args, interp) => {
            if (typeof pre === 'function') {
                let tokens = pre(args, interp, this);
                if(tokens != undefined) {
                    this.argumentOverride = tokens;
                }
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
            ['String', /'(?:\\'|[^'])*'|"(?:\\"|[^"])*"/],
            ['Calculation_Equals', / == /],
            ['Calculation_Nequals', / != /],
            ['Calculation_LessThan', / < /],
            ['Calculation_GreaterThan', / > /],
            ['Calculation_LessThanEquals', / <= /],
            ['Calculation_GreaterThanEquals', / >= /],
            ['MethodInitiator', />/],
            ['Array', /\$([^\$]+)\$/],
            ['Boolean', /\b(true|false)\b/],
            ['Identifier', /\b[a-zA-Z][a-zA-Z0-9_]*\b/],
            ["FunctionCall", /\b@[a-zA-Z][a-zA-Z0-9_]*/],
            ['Assignment', /=/],
            ["Comma", /,/],
            ['Operator', /[+-/\*\^]/],
            ['Whitespace', /[ \t]+/],
            ["LeftParenthesis", /\(/],
            ["RightParenthesis", /\)/],
            ["CalculateStart", /{/],
            ["CalculateEnd", /}/],
            ["Escape", /\\/],
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
        this.methods = [];
    }
  
    toString() {
        return Interpreter.trimQuotes(this.value);
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

class Method {
    static registry = new Map(); // Map<type, Map<methodName, Method>>

    /**
     * @param {string} name - Method name.
     * @param {string} type - Token type this method is for.
     * @param {function(Token, Token[], Interpreter): any} fn - The method logic.
     * @param {string[]} [args=[]] - Arg types, with optional ones like 'String?'.
     */
    constructor(name, type, fn, args = []) {
        this.name = name;
        this.type = type;
        this.fn = fn;
        this.args = args.map(arg => ({
            type: arg.replace(/\?$/, ''),
            optional: arg.endsWith('?')
        }));

        const types = Array.isArray(type) ? type : [type];

        // Register this method for each provided type
        types.forEach(t => {
            if (!Method.registry.has(t)) {
                Method.registry.set(t, new Map());
            }
            Method.registry.get(t).set(name, this);
        });
    }

    static get(type, name) {
        return Method.registry.get(type)?.get(name) ?? null;
    }

    static list(type) {
        return [...(Method.registry.get(type)?.keys() ?? [])];
    }

    /**
     * Validates token argument types against the required signature.
     * @param {Token[]} args 
     * @returns {boolean}
     */
    validateArgs(args) {
        for (let i = 0; i < this.args.length; i++) {
            const expected = this.args[i];
            const actual = args[i];

            if (!actual) {
                if (!expected.optional) return false;
                continue; // it's okay if the argument is missing and optional
            }

            if (actual.type !== expected.type) return false;
        }

        // If there are more args than expected, fail
        if (args.length > this.args.length) {
            return false;
        }

        return true;
    }
}


class Interpreter {
    static interpreters = [];
    static blockErrorOutput = false;
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
        this.running = false
    
    }

    static trimQuotes(value) {
        return typeof value === 'string' ? value.replace(/^['"]|['"]$/g, '') : value;
    }

    output(value) {
        if(value == undefined) return;
        document.getElementById('out').value += `${value}\n`;
    }

    /**
     * Outputs an error message to the console and kills the interpreter.
     * @param {InterpreterError} error 
     * @returns 
     */
    outputError(error) {
        if(Interpreter.blockErrorOutput) return;
        Interpreter.blockErrorOutput = true;
        this.output(`\n${error.toString()}`);
        this.kill();
    }

    evaluateMathExpression(tokens) {
        let expr = '';

        for (let token of tokens) {
            if (["Number", "Operator"].includes(token.type) || token.type.startsWith("Calculation_")) {
                expr += token.value;
            } else if (token.type === 'LeftParenthesis') {
                expr += '(';
            } else if (token.type === 'RightParenthesis') {
                expr += ')';
            } else {
                if(token.type === 'Identifier') {
                    let variable = this.getVariable(token.value);
                    if(variable == false){
                        return this.outputError(new InterpreterError('ReferenceError', `Variable [${token.value}] is not defined`, tokens, this.interval, token.position));
                    } else if(variable.type != "Number") {
                        return this.outputError(new InterpreterError('TypeError', `Expected type Number, found type ${variable.type} in Math Expression`, tokens, this.interval, token.position));
                    }
                    expr += variable.value;
                } else return this.outputError(`Unsupported token type: ${token.type}`);
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
            this.variables[name].value = value;
            this.variables[name].type = type;
            this.variables[name].mutable = mutable;
        } else {
            if(!this.variables[name]) {
                this.variables[name] = {
                    type: type,
                    mutable: mutable,
                    value: value,
                };           
            }
        }
    }

    evaluate(token) {
        try {
            return math.evaluate(token.value);
        } catch (err) {
            this.outputError(new InterpreterError('MathError', `Math evaluation failed: ${token.value}`, token, this.interval, token.position));
        }
    }

    tokenize(line) {
        let tokens = [];
        let pos = 0;

        let iterations = 0;
    
        while (pos < line.length) {
            let matched = false;

            if (iterations++ > 10000) {
                tokens.push(new InterpreterError('TokenizationError', `Infinite loop detected in tokenization`, tokens, this.interval, pos));
                break;
            }
    
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
                tokens.push(new InterpreterError('SyntaxError', `Unexpected [${line[pos]}]`, tokens, this.interval, pos));
            }

            if(tokens[tokens.length - 1] instanceof InterpreterError) {
                break;
            }
        }

        // define mutations here
        // for each token, if the type is METHOD_INITIATOR, if the next token is IDENTIFIER, change the type to METHOD
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type === 'MethodInitiator') {
                if (i + 1 < tokens.length && tokens[i + 1].type === 'Identifier') {
                    tokens[i + 1].type = 'Method';
                } else {
                    tokens.push(new InterpreterError('SyntaxError', `Expected Method after MethodInitiator not found`, tokens, this.interval, tokens[i].position));
                }
            }
        }

        // if there is a sequence of "Assigner", "Identifier", "Assignment", change "Identifier" to "Asignee"
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type === 'Assigner') {
                if (i + 1 < tokens.length && tokens[i + 1].type === 'Identifier') {
                    tokens[i + 1].type = 'Assignee';
                } else {
                    tokens.push(new InterpreterError('SyntaxError', `Expected Identifier after Assigner not found`, tokens, this.interval, tokens[i].position));
                }
            }
        }

        // parse methods here depending on the type of token, make a Methods class and such
        tokens.forEach((token, index) => {
            if (token.type === 'CalculateStart') {
                let exprTokens = [];
                let endFound = false;
                for(let j = index + 1; j < tokens.length; j++) {
                    if (tokens[j].type === 'CalculateEnd') {
                        endFound = true;
                        break;
                    }

                    exprTokens.push(tokens[j]);
                }

                if(endFound) {
                    let result = this.evaluateMathExpression(exprTokens);
                    let resultType = (typeof result)[0].toUpperCase() + (typeof result).slice(1);
                    let resultToken = new Token(resultType, result, token.position);
                    tokens.splice(index, exprTokens.length + 2, resultToken);
                } else {
                    tokens.push(new InterpreterError('SyntaxError', `Expected closing [}] for calculation statement not found`, tokens, this.interval, token.position));
                }
            }
        });

        tokens.forEach((token, index) => {
            if(token.type == "Identifier") {
                let variable = this.getVariable(token.value);

                if(variable == false){
                    tokens.push(new InterpreterError('ReferenceError', `Variable [${token.value}] is not defined`, tokens, this.interval, token.position));
                }

                token.type = variable.type;
                token.value = variable.value;
            }
        })

        tokens.forEach((token, index) => {
            if(token.type == "String") {
                token.value = Interpreter.trimQuotes(token.value);
            } else if(token.type == "String") {
                token.value = math.evaluate(token.value);
            }
        })

        tokens.forEach((token, index) => {
            if(token.type == "Array" && typeof token.value == "string") {
                if(!Array.isArray(token.value)) {
                    let array = token.value.slice(1, -1);
                    let values = [];
                    let groups = this.groupByCommas(this.tokenize(array));

                    groups.forEach((group, i) => {
                        let formatted = this.formatMethods(group);

                        let parsed = this.parseMethods(formatted);
                        if(parsed instanceof InterpreterError) {
                            this.outputError(parsed);
                            return;
                        } else {
                            values.push(parsed);
                        }
                    });


                    token.value = values;
                }
            }
        })

        return tokens;
    }

    groupByCommas(tokenArray) {
        const groups = [];
        let currentGroup = [];
        let depth = 0;

        for (const token of tokenArray) {
            if (token.type === 'LeftParenthesis') {
                depth++;
            } else if (token.type === 'RightParenthesis') {
                depth--;
            }

            // If we hit a comma at top level, start a new group
            if (token.type === 'Comma' && depth === 0) {
                groups.push(currentGroup);
                currentGroup = [];
            } else {
                currentGroup.push(token);
            }
        }

        // Push the final group if it's non-empty
        if (currentGroup.length > 0) {
            groups.push(currentGroup);
        }

        return groups;
    }

    formatMethods(tokenArray) {
        if (!tokenArray || tokenArray.length === 0) return null;

        const root = structuredClone(tokenArray[0]);
        const methods = [];

        let i = 1;
        while (i < tokenArray.length) {
            if (tokenArray[i].type === 'Keyword') {
                i++;
                continue;
            }
            if (
                tokenArray[i].type === 'MethodInitiator' &&
                tokenArray[i + 1] &&
                tokenArray[i + 1].type === 'Method'
            ) {
                const methodToken = tokenArray[i + 1];
                const method = {
                    name: methodToken.value,
                    args: []
                };

                // Check for arguments
                if (
                    tokenArray[i + 2] &&
                    tokenArray[i + 2].type === 'LeftParenthesis'
                ) {
                    let args = [];
                    let depth = 1;
                    let j = i + 3;
                    const argTokens = [];

                    while (j < tokenArray.length && depth > 0) {
                        const t = tokenArray[j];
                        if (t.type === 'LeftParenthesis') depth++;
                        else if (t.type === 'RightParenthesis') depth--;

                        if (depth > 0) argTokens.push(t);
                        j++;
                    }

                    // Split and recursively format each top-level arg
                    const argGroups = this.groupByCommas(argTokens);
                    method.args = argGroups.map(group => this.formatMethods(group));

                    i = j; // move past closing parenthesis
                } else {
                    i += 2; // move past '>' and method
                }

                methods.push(method);
            } else {
                i++; // skip unknown tokens
            }
        }

        root.methods = methods;
        return root;
    }

    parseMethods(token) {
        if(token.methods == undefined) return token;
        while (token.methods.length > 0) {
            let method = token.methods.shift();

            // Resolve arguments
            let args = method.args.map(arg => {
                if (arg.type === 'Identifier') {
                    return this.getVariable(arg.value);
                } else if (['Number', 'String', 'Boolean', "Array"].includes(arg.type)) {
                    return arg;
                } else {
                    return null;
                }
            });

            // Retrieve method definition
            let methodInstance = Method.get(token.type, method.name);

            if (!methodInstance) {
                return new InterpreterError(
                    'ReferenceError',
                    `Method [${method.name}] is not a valid method for type ${token.type}`,
                    token, this.interval, token.position
                );
            }

            // Validate argument types
            if (methodInstance.validateArgs(args)) {
                const expected = methodInstance.args
                    .map(a => a.type + (a.optional ? '?' : ''))
                    .join(', ');
                const received = args.map(a => a?.type ?? 'null').join(', ');

                if(expected != received) {
                    return new InterpreterError(
                        'TypeError',
                        `Expected argument type of [${expected}] for method [${method.name}], found type [${received}]`,
                        token, this.interval, token.position
                    );
                }
            }

            // Execute method
            const result = methodInstance.fn(token, args, this);

            if (result instanceof InterpreterError) {
                this.outputError(result);
                return;
            }

            // Apply method result to token value
            token.value = result;
        }

        if(token.value instanceof Token) token = token.value;
        else token = new Token(token.type, token.value, token.position);

        return token;
    }

    step() {
        this.pause();
        this.gotoNext();
    }

    gotoNext() {
        Token.generateSpecs();
        this.error = false;

        let line = this.lines[this.interval];

        if (line === undefined) {
            this.kill();
            return;
        }

        let token = this.tokenize(line);

        if (token instanceof InterpreterError) {
            this.outputError(token);
        } else if (token.some(t => t instanceof InterpreterError)) {
            this.outputError(token.find(t => t instanceof InterpreterError));
        } else if (["Keyword", "Assigner"].includes(token[0].type)) {
            const scheme = Keyword.schemes[token[0].value];
            scheme.prefn(token, this);
            const keywordResult = scheme.fn(token, this);

            if (keywordResult instanceof InterpreterError) {
                this.outputError(keywordResult);
                this.kill()
            }
        }

        this.interval++;
        this.iteration++;
    }

    run() {
        if(this.running) return;
        this.running = true;
        Interpreter.blockErrorOutput = false;
        Token.generateSpecs();
        this.error = false;
        this.clock = setInterval(() => {
            if(this.paused) return;

            this.gotoNext();
        }, this.interval_length);
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
        this.run();
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
        this.running = false;
        this.lines = [];
    }

    kill() {
        clearInterval(this.clock);
        this.resetMemory();
        Interpreter.interpreters = Interpreter.interpreters.filter(interp => interp !== this);
    }
}

const KEYWORD_STR = new Keyword('str', "assigner", ['Assigner', 'Assignee', 'Assignment', 'String'], {
    pre: (tokens, interp, keyword) => {
        // instead of tokens.filter(token => token.type !== 'Keyword'), do:
        // tokens remove first keyword.scheme.length - 1 indexes
        let parsedMethods = interp.parseMethods(interp.formatMethods(interp.groupByCommas(tokens.filter(token => token.type !== 'Keyword'))[0]));
        if(parsedMethods instanceof InterpreterError) return interp.outputError(parsedMethods);
        // instead of [tokens[0], parsedMethods], do [first keyword.scheme.length - 1 indexes, parsedMethods]
        else return [tokens[0], parsedMethods];
    },
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

        interp.setVariable(identifier.value, value.value, 'Number', true);
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
    pre: (tokens, interp, keyword) => {
        // instead of tokens.filter(token => token.type !== 'Keyword'), do:
        // tokens remove first (keyword.scheme.length - 1) indexes
        let parsedMethods = interp.parseMethods(interp.formatMethods(interp.groupByCommas(tokens.filter(token => token.type !== 'Keyword'))[0]));
        if(parsedMethods instanceof InterpreterError) return interp.outputError(parsedMethods);
        // instead of [tokens[0], parsedMethods], do [tokens index 0 to keyword.scheme.length - 1, parsedMethods]
        else return [tokens[0], parsedMethods];
    },
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
        let token = tokens[3];

        interp.setVariable(identifier.value, token.value, 'Array', true);
    }
});

// BUG: formatting methods doesnt work with keywords
new Method("join", ["Array"], (token, args) => {
    return new Token("String", token.value.map(t => t.value).join(args[0].value), token.position);
}, ["String?"]);

new Method("type", ["String", "Number", "Boolean", "Array"], (token, args) => {
    return new Token("String", token.type, token.position);
}, []);