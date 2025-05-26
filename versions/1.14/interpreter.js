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
     * @param {function(Token[], Interpreter, Keyword): void} [post] - A function called after validation to execute keyword logic.
     * @param {function(Token[], Interpreter, Keyword): void} [pre] - A function called before validation, allows modification of the keyword. To modify the tokens, return an array of tokens. The `pre` function is where functions are parsed.
     * @example
     * let KEYWORD_STR = new Keyword('str', "assigner", ['Assigner', 'Assignee', 'Assignment', 'String'], {
     *     post: (tokens, interp, keyword) => {
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
     *     post: (tokens, interp, keyword) => {
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
        this.args = null;

        const { post, pre, dud } = options;

        /**
         * The function executed after token validation.
         * @type {function(Token[], Interpreter): void}
         */
        this.fn = (args, interp) => {
            if(dud) return;
            if(this.args) args = this.args;
            for(let i = 0; i < this.scheme.length; i++) {
                if(!args[i]) {
                    let position = 0;
                    for(let j = 0; j < args.length - 1; j++) {
                        position += args[j].value.length;
                    }
                    return interp.outputError(new InterpreterError('TypeError', `Missing expected ${this.scheme[i]} for keyword [${args[0].value}]`, args, interp.interval, position));
                }

                if (!new RegExp(args[i].type).test(this.scheme[i])) {
                    if(scheme[i] == "Assignment"){
                        return interp.outputError(new InterpreterError('SyntaxError', `Expected variable assignment, found ${args[i].type}`, args, interp.interval, args[i].position));
                    } else {
                        return interp.outputError(new InterpreterError('TypeError', `Expected type ${this.scheme[i]}, found type ${args[i].type}`, args, interp.interval, args[i].position));
                    }
                }
            }

            if (typeof post === 'function') {
                post(args, interp, this);
                this.args = null;
            }
        };

        /**
         * The function executed before token validation.
         * @type {function(Token[], Interpreter, Keyword): void}
         */
        this.prefn = (args, interp) => {
            if(dud) return;
            if(this.type == "assigner") {
                let startingTokens = structuredClone(args.slice(0, 3));
                args = args.slice(3);
                let parsedMethods = interp.parseMethods(interp.formatMethods(interp.groupByCommas(args)[0]));
                
                if(parsedMethods instanceof InterpreterError) return interp.outputError(parsedMethods);
                else {
                    startingTokens.forEach((token, i) => {
                        startingTokens[i] = new Token(token.type, token.value, token.position);
                    });
                    this.args = [...startingTokens, parsedMethods];
                }
            } else if(this.type == "basic") {
                let tokens = [];

                if(args[0].type == "Keyword") {
                    if(args[0].value == "func") {
                        this.args = args;
                    } else {
                        tokens = structuredClone(args.slice(0, 1));
                        args = args.slice(1);

                        let grouped = interp.groupByCommas(args);
                        grouped.forEach((group, i) => {
                            let formatted = interp.formatMethods(group);
                            let parsed = interp.parseMethods(formatted);
                            if(parsed instanceof InterpreterError) return interp.outputError(parsed);
                            else tokens.push(parsed);
                        })

                        tokens.forEach((token, i) => {
                            if(!(token instanceof Token)) {
                                tokens[i] = new Token(token.type, token.value, token.position);
                            }
                        })


                        this.args = tokens;
                    }
                }
            }
            
            if(typeof pre === 'function') {
                pre(this.args, interp, this)
            }  
        }     
    }

    add = () => Keyword.schemes[this.keyword] = this;
    rescind = () => {
        if (Keyword.schemes[this.keyword]) {
            delete Keyword.schemes[this.keyword];
        } else {
            throw new Error(`Keyword [${this.keyword}] does not exist`);
        }
    }
}

/**
 * Represents a token in the interpreter.
 * Each token has a type, value, position, and optional methods.
 * The token type can be a keyword, number, string, array, etc.
 */
class Token {
    static specs = [];

    static generate() {
        let basicKeywords = []
        let assignerKeywords = []
        for (const [keyword, scheme] of Object.entries(Keyword.schemes)) {
            if (scheme.type === 'basic') {
                basicKeywords.push(keyword);
            } else if (scheme.type === 'assigner') {
                assignerKeywords.push(keyword);
            }
        }
        
        Token.specs = [
            ['Comment', /##(.+)$/],
            ['Keyword', new RegExp(`\\b(${basicKeywords.join('|')})\\b`)],
            ['Assigner', new RegExp(`\\b(${assignerKeywords.join('|')})\\b`)],
            ['Number', /-?\b\d+(\.\d+)?\b/],
            ['String', /'(?:\\'|[^'])*'|"(?:\\"|[^"])*"/],
            ['Array', /\$([^\$]+)\$/],
            ['Boolean', /\b(true|false)\b/],
            ['Oneliner', /^\./],
            ['Identifier', /\b[a-zA-Z][a-zA-Z0-9_]*\b/],
            ['IdentifierReference', /%[a-zA-Z][a-zA-Z0-9_]*\b/],
            ["FunctionCall", /@[a-zA-Z][a-zA-Z0-9_]*(\(.*\))?/],
            ['FunctionReturn', /![a-zA-Z][a-zA-Z0-9_]*/],
            ['Calculation_Equals', / == /],
            ['Calculation_Nequals', / != /],
            ['Calculation_LessThan', / < /],
            ['Calculation_GreaterThan', / > /],
            ['Calculation_LessThanEquals', / <= /],
            ['Calculation_GreaterThanEquals', / >= /],
            ['MethodInitiator', />/],
            ['Reflexive', /</],
            ['Assignment', /=/],
            ["Comma", /,/],
            ['Operator', /[+-/\*\^]/],
            ['Whitespace', /[ \t]+/],
            ["LeftParenthesis", /\(/],
            ["RightParenthesis", /\)/],
            ["CalculateStart", /{/],
            ["CalculateEnd", /}/],
            ["Escape", /\\/],
            ["TypeDef", /:/],
        ]
    }

    static createNewTokenType(name, regex) {
        if (Token.specs.some(([type]) => type === name)) {
            throw new Error(`Token type [${name}] already exists`);
        }
        Token.specs.push([name, regex]);
    }

    /**
     * Creates a new token.
     * @param {string} type - The type of the token (e.g., 'Keyword', 'Number', 'String').
     * @param {string} value - The value of the token (e.g., 'if', '123', 'hello').
     * @param {number} position - The position of the token in the input string.
     * @param {Method[]} [methods=[]] - An array of methods associated with the token.
     */
    constructor(type, value, position, methods = []) {
        this.type = type;
        this.value = value;
        this.position = position;

        this.methods = methods;
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
        return `${this.error}\n\n${this.message}\n\u00A0in line: ${this.line+1}\n\u00A0at position: ${this.pos}`;
    }
}

class Method {
    static registry = new Map(); // Map<type, Map<methodName, Method>>

    /**
     * @param {string} name - Method name.
     * @param {string[]} type - Token type this method is for.    
     * @param {function(Token, Token[], Interpreter): Token} fn - The method logic. return a new Token.
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

        // const types = Array.isArray(type) ? type : [type];

        // // Register this method for each provided type
        // types.forEach(t => {
        //     if (!Method.registry.has(t)) {
        //         Method.registry.set(t, new Map());
        //     }
        //     Method.registry.get(t).set(name, this);
        // });
    }

    add() {
        const types = Array.isArray(this.type) ? this.type : [this.type];

        // Register this method for each provided type
        types.forEach(t => {
            if (!Method.registry.has(t)) {
                Method.registry.set(t, new Map());
            }
            Method.registry.get(t).set(this.name, this);
        });
    }

    rescind() {
        const types = Array.isArray(this.type) ? this.type : [this.type];
        // Remove this method from each type's registry
        types.forEach(t => {
            if (Method.registry.has(t)) {
                Method.registry.get(t).delete(this.name);
                if (Method.registry.get(t).size === 0) {
                    Method.registry.delete(t);
                }
            } else {
                throw new Error(`Method [${this.name}] does not exist for type [${t}]`);
            }
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
                if (!expected.optional) return {result: false, type: "SyntaxError", message: `Missing argument ${i}`};
                continue;
            }

            if (actual.type !== expected.type) return { result: false, type: "TypeError", message: `Expected type ${expected.type}, found type ${actual.type} at argument ${i} of method [${this.name}]`};
        }

        return { result: true };
    }
}


class Interpreter {
    static interpreters = {};
    static blockErrorOutput = false;
    /**
     * **IMPORTANT**: In order to load keywords and methods, it its best to do them in the load function. Example:
     * ```js
     * let interpreter = new Interpreter(input);
     * interpreter.load = () => {
     *     // define keywords, methods, etc. here
     * }
     * interpreter.run();
     * ```
     * #
     * This must be done for every `Interpreter` instance.
     * The `onComplete` function is called when the interpreter has finished running. If it has an error, the `onError` function is called instead.
     */
    constructor(name, input, programName, fileArguments) {
        this.resetMemory();
        this.lines = input.map(line => line.trim()).filter(line => line.length > 0);
        this.variables = {
            "ProgramName": {
                type: "String",
                value: programName,
                mutable: false
            },
            "Pi": {
                type: "Number",
                value: Math.PI.toString(),
                mutable: false
            },
            "Infinity": {
                type: "Number",
                value: "Infinity",
                mutable: false
            },
        };

        this.temporaryVariables = {};
        this.savedData = {};
        this.functions = {};
        this.paused = false;
        this.clock = null;
        this.interval = 0;
        this.iteration = 0;
        this.interval_length = 1;
        this.tokens = [];
        this.imports = [];
        this.importData = defaultImportData;
        this.data = {};
        this.realtimeMode = false;
        this.promptCount = 0;
        this.name = name;
        Interpreter.interpreters[name] = this;
        this.running = false
        this.fileArguments = fileArguments;
        this.fileArgumentCount = 0;
        this.load = () => {};
        this.onComplete = () => {};
        this.onError = (error) => {};

        let killFunction = function(e) {
            if (!this.running) {
                window.removeEventListener('keydown', killFunction);
                return;
            }

            if (e.key === "Delete" && this.running) {
                this.outputError(new InterpreterError(
                    'Interrupt',
                    'Program was interrupted by user',
                    null, NaN, NaN
                ));
                setSetting("currentSpinner", getSetting("defaultSpinner"));
                setSetting("showSpinner", false);
                window.removeEventListener('keydown', killFunction);
            }
        }.bind(this);

        window.addEventListener('keydown', killFunction);
    }

    static trimQuotes(value) {
        return typeof value === 'string' ? value.replace(/^['"]|['"]$/g, '') : value;
    }

    inhereit(interpreter2){
        this.variables = structuredClone(interpreter2.variables);
        this.temporaryVariables = structuredClone(interpreter2.temporaryVariables);
        this.functions = structuredClone(interpreter2.functions);
        this.savedData = structuredClone(interpreter2.savedData);
        this.imports = structuredClone(interpreter2.imports);
        this.importData = structuredClone(interpreter2.importData);
        this.interval_length = structuredClone(interpreter2.interval_length);
        this.realtimeMode = structuredClone(interpreter2.realtimeMode);
        this.load = () => interpreter2.load();
    }

    output(value) {
        if(value == undefined) return;
        let formatting = {
            type: 'blanket',
            t: function(){
                if(value.type == "String") {
                    return "froggyscript-string-color";
                } else if(value.type == "Number") {
                    return "froggyscript-number-color";
                } else if(value.type == "Boolean") {
                    return "froggyscript-boolean-color";
                }
            }()
        };

        createTerminalLine(value.value, "", {translate: false, formatting: [formatting]});
    }

    formattedOutput(value, format = []) {
        createTerminalLine(value.value, "", {translate: false, formatting: format});
    }

    /**
     * Outputs an error message to the console and kills the interpreter.
     * @param {InterpreterError} error 
     * @returns 
     */
    outputError(error) {
        if(Interpreter.blockErrorOutput) return;
        Interpreter.blockErrorOutput = true;
        createTerminalLine("", config.programErrorText.replace("{{}}", error.error), {translate: false});
        createTerminalLine(" ", "", {translate: false});
        createTerminalLine(error.message, "", {translate: false});
        createTerminalLine(`\u00A0in line: ${error.line+1}`, "", {translate: false})
        createTerminalLine(`\u00A0at position: ${error.pos}`, "", {translate: false})

        config.currentProgram = "cli";
        
        this.onError(error);
        this.kill();
    }

    setLines(lines){
        this.lines = lines.map(line => line.trim()).filter(line => line.length > 0);
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
                        return this.outputError(new InterpreterError('TypeError', `Expected type Number, found type ${variable.type} in Expression`, tokens, this.interval, token.position));
                    }
                    expr += variable.value;
                } else return this.outputError(new InterpreterError('CalculationError', `Unexpected token of type ${token.type} in Expression`, tokens, this.interval, token.position));
            }
        }

        try {
            return math.evaluate(expr);
        } catch (err) {
            return this.outputError(new InterpreterError('CalculationError', `Expression evaluation failed: ${expr}`, tokens, this.interval, tokens[0].position));
        }
    }

    getVariable(name) {
        if(this.temporaryVariables[name]) {
            return this.temporaryVariables[name];
        } else if(this.variables[name]) {
            return this.variables[name];
        } else {
            return false;
        }
    }

    setVariable(name, value, type, mutable) {
        if(this.variables[name] == undefined) {
            this.variables[name] = {
                type: type,
                value: value,
                mutable: mutable
            }
        } else if(this.variables[name] && this.variables[name].mutable) {
            this.variables[name].value = value;
            this.variables[name].type = type;
            this.variables[name].mutable = mutable;
        }
    }

    evaluate(token) {
        try {
            return math.evaluate(token.value);
        } catch (err) {
            this.outputError(new InterpreterError('EvaluationError', `Evaluation failed: ${token.value}`, token, this.interval, token.position));
        }
    }

    tokenize(line, getVariables = true) {
        let tokens = [];
        let pos = 0;

        let iterations = 0;
    
        while (pos < line.length) {
            let matched = false;

            if (iterations++ > 10000) {
                tokens.push(new InterpreterError('TokenizationError', `Malformed Tokens.\nPossible issues:\n No keywords in [Keyword] class?\n\n`, tokens, this.interval, pos));
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
                if(tokens[i+1].type === "Assigner") tokens[i+1].type = "Identifier"
                if (i + 1 < tokens.length && tokens[i + 1].type === 'Identifier') {
                    tokens[i + 1].type = 'Method';
                } else {
                    tokens.push(new InterpreterError('SyntaxError', `Expected Method after MethodInitiator not found`, tokens, this.interval, tokens[i].position));
                    return tokens;
                }
            }
        }

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type === 'Identifier') {
                if(i - 1 >= 0 && tokens[i - 1].type === 'Assigner' && tokens[i + 1].type === 'Assignment') {
                    tokens[i].type = 'Assignee';
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

                    if(isNaN(result)) {
                        tokens.push(new InterpreterError('CalculationError', `NaN is a forbidden value`, tokens, this.interval, token.position));
                        return tokens;
                    }

                    let resultType = (typeof result)[0].toUpperCase() + (typeof result).slice(1);
                    let resultToken = new Token(resultType, result.toString(), token.position);
                    tokens.splice(index, exprTokens.length + 2, resultToken);
                } else {
                    tokens.push(new InterpreterError('SyntaxError', `Expected closing [}] for calculation statement not found`, tokens, this.interval, token.position));
                    return tokens;
                }
            }
        });

        if(tokens[0]?.type == "Keyword" && tokens[0]?.value == "func") return tokens;
        
        if(getVariables) tokens.forEach((token, index) => {
            if(token.type == "Identifier") {
                let variable = this.getVariable(token.value);

                if(variable == false){
                    tokens.push(new InterpreterError('ReferenceError', `Variable [${token.value}] is not defined`, tokens, this.interval, token.position));
                    return tokens;
                }

                token.type = variable.type;
                token.value = variable.value;
            }
        })

        tokens.forEach((token, index) => {
            if(token.type == "String") {
                token.value = Interpreter.trimQuotes(token.value);
            } else if(token.type == "String") {
                token.value = this.evaluate(token.value);
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
                        values.push(parsed);
                    });

                    token.value = values;
                }
            }
        })

        tokens.forEach((token, index) => {
            if(token.type == "IdentifierReference") {
                token.value = token.value.slice(1);
            }
        })

        tokens.forEach((token, index) => {
            if(token.type == "Reflexive") {
                let nextToken = tokens[index + 1];

                if(nextToken.type != "IdentifierReference"){
                    tokens.push(new InterpreterError('SyntaxError', `Expected IdentifierReference after Reflexive, found ${nextToken.type}`, tokens, this.interval, token.position));
                    return tokens;
                }

                let variable = nextToken.value;

                let rest = tokens.slice(index + 2).map((t, i) => t.type == 'String' ? `"${t.value}"` : t.value).join("");

                let string = `set ${variable} = ${variable}${rest}`;

                this.lines[this.interval] = string;
                this.interval--;
            }
        })

        tokens.forEach((token, index) => {
            if(token.type == "String") {
                const embeddedPattern = /\$\|(.+?)\|/g;
                const matches = [...token.value.matchAll(embeddedPattern)];

                let embeddedExpressions = matches.map(m => m[1].trim());

                embeddedExpressions.forEach((expr, i) => {
                    let exprTokens = this.tokenize(expr);

                    exprTokens.forEach((exprToken, j) => {
                        if(exprToken instanceof Token && exprToken.value == undefined) delete exprTokens[j];
                    });
                    exprTokens = exprTokens.filter(t => t != undefined);
                    
                    if(exprTokens.some(t => t instanceof InterpreterError)) {
                        tokens.push(exprTokens.find(t => t instanceof InterpreterError));
                        return tokens;
                    }

                    let groups = this.groupByCommas(exprTokens);
                    let values = [];
                    groups.forEach((group, i) => {
                        let formatted = this.formatMethods(group);

                        let parsed = this.parseMethods(formatted);

                        values.push(parsed);
                    });

                    if(!["String", "Number", "Boolean"].includes(values[0].type)) {
                        tokens.push(new InterpreterError('TypeError', `Expected type String|Number|Boolean, found type ${values[0].type}`, tokens, this.interval, token.position));
                        return tokens;
                    }

                    token.value = token.value.replace(`$\|${expr}\|`,values[0].value);
                });
            }
        })

        tokens.forEach((token, index) => {
            if(token.type == "FunctionReturn"){
                let functionName = token.value.slice(1);

                let func = this.functions[functionName];
                if(func == undefined) {
                    tokens.push(new InterpreterError('ReferenceError', `Function [${functionName}] is not defined`, tokens, this.interval, token.position));
                    return tokens;
                }

                let returnValue = func.returnValue;
                if(returnValue == null) {
                    tokens.push(new InterpreterError('ReferenceError', `Function [${functionName}] has no return value`, tokens, this.interval, token.position));
                    return tokens;
                }

                tokens[index] = returnValue;

                func.returnValue = null;
            }
        })

        if(tokens[0].type == "Oneliner") {
            let tokensToParse = tokens.slice(1);

            let parsed = this.parseMethods(this.formatMethods(tokensToParse));

            if(parsed instanceof InterpreterError) {
                tokens.push(parsed);
                return tokens;
            }
        }

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

    groupByPipes(tokenArray) {
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
            if (token.type === 'Pipe' && depth === 0) {
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
        if(token == null) return null;
        if(token.methods == undefined) return token;
        while (token?.methods.length > 0) {
            let method = token.methods.shift();

            // Resolve arguments
            let args = method.args.map(arg => {
                if (arg.type === 'Identifier') {
                    return this.getVariable(arg.value);
                } else return arg;
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

            let validation = methodInstance.validateArgs(args);

            if(!validation.result) {
                return new InterpreterError(validation.type, validation.message, token, this.interval, token.position);
            }

            // Execute method
            const result = methodInstance.fn(token, args, this);

            if(result instanceof InterpreterError) {
                this.outputError(result);
                this.kill();
                return;
            }

            token = result;
        }


        if(token == undefined) return new InterpreterError('MethodParseError', `Token is undefined after parsing methods. Possible issues:\n No Method function\n Method function returns undefined\n\n`, token, this.interval, NaN);
        if(token instanceof InterpreterError) return token;
        else if(token.value instanceof Token) token = token.value;
        else token = new Token(token.type, token.value, token.position);

        return token;
    }

    step() {
        this.gotoNext();
    }

    appendToLine(index, text) {
        this.lines[index] += text;
    }

    gotoIndex(index) {
        if(this.paused) return;
        this.error = false;

        if (index < 0 || index >= this.lines.length) {
            this.onComplete();
            this.kill();
            return;
        }
        
        this.interval = index;
    }

    gotoNext() {
        if(this.paused) return;
        Token.generate();
        this.error = false;

        let line = this.lines[this.interval];

        if (line === undefined) {
            this.onComplete();
            this.kill();
            return;
        }

        let token = this.tokenize(line);

        this.tokens.push(token)

        if (token instanceof InterpreterError) {
            this.outputError(token);
        } else if (token.some(t => t instanceof InterpreterError)) {
            this.outputError(token.find(t => t instanceof InterpreterError));
        } else if (["Keyword", "Assigner"].includes(token[0].type)) {
            const scheme = Keyword.schemes[token[0].value];

            let errorInPre = scheme.prefn(token, this);

            if(errorInPre == undefined) if (errorInPre instanceof InterpreterError) {
                this.outputError(errorInPre);
                this.kill();
            }

            const keywordResult = scheme.fn(token, this);

            if (keywordResult instanceof InterpreterError) {
                this.outputError(keywordResult);
                this.kill()
            }
        }

        this.interval++;
        this.iteration++;
    }

    runLine(line) {
        if(this.paused) return;
        this.error = false;

        let token = this.tokenize(line);

        this.tokens.push(token)

        if (token instanceof InterpreterError) {
            this.outputError(token);
        } else if (token.some(t => t instanceof InterpreterError)) {
            this.outputError(token.find(t => t instanceof InterpreterError));
        } else
        if (["Keyword", "Assigner"].includes(token[0].type)) {
            const scheme = Keyword.schemes[token[0].value];

            let errorInPre = scheme.prefn(token, this);

            if(errorInPre == undefined) if (errorInPre instanceof InterpreterError) {
                this.outputError(errorInPre);
                this.kill();
            }

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
        Token.generate();
        this.load();
        this.error = false;
        this.clock = setInterval(() => {
            if(this.realtimeMode == false) this.gotoNext();
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
        this.savedData = {};
        this.paused = false;
        this.clock = null;
        this.interval = 0;
        this.iteration = 0;
        this.interval_length = 1;
        this.running = false;
        this.lines = [];
        this.tokens = [];
        this.imports = [];
        this.promptCount = 0;
        this.importData = {
            graphics: defaultImportData.graphics,
        };
        this.fileArgumentCount = 0;
        this.realtimeMode = false;
        Keyword.schemes = {};
        Method.registry = new Map();
        Token.specs = [];
        this.data = {};
    }

    setPixelColor(pixel, color) {
        if(!this.imports.includes("graphics")) return;
        pixel.style.backgroundColor = `var(--${color})`;
    }

    setPixelTextColor(pixel, color) {
        if(!this.imports.includes("graphics")) return;
        pixel.style.color = `var(--${color})`;
    }

    renderGraphics(scope){
        if(!this.imports.includes("graphics")) return;
        let renderedBackPixels = document.querySelectorAll(`[data-render-back]`);
        let renderedFrontPixels = document.querySelectorAll(`[data-render-front]`);

        let backRenderStack = this.importData.graphics.backRenderStack;
        let frontRenderStack = this.importData.graphics.frontRenderStack;

        let graphicsData = this.importData.graphics;

        if(scope.includes("front")) {
            renderedFrontPixels.forEach(pixel => {
                pixel.style.color = `var(--${graphicsData.defaultTextClearColor})`;
                pixel.textContent = '\u00A0';
                pixel.removeAttribute("data-render-front");
            })

            frontRenderStack.forEach(obj => {
                let name = obj.name;
                let variable = this.getVariable(name);

                if(variable.type == "Text"){
                    let x = +variable.value.x - 1;
                    let y = +variable.value.y;
                    let text = variable.value.text;
                    let width = +variable.value.width;
                    let wrap = variable.value.wrap;

                    let xLevel = x;
                    let yLevel = y;

                    for(let i = 0; i < text.length; i++){
                        if(wrap){
                            if(xLevel >= Math.min(x + width, graphicsData.width)){
                                yLevel++;
                                xLevel = x;
                            }
                        }
                        xLevel += 1;

                        let pixel = document.getElementById(`screen-${config.programSession}-${yLevel}-${xLevel}`);

                        if(pixel == null) continue;
                        pixel.textContent = text[i];
                        this.setPixelTextColor(pixel, variable.value.color);
                        pixel.setAttribute("data-render-front", name);
                    }
                }
            })
        } else if(scope.includes("back")){
            renderedBackPixels.forEach(pixel => {
                pixel.style.backgroundColor = `var(--${graphicsData.defaultBackgroundColor})`;
                pixel.removeAttribute("data-render-back");
            })
            backRenderStack.forEach(obj => {
                let name = obj.name;
                let variable = this.getVariable(name);

                if(variable.type == "Rectangle"){
                    let rectX = +variable.value.x;
                    let rectY = +variable.value.y;
                    let rectWidth = +variable.value.width;
                    let rectHeight = +variable.value.height;
                    let rectFill = variable.value.fill;
                    let rectStroke = variable.value.stroke;

                    for(let i = rectY; i <= rectY + rectHeight; i++){
                        for(let j = rectX; j <= rectX + rectWidth; j++){
                            let pixel = document.getElementById(`screen-${config.programSession}-${i}-${j}`);
                            if(pixel == null) continue;
                            let color = rectFill;
                            if(i == rectY || i == rectY + rectHeight || j == rectX || j == rectX + rectWidth) color = rectStroke;
                            this.setPixelColor(pixel, color);
                            pixel.setAttribute("data-render-back", name);
                        }
                    }
                } else if(variable.type == "Line"){
                    let x1 = +variable.value.x1;
                    let y1 = +variable.value.y1;
                    let x2 = +variable.value.x2;
                    let y2 = +variable.value.y2;

                    let stroke = variable.value.stroke;
                    let text = variable.value.text;
                    let textColor = variable.value.textColor;

                    const dx = Math.abs(x2 - x1);
                    const dy = Math.abs(y2 - y1);
                    const sx = x1 < x2 ? 1 : -1;
                    const sy = y1 < y2 ? 1 : -1;
                    let err = dx - dy;

                    while (true){
                        let pixel = document.getElementById(`screen-${config.programSession}-${y1}-${x1}`);
                        if(pixel != null){
                            this.setPixelColor(pixel, stroke);
                            pixel.setAttribute("data-render-back", name);
                        }

                        if(x1 == x2 && y1 == y2) break;
                        const e2 = 2 * err;
                        if( e2 > -dy) { err -= dy; x1 += sx; }
                        if( e2 < dx) { err += dx; y1 += sy; }
                    }

                }

            })
        }
    }

    kill() {
        this.running = false;
        config.currentProgram = "cli";
        clearInterval(this.clock);
    }
}

const load_function = () => {
    const KEYWORD_IMPORT = new Keyword('import', "basic", ['Keyword', "String"], {
        post: (tokens, interp, keyword) => {
            let importName = tokens[1].value;

            if(Imports[importName] == undefined) {
                return interp.outputError(new InterpreterError('ImportError', `Import [${importName}] is not defined`, tokens, interp.interval, tokens[1].position));
            }

            if(interp.imports.includes(importName)) {
                return interp.outputError(new InterpreterError('ImportError', `Import [${importName}] is already imported`, tokens, interp.interval, tokens[1].position));
            }

            interp.imports.push(importName);

            let importData = Imports[importName];

            importData.keywords.forEach((k, i) => {
                if(!(k instanceof Keyword)) {
                    return interp.outputError(new InterpreterError('StateError', `Imports.${importName}.keywords[${i}] is not of class Keyword`, tokens, interp.interval, tokens[1].position));
                } else k.add()
            });

            importData.methods.forEach((m, i) => {
                if(!(m instanceof Method)) {
                    return interp.outputError(new InterpreterError('StateError', `Imports.${importName}.methods[${i}] is not of class Method`, tokens, interp.interval, tokens[1].position));
                } else m.add()
            });
        }
    }).add()

    const KEYWORD_CLEARTERMINAL = new Keyword('clearterminal', "basic", ['Keyword'], {
        post: (tokens, interp, keyword) => {
            terminal.innerHTML = "";
        }
    }).add()

    const KEYWORD_QUICKLOOP = new Keyword('quickloop', "basic", ['Keyword', "Number|Boolean"], {
        post: (tokens, interp, keyword) => {
            let depth = 1;
            let endQuickloopIndex = -1;

            let startIndex = structuredClone(interp.interval);

            for (let i = interp.interval + 1; i < interp.lines.length; i++) {
                const line = interp.lines[i].trim();

                if (line.startsWith('quickloop')) {
                    depth++;
                } else if (line.startsWith('endquickloop')) {
                    depth--;
                    if (depth === 0) {
                        endQuickloopIndex = i;
                        break;
                    }
                }
            }

            if(endQuickloopIndex == -1) {
                return interp.outputError(new InterpreterError('SyntaxError', `Missing matching [endquickloop]`, tokens, interp.interval, tokens[0].position));
            }

            let lines = interp.lines.slice(interp.interval + 1, endQuickloopIndex);

            let value = tokens[1];

            setSetting("currentSpinner", "quickloop-in-progress");
            setSetting("showSpinner", true);

            if(value.type == "Number"){
                let maxLoops = parseInt(value.value);
                if(isNaN(maxLoops) || maxLoops <= 0) {
                    return interp.outputError(new InterpreterError('TypeError', `Expected type Number, found type ${value.type} in quickloop`, tokens, interp.interval, value.position));
                }

                for(let i = 0; i < maxLoops; i++) {
                    for(let j = 0; j < lines.length; j++) {
                        interp.runLine(lines[j]);
                    }
                }
                
                interp.gotoIndex(endQuickloopIndex - 1);
                setSetting("currentSpinner", getSetting("defaultSpinner"));
                setSetting("showSpinner", false);
            } else if (value.type == "Boolean") {
                if(value.value == "true") {
                    for(let i = 0; i < lines.length; i++) {
                        interp.runLine(lines[i]);
                    }
                    interp.gotoIndex(startIndex - 1);
                } else {
                    interp.gotoIndex(endQuickloopIndex - 1);
                    setSetting("currentSpinner", getSetting("defaultSpinner"));
                    setSetting("showSpinner", false);
                }
            }
        }
    }).add()

    const KEYWORD_ENDQUICKLOOP = new Keyword('endquickloop', "basic", ['Keyword'], {
        post: (tokens, interp, keyword) => {
            let depth = 1;
            let startQuickloopIndex = -1;

            for (let i = interp.interval - 1; i >= 0; i--) {
                const line = interp.lines[i].trim();

                if (line.startsWith('endquickloop')) {
                    depth++;
                } else if (line.startsWith('quickloop')) {
                    depth--;
                    if (depth === 0) {
                        startQuickloopIndex = i;
                        break;
                    }
                }
            }

            if(startQuickloopIndex == -1) {
                return interp.outputError(new InterpreterError('SyntaxError', `Missing matching [quickloop]`, tokens, interp.interval, tokens[0].position));
            }

        }
    }).add()

    const KEYWORD_CALL = new Keyword('call', "basic", ['Keyword', "FunctionCall"], {
        post: (tokens, interp, keyword) => {
            interp.pause();

            let functionName = tokens[1].value.split("(")[0].slice(1);
            let args = interp.groupByCommas(interp.tokenize(tokens[1].value.split("(")[1].slice(0, -1)))

            args = args.map(group => {
                let formatted = interp.formatMethods(group);
                let parsed = interp.parseMethods(formatted);
                return parsed;
            });

            if(args.some(t => t instanceof InterpreterError)) {
                return interp.outputError(args.find(t => t instanceof InterpreterError));
            }

            let func = interp.functions[functionName];
            if(func == undefined) {
                return interp.outputError(new InterpreterError('ReferenceError', `Function [${functionName}] is not defined`, tokens, interp.interval, tokens[1].position));
            }

            let expectedArgs = func.args;
            Object.keys(expectedArgs).forEach((key, j) => {
                if(args[j] != undefined){
                    interp.temporaryVariables[key] = {
                        type: args[j].type,
                        value: args[j].value,
                        mutable: true
                    }
                }
            })

            let subInterpreter = new Interpreter(func.body, func.name, interp.fileArguments);
            subInterpreter.onComplete = () => {
                let functionTokens = subInterpreter.tokens;
                for(let j = 0; j < functionTokens.length; j++) {
                    let functionToken = functionTokens[j];
                    if(functionToken[0].type == "Keyword" && functionToken[0].value == "return"){
                        let valueToReturn = functionToken.slice(1);
                        valueToReturn = interp.parseMethods(interp.formatMethods(interp.groupByCommas(valueToReturn)[0]));
                        if(valueToReturn instanceof InterpreterError) {
                            return interp.outputError(valueToReturn);
                        }
                        interp.functions[functionName].returnValue = valueToReturn;
                    }
                }
                interp.resume();
            }
            subInterpreter.inhereit(interp)
            subInterpreter.run();
        }
    }).add()

    const KEYWORD_OUTF = new Keyword('outf', "basic", ['Keyword', "String", "String"], {
        post: (tokens, interp, keyword) => {
            let format = tokens[1].value;
            let text = tokens[2];
            let formatArray = [];

            let formatting = format.split("|")

            let tokenErrors = [];

            for (let i = 0; i < formatting.length; i++) {
                const formattingObject = {};
                const parts = formatting[i].split(",").map(p => p.trim());

                for (const part of parts) {
                    if (!part) continue;

                    const [key, value] = part.split("=").map(s => s.trim());

                    if (["t", "b", "i"].includes(key)) {
                        formattingObject.type = "blanket";
                        formattingObject[key] = value;

                        if (key === "i" && value !== "1" && value !== "0") {
                            tokenErrors.push(new InterpreterError("TypeError", `[${key}] must be 1 or 0, found ${value}`, tokens, interp.interval, tokens[0].position));
                            break;
                        }
                    } else if (["tr", "br", "ir"].includes(key)) {
                        const [startRaw, endRaw] = value.split("-").map(s => s.trim());
                        let startTokens = interp.tokenize(startRaw);
                        let endTokens = interp.tokenize(endRaw);

                        let startTokensGroup = interp.groupByCommas(startTokens);
                        let endTokensGroup = interp.groupByCommas(endTokens);

                        startTokens = startTokensGroup.map(group => {
                            let formatted = interp.formatMethods(group);
                            let parsed = interp.parseMethods(formatted);
                            return parsed;
                        });

                        endTokens = endTokensGroup.map(group => {
                            let formatted = interp.formatMethods(group);
                            let parsed = interp.parseMethods(formatted);
                            return parsed;
                        });

                        if(startTokens.some(t => t instanceof InterpreterError)) {
                            tokenErrors.push(startTokens.find(t => t instanceof InterpreterError));
                            break;
                        }

                        if(endTokens.some(t => t instanceof InterpreterError)) {
                            tokenErrors.push(endTokens.find(t => t instanceof InterpreterError));
                            break;
                        }

                        if (startTokens.length !== 1 || endTokens.length !== 1) {
                            tokenErrors.push(new InterpreterError("SyntaxError", `[${key}] range must be a single value, found ${startRaw} and ${endRaw}`, tokens, interp.interval, tokens[0].position));
                            break;
                        }

                        let start = startTokens[0];
                        let end = endTokens[0];

                        if(typeof start.value === "object") start = start.value;
                        if(typeof end.value === "object") end = end.value;

                        start = new Token(start.type, start.value, start.position);
                        end = new Token(end.type, end.value, end.position);

                        if (start.type !== "Number") {
                            tokenErrors.push(new InterpreterError("TypeError", `[${key}] range start must be a Number, found ${start.type}`, tokens, interp.interval, tokens[0].position));
                            break;
                        } else if (end.type !== "Number") {
                            tokenErrors.push(new InterpreterError("TypeError", `[${key}] range end must be a Number, found ${end.type}`, tokens, interp.interval, tokens[0].position));
                            break;
                        } else {

                            if(start.value == undefined){
                                tokenErrors.push(new InterpreterError("TypeError", `[${key}] range start must be a Number`, tokens, interp.interval, tokens[0].position));
                            } else if(end.value == undefined){
                                tokenErrors.push(new InterpreterError("TypeError", `[${key}] range end must be a Number`, tokens, interp.interval, tokens[0].position));
                            } else if(start.value > end.value){
                                tokenErrors.push(new InterpreterError("TypeError", `[${key}] range start must be less than end`, tokens, interp.interval, tokens[0].position));
                            } else {
                                formattingObject.type = "range";
                                formattingObject[`${key}_start`] = start.value.toString();
                                formattingObject[`${key}_end`] = end.value.toString();
                            }
                        }
                    }
                }

                formatArray.push(formattingObject);
            }

            if(tokenErrors.length > 0) interp.outputError(tokenErrors[0]);
            else interp.formattedOutput(text, formatArray);
        }
    }).add()

    const KEYWORD_COMMENT = new Keyword('##', "basic", ['Keyword'], { dud: true }).add()

    const KEYWORD_PROMPT = new Keyword('prompt', "basic", ['Keyword', "IdentifierReference", "Number", "Array"], {
        post: (tokens, interp, keyword) => {
            let variable = tokens[1].value;
            let startingIndex = tokens[2].value;
            let values = tokens[3].value;


            interp.pause();
            setSetting("currentSpinner", "prompt-in-progress");
            setSetting("showSpinner", true)

            let selectedIndex = startingIndex;
            let arrayOptions = values.map(v => v.value);

            if(selectedIndex < 0 || selectedIndex >= arrayOptions.length){
                return interp.outputError(new InterpreterError('RangeError', `Index [${selectedIndex}] is out of bounds for array of length [${arrayOptions.length}]`, tokens, interp.interval, tokens[2].position));
            }
            interp.promptCount++;

            let prefixElement = document.createElement('span');
            prefixElement.textContent = `>`;

            let lineContainer = document.createElement('div');
            lineContainer.classList.add('line-container');

            lineContainer.appendChild(prefixElement);

            for(let i = 0; i < arrayOptions.length; i++){
                let option = document.createElement('span');
                option.setAttribute("data-program", `cli-session-${config.programSession}-${interp.promptCount}`);

                if(i == selectedIndex) {
                    option.classList.add('selected');
                }
                option.textContent = arrayOptions[i];

                option.style.paddingLeft = 0;
                lineContainer.appendChild(option);
                if(i != arrayOptions.length-1) lineContainer.appendChild(document.createTextNode(" • "));
            }

            function promptHandler(e){
                e.preventDefault();
                let options = document.querySelectorAll(`[data-program='cli-session-${config.programSession}-${interp.promptCount}']`);

                if(e.key == "ArrowLeft"){
                    if(selectedIndex > 0) selectedIndex--;
                    options.forEach(option => option.classList.remove('selected'));
                    options[selectedIndex].classList.add('selected');
                }

                if(e.key == "ArrowRight"){
                    if(selectedIndex < arrayOptions.length - 1) selectedIndex++;
                    options.forEach(option => option.classList.remove('selected'));
                    options[selectedIndex].classList.add('selected');
                }

                if(e.key == "Enter"){
                    lineContainer.setAttribute('contenteditable', 'false');
                    setSetting("currentSpinner", getSetting("defaultSpinner"));
                    setSetting("showSpinner", false)
                    setTimeout(() => interp.resume(), 10)
                    interp.interval--;
                    interp.lines[interp.interval] = `set ${variable} = "${arrayOptions[selectedIndex]}">coerce('${interp.variables[variable].type}')`;
                    document.body.removeEventListener("keyup", promptHandler);
                }
            }

            terminal.appendChild(lineContainer);
            document.body.addEventListener("keyup", promptHandler)
        }
    }).add();

    const KEYWORD_ASK = new Keyword('ask', "basic", ['Keyword', "IdentifierReference", "String"], {
        post: (tokens, interp, keyword) => {
            setSetting("currentSpinner", "ask-in-progress");
            setSetting("showSpinner", true)
            interp.pause();

            let variable = tokens[1].value;
            let prefix = tokens[2].value;

            if(interp.variables[variable] == undefined) {
                return interp.outputError(new InterpreterError('ReferenceError', `Variable [${variable}] is not defined`, tokens, interp.interval, tokens[0].position));
            }

            if(interp.variables[variable].mutable == false) {
                return interp.outputError(new InterpreterError('ReferenceError', `Variable [${variable}] is not mutable`, tokens, interp.interval, tokens[0].position));
            }

            let prefixElement = document.createElement('span');
            let lineElement = document.createElement('div');
            let lineContainer = document.createElement('div');

            lineElement.setAttribute('contenteditable', 'plaintext-only');
            lineElement.setAttribute('spellcheck', 'false');

            prefixElement.textContent = prefix;

            lineContainer.appendChild(prefixElement);
            lineContainer.appendChild(lineElement);

            lineContainer.classList.add('line-container');
            terminal.appendChild(lineContainer);
            lineElement.focus();

            lineElement.addEventListener('keydown', function(e){
                if(e.key == "Enter") e.preventDefault();
            });

            lineElement.addEventListener('keyup', function(e){
                if(e.key == "Enter"){
                    lineElement.setAttribute('contenteditable', 'false');
                    let inputValue = lineElement.textContent.trim();

                    setSetting("currentSpinner", getSetting("defaultSpinner"));
                    setSetting("showSpinner", false)
                    setTimeout(() => interp.resume(), 10)

                    interp.interval--;
                    interp.lines[interp.interval] = `set ${variable} = "${inputValue}">coerce('${interp.variables[variable].type}')`;
                }
            });
        }
    }).add()

    const KEYWORD_FILEARG = new Keyword('filearg', "basic", ['Keyword', 'IdentifierReference'], {
        post: (tokens, interp, keyword) => {

            let variableName = tokens[1].value
            let typeToCoerce = interp.getVariable(tokens[1].value).type;
            let value = interp.fileArguments[interp.fileArgumentCount];

            if(value == undefined) {
                return interp.outputError(new InterpreterError('StateError', `File argument [${interp.fileArgumentCount}] does not exist`, tokens, interp.interval, tokens[0].position));
            }

            interp.lines[interp.interval] = `set ${variableName} = "${value}">coerce('${typeToCoerce}')`;
            interp.interval--

            interp.fileArgumentCount++;
        }
    }).add()

    const KEYWORD_ENDPROG = new Keyword('endprog', "basic", ['Keyword'], { 
        post: (tokens, interp) => {
            interp.kill();
            interp.onComplete();
        }
    }).add()

    const KEYWORD_FREE = new Keyword('free', "basic", ['Keyword', "IdentifierReference"], { 
        pre: (tokens, interp, keyword) => {
            let variableName = tokens[1].value;

            if (interp.variables[variableName] == undefined) {
                return interp.outputError(new InterpreterError('ReferenceError', `Variable [${variableName}] is not defined`, tokens, interp.interval, tokens[0].position));
            } else if(interp.variables[variableName].mutable == false) {
                return interp.outputError(new InterpreterError('ReferenceError', `Variable [${variableName}] is not mutable`, tokens, interp.interval, tokens[0].position));
            } else {
                delete interp.variables[variableName];
            }
        }
    }).add()

    const KEYWORD_STR = new Keyword('str', "assigner", ['Assigner', 'Assignee', 'Assignment', 'String'], {
        post: (tokens, interp, keyword) => {
            let identifier = tokens[1];
            let value = tokens[3];

            interp.setVariable(identifier.value, value.value, 'String', true);
        }
    }).add()

    const KEYWORD_CSTR = new Keyword('cstr', "assigner", ['Assigner', 'Assignee', 'Assignment', 'String'], {
        post: (tokens, interp, keyword) => {
            let identifier = tokens[1];
            let value = tokens[3];

            interp.setVariable(identifier.value, value.value, 'String', false);
        }
    }).add()

    const KEYWORD_NUM = new Keyword('num', "assigner", ['Assigner', 'Assignee', 'Assignment', 'Number'], {
        post: (tokens, interp) => {
            let identifier = tokens[1];
            let value = tokens[3];

            interp.setVariable(identifier.value, value.value.toString(), 'Number', true);
        }
    }).add()

    const KEYWORD_CNUM = new Keyword('cnum', "assigner", ['Assigner', 'Assignee', 'Assignment', 'Number'], {
        post: (tokens, interp) => {
            let identifier = tokens[1];
            let value = tokens[3];

            interp.setVariable(identifier.value, value.value.toString(), 'Number', false);
        }
    }).add()

    const KEYWORD_BLN = new Keyword('bln', "assigner", ['Assigner', 'Assignee', 'Assignment', 'Boolean'], {
        post: (tokens, interp) => {
            let identifier = tokens[1];
            let value = tokens[3];

            interp.setVariable(identifier.value, value.value, 'Boolean', true);
        }
    }).add()

    const KEYWORD_CBLN = new Keyword('cbln', "assigner", ['Assigner', 'Assignee', 'Assignment', 'Boolean'], {
        post: (tokens, interp) => {
            let identifier = tokens[1];
            let value = tokens[3];

            interp.setVariable(identifier.value, value.value, 'Boolean', false);
        }
    }).add()

    const KEYWORD_OUT = new Keyword('out', "basic", ['Keyword', 'String|Number|Boolean'], {
        post: (tokens, interp) => {
            let value = tokens[1];
            interp.output(value);
        }
    }).add()

    const KEYWORD_SET = new Keyword('set', "assigner", ['Assigner', 'Assignee', 'Assignment', '*'], {
        pre: (tokens, interp, keyword) => {
            keyword.scheme[3] = interp.getVariable(keyword.args[1].value).type;
        },

        post: (tokens, interp) => {
            let identifier = tokens[1];
            let value = tokens[3];

            let variable = interp.getVariable(identifier.value);

            if(variable.mutable == false){
                return interp.outputError(new InterpreterError('ReferenceError', `Variable [${identifier.value}] is not mutable`, tokens, interp.interval, identifier.position));
            }

            interp.setVariable(identifier.value, value.value, variable.type, true);
        }
    }).add()

    const KEYWORD_ARR = new Keyword('arr', "assigner", ['Assigner', 'Assignee', 'Assignment', 'Array'], {
        post: (tokens, interp) => {
            let identifier = tokens[1];
            let token = tokens[3];

            interp.setVariable(identifier.value, token.value, 'Array', true);
        }
    }).add()

    const KEYWORD_CARR = new Keyword('carr', "assigner", ['Assigner', 'Assignee', 'Assignment', 'Array'], {
        post: (tokens, interp) => {
            let identifier = tokens[1];
            let token = tokens[3];

            interp.setVariable(identifier.value, token.value, 'Array', false);
        }
    }).add()

    const KEYWORD_LOOP = new Keyword('loop', "basic", ['Keyword', 'Number|Boolean'], {
        pre: (tokens, interp, keyword) => {
            let depth = 1;
            let endLoopIndex = -1;

            for (let i = interp.interval + 1; i < interp.lines.length; i++) {
                const line = interp.lines[i].trim();

                if (line.startsWith('loop')) {
                    depth++;
                } else if (line.startsWith('endloop')) {
                    depth--;
                    if (depth === 0) {
                        endLoopIndex = i;
                        break;
                    }
                }
            }

            if(endLoopIndex == -1) {
                return interp.outputError(new InterpreterError('SyntaxError', `Missing matching [endloop]`, tokens, interp.interval, tokens[0].position));
            }

            let loopCondition = keyword.args[1];

            if(loopCondition.type == "Boolean"){
                setSetting("showSpinner", true);

                if(loopCondition.value === 'false') {
                    setSetting("showSpinner", false);
                    interp.gotoIndex(endLoopIndex);
                }
            } else if(loopCondition.type == "Number"){
                let maxLoops = parseInt(loopCondition.value);
                if(maxLoops <= 0) {
                    return interp.outputError(new InterpreterError('TypeError', `Number cannot be negative or 0`, tokens, interp.interval, loopCondition.position));
                }

                if(interp.data[`${interp.interval}_loop`] == undefined) interp.data[`${interp.interval}_loop`] = {
                    loopCount: 0,
                }

                if(interp.data[`${interp.interval}_loop`].loopCount >= maxLoops) {
                    delete interp.data[`${interp.interval}_loop`];
                    setSetting("showSpinner", false);
                    interp.gotoIndex(endLoopIndex + 1);
                } else {
                    interp.data[`${interp.interval}_loop`].loopCount++;
                }

                setSetting("showSpinner", true);
            }


        },
    }).add();

    const KEYWORD_ENDLOOP = new Keyword('endloop', "basic", ['Keyword'], { 
        pre: (tokens, interp, keyword) => {
            // find the matching 'loop' keyword
            let depth = 1;
            let startLoopIndex = -1;
            for (let i = interp.interval - 1; i >= 0; i--) {
                const line = interp.lines[i].trim();
                if (line.startsWith('endloop')) {
                    depth++;
                } else if (line.startsWith('loop')) {
                    depth--;
                    if (depth === 0) {
                        startLoopIndex = i;
                        break;
                    }
                }
            }
            if(startLoopIndex == -1) {
                return interp.outputError(new InterpreterError('SyntaxError', `Missing matching [loop]`, tokens, interp.interval, tokens[0].position));
            }
            interp.interval = startLoopIndex - 1;
        }
    }).add();


    const KEYWORD_IF = new Keyword('if', "basic", ['Keyword', 'Boolean'], {
        pre: (tokens, interp, keyword) => {
            let depth = 1;
            let elseIndex = -1;
            let endIfIndex = -1;

            for (let i = interp.interval + 1; i < interp.lines.length; i++) {
                const line = interp.lines[i].trim();

                if (line.startsWith('if')) {
                    depth++;
                } else if (line.startsWith('endif')) {
                    depth--;
                    if (depth === 0) {
                        endIfIndex = i;
                        break;
                    }
                } else if (line.startsWith('else') && depth === 1 && elseIndex === -1) {
                    elseIndex = i;
                }
            }

            if(endIfIndex == -1) {
                return interp.outputError(new InterpreterError('SyntaxError', `Missing matching [endif]`, tokens, interp.interval, tokens[0].position));
            }

            interp.lines[elseIndex] += ` ${endIfIndex}`

            let ifCondition = keyword.args[1].value;

            if(typeof ifCondition == 'string') ifCondition = ifCondition === 'true';

            if(ifCondition == false) {
                if (elseIndex !== -1) {
                    interp.gotoIndex(elseIndex);
                } else {
                    interp.gotoIndex(endIfIndex);
                }
            }
        },
    }).add()

    const KEYWORD_ENDIF = new Keyword('endif', "basic", ['Keyword'], { dud: true }).add()
    const KEYWORD_ENDFUNC = new Keyword('endfunc', "basic", ['Keyword'], { dud: true }).add();

    const KEYWORD_RETURN = new Keyword('return', "basic", ['Keyword', 'Number|String|Boolean'], { dud: true }).add();

    const KEYWORD_ELSE = new Keyword('else', "basic", ['Keyword', 'Number'], {
        post: (tokens, interp, keyword) => {
            interp.interval = tokens[1].value
        }
    }).add();

    const KEYWORD_WAIT = new Keyword('wait', "basic", ['Keyword', 'Number'], {
        post: (tokens, interp) => {
            let value = tokens[1];
            interp.pause();
            setSetting('showSpinner', true)
            setTimeout(() => {
                interp.resume();
                setSetting('showSpinner', false)
            }, value.value);
        }
    }).add();

    const KEYWORD_FUNC = new Keyword('func', "basic", ['Keyword', 'Identifier'], {
        post: (tokens, interp, keyword) => {
            let depth = 1;
            let endFuncIndex = -1;
            let startFuncIndex = interp.interval;
            for (let i = interp.interval + 1; i < interp.lines.length; i++) {
                const line = interp.lines[i].trim();

                if (line.startsWith('func')) {
                    depth++;
                } else if (line.startsWith('endfunc')) {
                    depth--;
                    if (depth === 0) {
                        endFuncIndex = i;
                        break;
                    }
                }
            }
            if (endFuncIndex == -1) {
                return interp.outputError(new InterpreterError('SyntaxError', `Missing matching [endfunc]`, tokens, interp.interval, tokens[0].position));
            }

            interp.interval = endFuncIndex;

            let argArray = structuredClone(tokens)

            let functionIdentifier = structuredClone(argArray[1]);

            argArray.shift()
            argArray.shift();

            // if the first index isnt type LeftParenthesis, throw error
            if (argArray[0].type != "LeftParenthesis") {
                return interp.outputError(new InterpreterError('SyntaxError', `Expected [LeftParenthesis]`, argArray, interp.interval, argArray[0].position));
            }

            if(argArray[argArray.length - 1].type != "RightParenthesis") {
                return interp.outputError(new InterpreterError('SyntaxError', `Expected [RightParenthesis]`, argArray, interp.interval, argArray[argArray.length - 1].position));
            }

            argArray.pop();
            argArray.shift();

            const TypeMap = {
                "S": "String",
                "N": "Number",
                "B": "Boolean",
                "A": "Array"
            }
            let argGroups = interp.groupByCommas(argArray)

            let args = {};
            argGroups.forEach((group, i) => {
                if (group.length != 3) {
                    return interp.outputError(new InterpreterError('SyntaxError', `Missing [Identifier]:[Type] for arg ${i}`, group, interp.interval, group[0].position));
                }

                let argName = group[0];
                let argDef = group[1];
                let argValue = group[2];

                if(argDef.type != "TypeDef") {
                    return interp.outputError(new InterpreterError('SyntaxError', `Expected [:] for arg ${i}`, argDef, interp.interval, argDef.position));
                }

                if(argValue.type != "Identifier") {
                    return interp.outputError(new InterpreterError('SyntaxError', `Expected argument Type (S, N, B, A) for arg ${i}`, argValue, interp.interval, argValue.position));
                }

                if(TypeMap[argValue.value] == undefined) {
                    return interp.outputError(new InterpreterError('SyntaxError', `Expected argument Type (S, N, B, A) for arg ${i}`, argValue, interp.interval, argValue.position));
                }

                args[argName.value] = TypeMap[argValue.value]
            }) 

            if(interp.functions[functionIdentifier.value] != undefined) {
                return interp.outputError(new InterpreterError('SyntaxError', `Function ${functionIdentifier.value} already defined`, functionIdentifier, interp.interval, functionIdentifier.position));
            }

            interp.functions[functionIdentifier.value] = {
                args: args,
                body: structuredClone(interp.lines).slice(startFuncIndex + 1, endFuncIndex),
                start: startFuncIndex,
                end: endFuncIndex,
                returnValue: null,
            }
        }
    }).add();

    // Multi
    new Method("type", ["String", "Number", "Boolean", "Array"], (token, args) => {
        return new Token("String", token.type, token.position, token.methods);
    }, []).add();

    new Method("coerce", ["String", "Number", "Boolean"], (token, args) => {
        let currentType = token.type;
        let targetType = args[0].value;

        if(!["String", "Number", "Boolean"].includes(targetType)) {
            return new InterpreterError('TypeError', `Cannot coerce type ${currentType} to type ${targetType}`, token, token.position, token.position);
        }

        switch(currentType){
            case "String": {
                if(targetType == "Number") {
                    if(!isNaN(token.value)) {
                        return new Token("Number", token.value, token.position, token.methods);
                    } else {
                        return new InterpreterError('TypeError', `Cannot coerce String [${token.value}] to Number`, token, token.position, token.position);
                    }
                } else if(targetType == "Boolean") {
                    if(token.value == "true" || token.value == "false") {
                        return new Token("Boolean", token.value, token.position, token.methods);
                    } else {
                        return new InterpreterError('TypeError', `Cannot coerce String [${token.value}] to Boolean`, token, token.position, token.position);
                    }
                } else if(targetType == "String") return new Token("String", token.value, token.position, token.methods);
            } break;

            case "Number": {
                if(targetType == "String") {
                    return new Token("String", token.value.toString(), token.position, token.methods);
                } else if(targetType == "Boolean") {
                    if(token.value > 0) return new Token("Boolean", "true", token.position, token.methods);
                    else return new Token("Boolean", "false", token.position, token.methods);
                } else if(targetType == "Number") return new Token("Number", token.value, token.position, token.methods);
            } break;

            case "Boolean": {
                if(targetType == "String") {
                    return new Token("String", token.value.toString(), token.position, token.methods);
                } else if(targetType == "Number") {
                    if(token.value == "true") return new Token("Number", 1, token.position, token.methods);
                    else return new Token("Number", 0, token.position, token.methods);
                } else if(targetType == "Boolean") return new Token("Boolean", token.value, token.position, token.methods);
            } break;

            default: {
                return new InterpreterError('TypeError', `Cannot coerce type ${currentType} to type ${targetType}`, token, token.position, token.position);
            };
        }
    }, ["String"]).add();

    new Method("index", ["String", "Array"], (token, args) => {
        let index = +args[0].value;
        let value = token.value[index];

        if(value == undefined) {
            return new InterpreterError('RangeError', `Index [${index}] out of range for ${token.type} of length [${token.value.length}]`, token, token.position, token.position);
        }

        if(token.type == "String"){
            return new Token("String", value, token.position, token.methods);
        } else if(token.type == "Array") {
            return value;
        }
    }, ["Number"]).add();

    // pure array
    new Method("join", ["Array"], (token, args) => {
        let arg0 = args[0]?.value || ","
        return new Token("String", token.value.map(t => t.value).join(arg0), token.position, token.methods);
    }, ["String?"]).add();

    new Method("append", ["Array"], (token, args) => {
        let arg0 = args[0];
        return new Token("Array", [...token.value, ...arg0.value], token.position, token.methods);
    }, ["Array"]).add();

    new Method("length", ["Array"], (token, args) => {
        return new Token("Number", token.value.length.toString(), token.position, token.methods);
    }, []).add();

    // pure string
    new Method("eq", ["String"], (token, args) => {
        return new Token("Boolean", (token.value == args[0].value).toString(), token.position, token.methods);
    }, ["String"]).add();

    new Method("neq", ["String"], (token, args) => {
        return new Token("Boolean", (token.value != args[0].value).toString(), token.position, token.methods);
    }, ["String"]).add();

    new Method("append", ["String"], (token, args) => {
        let arg0 = args[0];
        return new Token("String", token.value + arg0.value, token.position, token.methods);
    }, ["String"]).add();

    new Method("length", ["String"], (token, args) => {
        return new Token("Number", token.value.length.toString(), token.position, token.methods);
    }, []).add();

    new Method("repeat", ["String"], (token, args) => {
        let arg0 = args[0];
        return new Token("String", token.value.repeat(arg0.value), token.position, token.methods);
    }, ["Number"]).add();

    // pure boolean
    new Method("flip", ["Boolean"], (token, args) => {
        return new Token("Boolean", !token.value.toString(), token.position, token.methods);
    }, []).add();

    // pure number
    new Method("abs", ["Number"], (token, args) => {
        return new Token("Number", Math.abs(token.value).toString(), token.position, token.methods);
    }, []).add();
    
    new Method("truncate", ["Number"], (token, args) => {
        let precision = +args[0]?.value || 0;
        if(precision < 0) return new InterpreterError('RangeError', `Cannot round to negative precision`, token, token.position, token.position);

        const factor = Math.pow(10, precision);
        let result = Math.round(token.value * factor) / factor;

        return new Token("Number", result.toString(), token.position, token.methods);
    }, ["Number?"]).add();

    new Method("round", ["Number"], (token, args) => {
        return new Token("Number", Math.round(token.value).toString(), token.position, token.methods);
    }, []).add();

    new Method("mod", ["Number"], (token, args) => {
        let arg0 = args[0];
        if(arg0.value == 0) {
            return new Token("Number", "Infinity", token.position, token.methods);
        }
        return new Token("Number", (token.value % arg0.value).toString(), token.position, token.methods);
    }).add();

    new Method("inc", ["Number"], (token, args) => {
        return new Token("Number", (+token.value + 1).toString(), token.position, token.methods);
    }, []).add();

    new Method("dec", ["Number"], (token, args) => {
        return new Token("Number", (+token.value - 1).toString(), token.position, token.methods);
    }, []).add();

    new Method("add", ["Number"], (token, args) => {
        let arg0 = args[0];
        return new Token("Number", (+token.value + +arg0.value).toString(), token.position, token.methods);
    }, ["Number"]).add();

    new Method("sub", ["Number"], (token, args) => {
        let arg0 = args[0];
        return new Token("Number", (+token.value - +arg0.value).toString(), token.position, token.methods);
    }, ["Number"]).add();

    new Method("mul", ["Number"], (token, args) => {
        let arg0 = args[0];
        return new Token("Number", (+token.value * +arg0.value).toString(), token.position, token.methods);
    }, ["Number"]).add();

    new Method("div", ["Number"], (token, args) => {
        let arg0 = args[0];
        if(arg0.value == 0) {
            return new Token("Number", "Infinity", token.position, token.methods);
        }
        return new Token("Number", (+token.value / +arg0.value).toString(), token.position, token.methods);
    }, ["Number"]).add();
}

const defaultImportData = {
    graphics: {
        defaultBackgroundColor: "c15",
        defaultTextColor: 'c02',
        defaultTextClearColor: 'transparent',
        defaultStrokeColor: "c00",
        rendered: false,
        maxWidth: 79,
        maxHeight: 58,
        width: undefined,
        height: undefined,
        backRenderStack: [],
        frontRenderStack: [],
    }
}

const Imports = {
    graphics: {
        keywords: [
            new Keyword("createscreen", "basic", ['Keyword', 'Number', "Number"], {
                post: (tokens, interp, keyword) => {
                    let givenWidth = tokens[1].value;
                    let givenHeight = tokens[2].value;

                    if(givenWidth > defaultImportData.graphics.maxWidth) {
                        return new InterpreterError('RangeError', `Width cannot be greater than ${defaultImportData.graphics.maxWidth}`, tokens, interp.interval, tokens[1].position);
                    }
                    if(givenWidth < 1) {
                        return new InterpreterError('RangeError', `Width cannot be less than 1`, tokens, interp.interval, tokens[1].position);
                    }
                    if(givenHeight > defaultImportData.graphics.maxHeight) {
                        return new InterpreterError('RangeError', `Height cannot be greater than ${defaultImportData.graphics.maxHeight}`, tokens, interp.interval, tokens[2].position);
                    }
                    if(givenHeight < 1) {
                        return new InterpreterError('RangeError', `Height cannot be less than 1`, tokens, interp.interval, tokens[2].position);
                    }
                    interp.importData.graphics.width = +givenWidth;
                    interp.importData.graphics.height = +givenHeight;

                    interp.importData.graphics.rendered = true;

                    terminal.innerHTML = "";

                    for(let i = 0; i < givenHeight; i++){
                        let rowHtml = '';
                        for(let j = 0; j < givenWidth; j++){
                            let style = `"background-color: var(--${defaultImportData.graphics.defaultBackgroundColor}); color: var(--${defaultImportData.graphics.defaultBackgroundColor})"`;
                            rowHtml += `<span id="screen-${config.programSession}-${i}-${j}" style=${style}>\u00A0</span>`;
                        }
                        let lineContainer = document.createElement('div');
                        let terminalLine = document.createElement('div');
                        lineContainer.classList.add('line-container');
                        terminalLine.innerHTML = rowHtml;
                        lineContainer.appendChild(terminalLine);
                        terminal.appendChild(lineContainer);
                    }
                }
            }),
            new Keyword('line', "assigner", ['Assigner', 'Assignee', 'Assignment', 'Array'], {
                post: (tokens, interp, keyword) => {
                    let array = tokens[3].value;

                    if(array.length != 4){
                        return new InterpreterError('SyntaxError', `Line must have 4 values`, tokens, interp.interval, tokens[3].position);
                    }

                    for(let i = 0; i < array.length; i++){
                        if(array[i].type != "Number"){
                            return new InterpreterError('TypeError', `Line values must be numbers`, tokens, interp.interval, array[i].position);
                        }
                    }

                    let x1 = array[0].value;
                    let y1 = array[1].value;
                    let x2 = array[2].value;
                    let y2 = array[3].value;

                    let variableValue = {
                        x1: x1,
                        y1: y1,
                        x2: x2,
                        y2: y2,
                        name: tokens[1].value,
                        stroke: defaultImportData.graphics.defaultStrokeColor,
                        text: "",
                        color: defaultImportData.graphics.defaultTextColor,
                    }

                    if(array[0].cloneInfo != undefined){
                        variableValue.x1 = array[0].value;
                        variableValue.y1 = array[1].value;
                        variableValue.x2 = array[2].value;
                        variableValue.y2 = array[3].value;

                        variableValue.stroke = array[0].cloneInfo.stroke;
                    }

                    interp.setVariable(tokens[1].value, variableValue, "Line", true);
                }
            }),
            new Keyword("rect", "assigner", ['Assigner', 'Assignee', 'Assignment', 'Array'], {
                post: (tokens, interp, keyword) => {
                    let array = tokens[3].value;

                    if(array.length != 4){
                        return new InterpreterError('SyntaxError', `Rectangle must have 4 values`, tokens, interp.interval, tokens[3].position);
                    }

                    for(let i = 0; i < array.length; i++){
                        if(array[i].type != "Number"){
                            return new InterpreterError('TypeError', `Rectangle values must be numbers`, tokens, interp.interval, array[i].position);
                        }
                    }

                    let x = array[0].value;
                    let y = array[1].value;
                    let width = array[2].value;
                    let height = array[3].value;

                    let variableValue = {
                        x: x,
                        y: y,
                        width: width,
                        height: height,
                        name: tokens[1].value,
                        fill: defaultImportData.graphics.defaultBackgroundColor,
                        stroke: defaultImportData.graphics.defaultStrokeColor,
                    }

                    if(array[0].cloneInfo != undefined){
                        variableValue.stroke = array[0].cloneInfo.stroke;
                        variableValue.fill = array[0].cloneInfo.fill;

                        variableValue.x = array[0].value;
                        variableValue.y = array[1].value;
                        variableValue.width = array[2].value;
                        variableValue.height = array[3].value;
                    }

                    interp.setVariable(tokens[1].value, variableValue, "Rectangle", true);
                }
            }),
            new Keyword("text", "assigner", ['Assigner', 'Assignee', 'Assignment', 'Array'], {
                post: (tokens, interp, keyword) => {
                    let array = tokens[3].value;

                    if(array.length != 3){
                        return new InterpreterError('SyntaxError', `Text must have 3 values`, tokens, interp.interval, tokens[3].position);
                    }

                    if(array[0].type != "Number"){
                        return new InterpreterError('TypeError', `Text x value must be a number`, tokens, interp.interval, array[0].position);
                    }

                    if(array[1].type != "Number"){
                        return new InterpreterError('TypeError', `Text y value must be a number`, tokens, interp.interval, array[1].position);
                    }

                    if(array[2].type != "String"){
                        return new InterpreterError('TypeError', `Text value must be a string`, tokens, interp.interval, array[2].position);
                    }

                    let x = array[0].value;
                    let y = array[1].value;
                    let text = array[2].value;

                    let variableValue = {
                        x: x,
                        y: y,
                        text: text,
                        width: Infinity,
                        name: tokens[1].value,
                        color: defaultImportData.graphics.defaultTextColor,
                        wrap: false,
                    }

                    if(array[0].cloneInfo != undefined){
                        variableValue.color = array[0].cloneInfo.color;
                        variableValue.wrap = array[0].cloneInfo.wrap;
                        variableValue.width = array[0].cloneInfo.width;
                        variableValue.x = array[0].value;
                        variableValue.y = array[1].value;
                        variableValue.text = array[2].value;
                    }

                    interp.setVariable(tokens[1].value, variableValue, "Text", true);
                }
            })
        ],
        methods: [
            // line ============================================================================================
            new Method("intersection", ["Line"], (token, args, interp) => {
                let line1 = token.value;
                let line2 = args[0].value;

                let line1_x1 = +line1.x1;
                let line1_y1 = +line1.y1;
                let line1_x2 = +line1.x2;
                let line1_y2 = +line1.y2;

                let line2_x1 = +line2.x1;
                let line2_y1 = +line2.y1;
                let line2_x2 = +line2.x2;
                let line2_y2 = +line2.y2;

                function getLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
                    // Calculate denominators
                    let denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
                    if (denom === 0) return null; // Lines are parallel or coincident

                    // Calculate intersection point
                    let px = ((x1*y2 - y1*x2)*(x3 - x4) - (x1 - x2)*(x3*y4 - y3*x4)) / denom;
                    let py = ((x1*y2 - y1*x2)*(y3 - y4) - (y1 - y2)*(x3*y4 - y3*x4)) / denom;

                    // Check if point is within both segments
                    let within1 = Math.min(x1, x2) <= px && px <= Math.max(x1, x2) &&
                                Math.min(y1, y2) <= py && py <= Math.max(y1, y2);
                    let within2 = Math.min(x3, x4) <= px && px <= Math.max(x3, x4) &&
                                Math.min(y3, y4) <= py && py <= Math.max(y3, y4);

                    if (within1 && within2) {
                        return { 
                            x: Math.round(px), 
                            y: Math.round(py)
                        };
                    }

                    return null; // The intersection is outside the segments
                }

                let intersection = getLineIntersection(line1_x1, line1_y1, line1_x2, line1_y2, line2_x1, line2_y1, line2_x2, line2_y2);

                if(intersection == null) return new Token("Boolean", "false", token.position, token.methods);
                else {
                    // turn this into a Pixel object
                    let arrayValues = [
                        new Token("Number", intersection.x.toString(), token.position, token.methods),
                        new Token("Number", intersection.y.toString(), token.position, token.methods)
                    ]

                    let returnArray = new Token("Array", arrayValues, token.position, token.methods);

                    return returnArray;
                }

            }, ["Line"]),

            new Method("cross", ["Line"], (token, args, interp) => {
                let line1 = token.value;
                let line2 = args[0].value;

                let line1_x1 = +line1.x1;
                let line1_y1 = +line1.y1;
                let line1_x2 = +line1.x2;
                let line1_y2 = +line1.y2;

                let line2_x1 = +line2.x1;
                let line2_y1 = +line2.y1;
                let line2_x2 = +line2.x2;
                let line2_y2 = +line2.y2;

                function ccw(ax, ay, bx, by, cx, cy) {
                    return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
                }

                function linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
                    return ccw(x1, y1, x3, y3, x4, y4) !== ccw(x2, y2, x3, y3, x4, y4) &&
                            ccw(x1, y1, x2, y2, x3, y3) !== ccw(x1, y1, x2, y2, x4, y4);
                }

                let intersects = linesIntersect(line1_x1, line1_y1, line1_x2, line1_y2, line2_x1, line2_y1, line2_x2, line2_y2);

                return new Token("Boolean", intersects.toString(), token.position, token.methods);
            }, ["Line"]),

            new Method("add", ["Line"], (token, args, interp) => {
                if(!interp.importData.graphics.rendered){
                    return new InterpreterError('StateError', `Screen not created. Use the [createscreen] keyword first`, token, interp.interval, token.position);
                }

                interp.importData.graphics.backRenderStack.push(token.value);
                interp.renderGraphics(["back"]);
                return token;
            }),

            new Method("remove", ["Line"], (token, args, interp) => {
                if(!interp.importData.graphics.rendered){
                    return new InterpreterError('StateError', `Screen not created. Use the [createscreen] keyword first`, token, interp.interval, token.position);
                }
                let variable = interp.variables[token.value.name];
                if(variable == undefined) {
                    return new InterpreterError('ReferenceError', `Variable [${token.value.name}] is not defined`, token, interp.interval, token.position);
                }
                interp.importData.graphics.backRenderStack = interp.importData.graphics.backRenderStack.filter(t => t.name != token.value.name);
                interp.renderGraphics(["back"]);
                return token;
            }),

            new Method("x1", ["Line"], (token, args, interp) => {
                if(args[0] == undefined) return new Token("Number", token.value.x1, token.position, token.methods);
                else {
                    interp.variables[token.value.name].value.x1 = args[0].value;
                    interp.renderGraphics(["back"]);
                    return token;
                }
            }, ["Number?"]),

            new Method("y1", ["Line"], (token, args, interp) => {
                if(args[0] == undefined) return new Token("Number", token.value.y1, token.position, token.methods);
                else {
                    interp.variables[token.value.name].value.y1 = args[0].value;
                    interp.renderGraphics(["back"]);
                    return token;
                }
            }, ["Number?"]),

            new Method("x2", ["Line"], (token, args, interp) => {
                if(args[0] == undefined) return new Token("Number", token.value.x2, token.position, token.methods);
                else {
                    interp.variables[token.value.name].value.x2 = args[0].value;
                    interp.renderGraphics(["back"]);
                    return token;
                }
            }, ["Number?"]),
        
            new Method("y2", ["Line"], (token, args, interp) => {
                if(args[0] == undefined) return new Token("Number", token.value.y2, token.position, token.methods);
                else {
                    interp.variables[token.value.name].value.y2 = args[0].value;
                    interp.renderGraphics(["back"]);
                    return token;
                }
            }, ["Number?"]),

            new Method("stroke", ["Line"], (token, args, interp) => {
                if(args[0] == undefined) return new Token("String", token.value.stroke, token.position, token.methods);
                else {
                    interp.variables[token.value.name].value.stroke = args[0].value;
                    interp.renderGraphics(["back"]);
                    return token;
                }
            }, ["String?"]),


            // text ============================================================================================
            new Method("add", ["Text"], (token, args, interp) => {
                if(!interp.importData.graphics.rendered){
                    return new InterpreterError('StateError', `Screen not created. Use the [createscreen] keyword first`, token, interp.interval, token.position);
                }

                interp.importData.graphics.frontRenderStack.push(token.value);
                interp.renderGraphics(["front"]);
                return token;
            }),

            new Method("remove", ["Text"], (token, args, interp) => {
                if(!interp.importData.graphics.rendered){
                    return new InterpreterError('StateError', `Screen not created. Use the [createscreen] keyword first`, token, interp.interval, token.position);
                }

                let variable = interp.variables[token.value.name];
                if(variable == undefined) {
                    return new InterpreterError('ReferenceError', `Variable [${token.value.name}] is not defined`, token, interp.interval, token.position);
                }

                interp.importData.graphics.frontRenderStack = interp.importData.graphics.frontRenderStack.filter(t => t.name != token.value.name);
                interp.renderGraphics(["front"]);
                return token;
            }),

            new Method("x", ["Text"], (token, args, interp) => {
                if(args[0] == undefined) return new Token("Number", token.value.x, token.position, token.methods);
                else {
                    interp.variables[token.value.name].value.x = args[0].value;
                    interp.renderGraphics(["front"]);
                    return token;
                }
            }, ["Number?"]),

            new Method("y", ["Text"], (token, args, interp) => {
                if(args[0] == undefined) return new Token("Number", token.value.y, token.position, token.methods);
                else {
                    interp.variables[token.value.name].value.y = args[0].value;
                    interp.renderGraphics(["front"]);
                    return token;
                }
            }, ["Number?"]),

            new Method("move", ["Text"], (token, args, interp) => {
                let newX = args[0].value;
                let newY = args[1].value;
                interp.variables[token.value.name].value.x = newX;
                interp.variables[token.value.name].value.y = newY;
                interp.renderGraphics(["front"]);
                return token;
            }, ["Number", "Number"]),

            new Method("text", ["Text"], (token, args, interp) => {
                if(args[0] == undefined) return new Token("String", token.value.text, token.position, token.methods);
                else {
                    interp.variables[token.value.name].value.text = args[0].value;
                    interp.renderGraphics(["front"]);
                    return token;
                }
            }, ["String?"]),

            new Method("width", ["Text"], (token, args, interp) => {
                if(args[0] == undefined) return new Token("Number", token.value.width, token.position, token.methods);
                else {
                    interp.variables[token.value.name].value.width = args[0].value;
                    interp.renderGraphics(["front"]);
                    return token;
                }
            }, ["Number?"]),

            new Method("wrap", ["Text"], (token, args, interp) => {
                if(args[0] == undefined) return new Token("Boolean", token.value.wrap, token.position, token.methods);
                else {
                    interp.variables[token.value.name].value.wrap = args[0].value;
                    interp.renderGraphics(["front"]);
                    return token;
                }
            }, ["Boolean?"]),

            new Method("color", ["Text"], (token, args, interp) => {
                if(args[0] == undefined) return new Token("String", token.value.color, token.position, token.methods);
                else {
                    interp.variables[token.value.name].value.color = args[0].value;
                    interp.renderGraphics(["front"]);
                    return token;
                }
            }, ["String?"]),

            new Method("clone", ["Text"], (token, args, interp) => {
                let finalToken = new Token("Array", [], token.position, token.methods);
                finalToken.value.push(new Token("Number", token.value.x, token.position, token.methods));
                finalToken.value.push(new Token("Number", token.value.y, token.position, token.methods));
                finalToken.value.push(new Token("String", token.value.text, token.position, token.methods));

                finalToken.value[0].cloneInfo = {
                    color: token.value.color,
                    wrap: token.value.wrap,
                    width: token.value.width,
                }
                return finalToken;
            }, []),

            // rectangle =======================================================================================
            new Method("overlaps", ["Rectangle"], (token, args, interp) => {

                let thisRect = token.value;
                let otherRect = args[0].value;

                // check if both are in the interp.importData.graphics.backRenderStack
                if(!interp.importData.graphics.rendered){
                    return new InterpreterError('ReferenceError', `Screen not created. Use the [createscreen] keyword first`, token, interp.interval, token.position);
                }

                if(interp.importData.graphics.backRenderStack.find(t => t.name == thisRect.name) == undefined){
                    return new InterpreterError('StateError', `Cannot check for overlap because Rectangle [${thisRect.name}] has not been added to the screen`, token, interp.interval, token.position);
                }
                if(interp.importData.graphics.backRenderStack.find(t => t.name == otherRect.name) == undefined){
                    return new InterpreterError('StateError', `Cannot check for overlap because Rectangle [${otherRect.name}] has not been added to the screen`, token, interp.interval, token.position);
                }



                let thisX = +thisRect.x;
                let thisY = +thisRect.y;
                let thisWidth = +thisRect.width;
                let thisHeight = +thisRect.height;

                let otherX = +otherRect.x;
                let otherY = +otherRect.y;
                let otherWidth = +otherRect.width;
                let otherHeight = +otherRect.height;

                let overlaps = !(thisX + thisWidth < otherX ||
                    thisX > otherX + otherWidth ||
                    thisY + thisHeight < otherY ||
                    thisY > otherY + otherHeight);

                return new Token("Boolean", overlaps.toString(), token.position, token.methods);
            }, ["Rectangle"]),

            new Method("clone", ["Rectangle"], (token, args, interp) => {
                let finalToken = new Token("Array", [], token.position, token.methods);

                finalToken.value.push(new Token("Number", token.value.x, token.position, token.methods));
                finalToken.value.push(new Token("Number", token.value.y, token.position, token.methods));
                finalToken.value.push(new Token("Number", token.value.width, token.position, token.methods));
                finalToken.value.push(new Token("Number", token.value.height, token.position, token.methods));

                finalToken.value[0].cloneInfo = {
                    stroke: token.value.stroke,
                    fill: token.value.fill,
                }

                return finalToken;
            }, []),

            new Method("add", ["Rectangle"], (token, args, interp) => {
                if(!interp.importData.graphics.rendered){
                    return new InterpreterError('ReferenceError', `Screen not created. Use the [createscreen] keyword first`, token, interp.interval, token.position);
                }
                args;

                interp.importData.graphics.backRenderStack.push(token.value);
                interp.renderGraphics(["back"]);
                return token;
            }),
            new Method("remove", ["Rectangle"], (token, args, interp) => {
                if(!interp.importData.graphics.rendered){
                    return new InterpreterError('ReferenceError', `Screen not created. Use the [createscreen] keyword first`, token,  interp.interval, token.position);
                }
                args;
                let variable = interp.variables[token.value.name];
                if(variable == undefined) {
                    return new InterpreterError('ReferenceError', `Variable [${token.value.name}] is not defined`, token, interp.interval, token.position);
                }

                interp.importData.graphics.backRenderStack = interp.importData.graphics.backRenderStack.filter(t => t.name != token.value.name);

                interp.renderGraphics(["back"]);
                return token;
            }),
            new Method("x", ["Rectangle"], (token, args, interp) => {
                if(args[0] == undefined) return new Token("Number", token.value.x, token.position, token.methods);
                else {
                    interp.variables[token.value.name].value.x = args[0].value;

                    interp.renderGraphics(["back"]);
                    return token;
                }
            }, ["Number?"]),
            new Method("y", ["Rectangle"], (token, args, interp) => {
                if(args[0] == undefined) return new Token("Number", token.value.y, token.position, token.methods);
                else {
                    interp.variables[token.value.name].value.y = args[0].value;

                    interp.renderGraphics(["back"]);
                    return token;
                }
            }, ["Number?"]),
            new Method("move", ["Rectangle"], (token, args, interp) => {
                let newX = args[0].value;
                let newY = args[1].value;

                interp.variables[token.value.name].value.x = newX;
                interp.variables[token.value.name].value.y = newY;
                interp.renderGraphics(["back"]);
                return token;
            }, ["Number", "Number"]),
            new Method("width", ["Rectangle"], (token, args, interp) => {
                if(args[0] == undefined) return new Token("Number", token.value.width, token.position, token.methods);
                else {
                    interp.variables[token.value.name].value.width = args[0].value;

                    interp.renderGraphics(["back"]);
                    return token;
                }
            }, ["Number?"]),
            new Method("height", ["Rectangle"], (token, args, interp) => {
                if(args[0] == undefined) return new Token("Number", token.value.height, token.position, token.methods);
                else {
                    interp.variables[token.value.name].value.height = args[0].value;

                    interp.renderGraphics(["back"]);
                    return token;
                }
            }, ["Number?"]),
            new Method("size", ["Rectangle"], (token, args, interp) => {
                let newWidth = args[0].value;
                let newHeight = args[1].value;

                interp.variables[token.value.name].value.width = newWidth;
                interp.variables[token.value.name].value.height = newHeight;
                interp.renderGraphics(["back"]);
                return token;
            }, ["Number", "Number"]),
            new Method("fill", ["Rectangle"], (token, args, interp) => {
                if(args[0] == undefined) return new Token("String", token.value.fill, token.position, token.methods);
                else {
                    interp.variables[token.value.name].value.fill = args[0].value;

                    interp.renderGraphics(["back"]);
                    return token;
                }
            }, ["String?"]),
            new Method("stroke", ["Rectangle"], (token, args, interp) => {
                if(args[0] == undefined) return new Token("String", token.value.stroke, token.position, token.methods);
                else {
                    interp.variables[token.value.name].value.stroke = args[0].value;

                    interp.renderGraphics(["back"]);
                    return token;
                }
            }, ["String?"]),
        ],
    }
}