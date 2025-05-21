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
     * @param {function(Token[], Interpreter, Keyword): void} [pre] - A function called before validation, allows modification of the keyword. To modify the tokens, return an array of tokens.
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
                    return interp.outputError(new InterpreterError('TypeError', `Missing expected type of ${this.scheme[i]}`, args, interp.interval, position));
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
            if(this.type == "basic_noparse"){
                if(args[0].type == "Keyword" && args[0].value == "func" && args[1].type == "Function") {
                    let func = args[1].value.slice(1);
                    this.args = interp.tokenize(func, false)
                } else {
                    this.args = args;
                }
            } else if(this.type == "assigner") {
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
                let startingTokens = structuredClone(args.slice(0, 1));
                args = args.slice(1);
                let parsedMethods = interp.parseMethods(interp.formatMethods(interp.groupByCommas(args)[0]));
                if(parsedMethods instanceof InterpreterError) return interp.outputError(parsedMethods);
                else {
                    startingTokens.forEach((token, i) => {
                        startingTokens[i] = new Token(token.type, token.value, token.position);
                    });
                    this.args = [...startingTokens, parsedMethods];
                }
            }

            for(let i = 0; i < args.length; i++) {
                let arg = args[i];
                if(arg.type == "Function"){
                    let functionName = arg.value.split("(")[0].slice(1);
                    let functionArgs = interp.tokenize(arg.value.split("(")[1].slice(0, -1), false)

                    if(functionArgs.some(t => t instanceof InterpreterError)) {
                        let error = functionArgs.find(t => t instanceof InterpreterError);
                        return interp.outputError(error);
                    } else {
                        let groups = interp.groupByCommas(functionArgs);
                        let values = [];
                        groups.forEach((group, i) => {
                            let formatted = interp.formatMethods(group);

                            let parsed = interp.parseMethods(formatted);

                            values.push(parsed);
                        });

                        let func = interp.functions[functionName];

                        if(func == undefined) {
                            return interp.outputError(new InterpreterError('ReferenceError', `Invalid function syntax for function [${functionName}]`, args, interp.interval, arg.position));
                        }

                        let expectedArgs = Object.keys(func.args);

                        for(let j = 0; j < expectedArgs.length; j++) {
                            if(func.args[expectedArgs[j]] != values[j]?.type) {
                                let returnValue = null;
                                if(values[j] == undefined){
                                    returnValue = 'Nothing';
                                } else {
                                    returnValue = `type [${values[j].type}]`;
                                }
                                return interp.outputError(new InterpreterError('TypeError', `Expected type [${func.args[expectedArgs[j]]}], found ${returnValue}`, args, interp.interval, arg.position));
                            }

                            interp.temporaryVariables[expectedArgs[j]] = {
                                type: values[j].type,
                                value: values[j].value,
                                mutable: true
                            }
                        }

                        let tokenizedBody = func.body.map(line => interp.tokenize(line));

                        let lastToken = null;

                        for(let j = 0; j < tokenizedBody.length; j++) {
                            let line = tokenizedBody[j];

                            for(let k = 0; k < tokenizedBody[j].length; k++) {
                                let token = tokenizedBody[j][k];
                                
                                if(token instanceof InterpreterError) {
                                    token.line -= func.start;
                                    return interp.outputError(token);
                                }
                            }

                            let scheme = Keyword.schemes[line[0].value];
                            let errorInPre = scheme.prefn(line, interp, this);

                            if(errorInPre instanceof InterpreterError) {
                                return interp.outputError(errorInPre);
                            }

                            let keywordResult = scheme.fn(line, interp);

                            lastToken = line;

                            if(line[0].type == "Keyword" && line[0].value == "return") {
                                break;
                            }

                            if (keywordResult instanceof InterpreterError) {
                                return interp.outputError(keywordResult);
                            }
                        }

                        if(lastToken != null){
                            this.args = lastToken;
                        }

                        interp.temporaryVariables = {};
                    }
                }
            }

            try {
                let tokens = pre(this.args, interp, this);
                if(tokens != undefined) {
                    this.args = tokens;
                }
            } catch (e) {}
        }

        Keyword.schemes[keyword] = this;
    }
}

/**
 * Represents a token in the interpreter.
 * Each token has a type, value, position, and optional methods.
 * The token type can be a keyword, number, string, array, etc.
 */
class Token {
    static specs = [];

    static generateSpecs() {
        let basicKeywords = []
        let assignerKeywords = []
        for (const [keyword, scheme] of Object.entries(Keyword.schemes)) {
            if (scheme.type === 'basic') {
                basicKeywords.push(keyword);
            } else if (scheme.type === 'basic_noparse') {
                basicKeywords.push(keyword);
            } else if (scheme.type === 'assigner') {
                assignerKeywords.push(keyword);
            }
        }
        
        Token.specs = [
            ['Keyword', new RegExp(`\\b(${basicKeywords.join('|')})\\b`)],
            ['Assigner', new RegExp(`\\b(${assignerKeywords.join('|')})\\b`)],
            ['Number', /\b\d+\b/],
            ['String', /'(?:\\'|[^'])*'|"(?:\\"|[^"])*"/],
            ['Array', /\$([^\$]+)\$/],
            ['Function', /@.*\(.*\)/],
            ['Calculation_Equals', / == /],
            ['Calculation_Nequals', / != /],
            ['Calculation_LessThan', / < /],
            ['Calculation_GreaterThan', / > /],
            ['Calculation_LessThanEquals', / <= /],
            ['Calculation_GreaterThanEquals', / >= /],
            ['Calculation_And', / & /],
            ['Calculation_Or', / \| /],
            ['MethodInitiator', />/],
            ['Boolean', /\b(true|false)\b/],
            ['Identifier', /\b[a-zA-Z][a-zA-Z0-9_]*\b/],
            ["FunctionCall", /@[a-zA-Z][a-zA-Z0-9_]*\(.+?\)/],
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
                if (!expected.optional) return {result: false, type: "SyntaxError", message: `Missing argument ${i}`};
                continue;
            }

            if (actual.type !== expected.type) return { result: false, type: "TypeError", message: `Expected type ${expected.type}, found type ${actual.type} at argument ${i} of method [${this.name}]`};
        }

        return { result: true };
    }
}


class Interpreter {
    static interpreters = [];
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
    constructor(input, programName, fileArguments) {
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
            }
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
        this.importData = {};
        this.promptCount = 0;
        Interpreter.interpreters.push(this);
        this.running = false

        for(let i = 0; i < fileArguments.length; i++) {
            if(!isNaN(parseInt(fileArguments[i]))){
                fileArguments[i] = {
                    type: 'Number',
                    value: fileArguments[i]
                }
            } else if(fileArguments[i] == "true" || fileArguments[i] == "false") {
                fileArguments[i] = {
                    type: 'Boolean',
                    value: fileArguments[i] == "true"
                }
            } else if((fileArguments[i].startsWith('"') && fileArguments[i].endsWith('"')) || (fileArguments[i].startsWith("'") && fileArguments[i].endsWith("'"))) {
                fileArguments[i] = {
                    type: 'String',
                    value: Interpreter.trimQuotes(fileArguments[i])
                }
            } 
        }

        this.fileArguments = fileArguments;
        this.fileArgumentCount = 0;
        this.load = () => {};
        this.onComplete = () => {};
        this.onError = (error) => {};

        let boundKillFunction = function(e) {
            if (!this.running) {
                window.removeEventListener('keydown', boundKillFunction);
                return;
            }

            if (e.key === "Delete" && this.running) {
                this.outputError(new InterpreterError(
                    'Interrupt',
                    'Program was interrupted by user',
                    null, NaN, NaN
                ));
                window.removeEventListener('keydown', boundKillFunction);
            }
        }.bind(this);

        window.addEventListener('keydown', boundKillFunction);
    }

    static trimQuotes(value) {
        return typeof value === 'string' ? value.replace(/^['"]|['"]$/g, '') : value;
    }

    output(value) {
        if(value == undefined) return;
        createTerminalLine(value, "", {translate: false});
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

        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].type === 'Identifier') {
                if(i - 1 >= 0 && tokens[i - 1].type === 'Assigner' && tokens[i + 1].type === 'Assignment') {
                    tokens[i].type = 'Assignee';
                }
            }
        }

        for (let i = 0; i < tokens.length; i++) {
            if(tokens[i].type === "FunctionIdentifier") {
                if(tokens[i+1].type === "Identifier") {
                    tokens[i+1].type = "FunctionName";
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

        if(tokens[0]?.type == "Keyword" && tokens[0]?.value == "func") return tokens;
        
        if(getVariables) tokens.forEach((token, index) => {
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
                        tokens.push(t => t instanceof InterpreterError);
                        return;
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
                    }

                    token.value = token.value.replace(`$\|${expr}\|`,values[0].value);
                });
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
        if(token == null) return null;
        if(token.methods == undefined) return token;
        while (token.methods?.length > 0) {
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

            if(!methodInstance.validateArgs(args).result) {
                return new InterpreterError(methodInstance.validateArgs(args).type, methodInstance.validateArgs(args).message, token, this.interval, token.position);
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


        if(token instanceof InterpreterError) return token;
        else if(token.value instanceof Token) token = token.value;
        else token = new Token(token.type, token.value, token.position);

        return token;
    }

    step() {
        this.pause();
        this.gotoNext();
    }

    gotoNext() {
        if(this.paused) return;
        Token.generateSpecs();
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

    run() {
        if(this.running) return;
        this.running = true;
        Interpreter.blockErrorOutput = false;
        Token.generateSpecs();
        this.load();
        this.error = false;
        this.clock = setInterval(() => {
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
        this.savedData = {};
        this.paused = false;
        this.clock = null;
        this.interval = 0;
        this.iteration = 0;
        this.interval_length = 1;
        Interpreter.interpreters = Interpreter.interpreters.filter(interp => interp !== this);
        this.running = false;
        this.lines = [];
        this.tokens = [];
        this.imports = [];
        this.promptCount = 0;
        this.importData = {};
        this.fileArgumentCount = 0;
        Keyword.schemes = {};
        Method.registry = new Map();
        Token.specs = [];
    }

    kill() {
        clearInterval(this.clock);
        this.resetMemory();
    }
}

const load_function = () => {
    const KEYWORD_COMMENT = new Keyword('--', "basic", ['Keyword'], { dud: true })

    const KEYWORD_PROMPT = new Keyword('prompt', "basic_noparse", ['Keyword', "String", "Number", "Array"], {
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
                return interp.outputError(new InterpreterError('IndexError', `Index [${selectedIndex}] is out of bounds for array of length [${arrayOptions.length}]`, tokens, interp.interval, tokens[2].position));
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
                    interp.resume();

                    interp.interval--;
                    interp.lines[interp.interval] = `set ${variable} = "${arrayOptions[selectedIndex]}"`;
                    document.body.removeEventListener("keyup", promptHandler);
                }
            }

            terminal.appendChild(lineContainer);
            document.body.addEventListener("keyup", promptHandler)
        }
    })

    const KEYWORD_ASK = new Keyword('ask', "basic_noparse", ['Keyword', "String", "String"], {
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
                    interp.resume();

                    interp.interval--;
                    interp.lines[interp.interval] = `set ${variable} = "${inputValue}"`;
                }
            });
        }
    })
    const KEYWORD_FILEARG = new Keyword('filearg', "basic_noparse", ['Keyword', 'String', 'String'], {
        post: (tokens, interp, keyword) => {
            let variableName = `Filearg_${tokens[1].value}`;
            let variableType = tokens[2].value;

            if(interp.fileArguments[interp.fileArgumentCount].type != variableType) {
                return interp.outputError(new InterpreterError('TypeError', `Expected type [${variableType}] for Filearg [${interp.fileArgumentCount}], found type [${interp.fileArguments[interp.fileArgumentCount].type}]`, tokens, interp.interval, tokens[0].position));
            }

            if(interp.variables[variableName] != undefined) {
                return interp.outputError(new InterpreterError('ReferenceError', `Filearg [${variableName}] is already defined`, tokens, interp.interval, tokens[0].position));
            }

            interp.setVariable(variableName, interp.fileArguments[interp.fileArgumentCount].value, variableType, false);

            interp.fileArgumentCount++;
        }
    })

    const KEYWORD_ENDPROG = new Keyword('endprog', "basic", ['Keyword'], { 
        post: (tokens, interp) => {
            interp.kill();
            interp.onComplete();
        }
    });

    const KEYWORD_FREE = new Keyword('free', "basic", ['Keyword', "String"], { 
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
    });

    const KEYWORD_CALL = new Keyword('call', "basic", ['Keyword'], { dud: false });

    const KEYWORD_STR = new Keyword('str', "assigner", ['Assigner', 'Assignee', 'Assignment', 'String'], {
        post: (tokens, interp, keyword) => {
            let identifier = tokens[1];
            let value = tokens[3];

            interp.setVariable(identifier.value, value.value, 'String', true);
        }
    });

    const KEYWORD_CSTR = new Keyword('cstr', "assigner", ['Assigner', 'Assignee', 'Assignment', 'String'], {
        post: (tokens, interp, keyword) => {
            let identifier = tokens[1];
            let value = tokens[3];

            interp.setVariable(identifier.value, value.value, 'String', false);
        }
    });

    const KEYWORD_NUM = new Keyword('num', "assigner", ['Assigner', 'Assignee', 'Assignment', 'Number'], {
        post: (tokens, interp) => {
            let identifier = tokens[1];
            let value = tokens[3];

            interp.setVariable(identifier.value, value.value, 'Number', true);
        }
    });

    const KEYWORD_CNUM = new Keyword('cnum', "assigner", ['Assigner', 'Assignee', 'Assignment', 'Number'], {
        post: (tokens, interp) => {
            let identifier = tokens[1];
            let value = tokens[3];

            interp.setVariable(identifier.value, value.value, 'Number', false);
        }
    });

    const KEYWORD_BLN = new Keyword('bln', "assigner", ['Assigner', 'Assignee', 'Assignment', 'Boolean'], {
        post: (tokens, interp) => {
            let identifier = tokens[1];
            let value = tokens[3];

            interp.setVariable(identifier.value, value.value, 'Boolean', true);
        }
    });

    const KEYWORD_CBLN = new Keyword('cbln', "assigner", ['Assigner', 'Assignee', 'Assignment', 'Boolean'], {
        post: (tokens, interp) => {
            let identifier = tokens[1];
            let value = tokens[3];

            interp.setVariable(identifier.value, value.value, 'Boolean', false);
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

            let variable = interp.getVariable(identifier.value);

            if(variable.mutable == false){
                return interp.outputError(new InterpreterError('ReferenceError', `Variable [${identifier.value}] is not mutable`, tokens, interp.interval, identifier.position));
            }

            interp.setVariable(identifier.value, value.value, variable.type, true);
        }
    });

    const KEYWORD_ARR = new Keyword('arr', "assigner", ['Assigner', 'Assignee', 'Assignment', 'Array'], {
        post: (tokens, interp) => {
            let identifier = tokens[1];
            let token = tokens[3];

            interp.setVariable(identifier.value, token.value, 'Array', true);
        }
    });

    const KEYWORD_CARR = new Keyword('carr', "assigner", ['Assigner', 'Assignee', 'Assignment', 'Array'], {
        post: (tokens, interp) => {
            let identifier = tokens[1];
            let token = tokens[3];

            interp.setVariable(identifier.value, token.value, 'Array', false);
        }
    });

    const KEYWORD_IF = new Keyword('if', "basic", ['Keyword', 'Number|Boolean'], {
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

            if(elseIndex != -1) interp.lines[elseIndex] += ` ${endIfIndex}`

            let ifCondition = keyword.args[1].value;

            if (!ifCondition) {
                if (elseIndex !== -1) {
                    interp.interval = elseIndex;
                } else {
                    interp.interval = endIfIndex;
                }
            }
        },
    });

    const KEYWORD_ENDIF = new Keyword('endif', "basic", ['Keyword'], { dud: true });

    const KEYWORD_RETURN = new Keyword('return', "basic", ['Keyword', 'Number|String|Boolean'], { dud: true });

    const KEYWORD_ELSE = new Keyword('else', "basic", ['Keyword', 'Number'], {
        post: (tokens, interp, keyword) => {
            interp.interval = tokens[1].value
        }
    })

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
    });

    const KEYWORD_FUNC = new Keyword('func', "basic_noparse", ['Keyword', 'Identifier'], {
        pre: (tokens, interp, keyword) => {
            let depth = 1;
            let endFuncIndex = -1;
            let startFuncindex = interp.interval
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

            let functionIdentifier = tokens[1];

            let argArray = structuredClone(tokens);

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

                if(argName.type != "Identifier") {
                    return interp.outputError(new InterpreterError('SyntaxError', `Expected argument Identifier for arg ${i}`, argName, interp.interval, argName.position));
                }

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
                body: structuredClone(interp.lines).slice(startFuncindex + 1, endFuncIndex),
                start: startFuncindex,
                end: endFuncIndex
            }
        }
    });

    // Multi
    new Method("type", ["String", "Number", "Boolean", "Array"], (token, args) => {
        return new Token("String", token.type, token.position, token.methods);
    }, []);

    new Method("index", ["String", "Array"], (token, args) => {
        let arg0 = args[0];
        let indexValue = token.value[arg0.value]
        if(indexValue == undefined) {
            return new InterpreterError('IndexError', `Index out of range`, token, token.position, token.position);
        }
        return new Token("String", indexValue, token.position, token.methods);
    }, ["Number"]);

    // pure array
    new Method("join", ["Array"], (token, args) => {
        let arg0 = args[0]?.value || ","
        return new Token("String", token.value.map(t => t.value).join(arg0), token.position, token.methods);
    }, ["String?"]);

    new Method("append", ["Array"], (token, args) => {
        let arg0 = args[0];
        return new Token("Array", [...token.value, ...arg0.value], token.position, token.methods);
    }, ["Array"]);

    new Method("length", ["Array"], (token, args) => {
        return new Token("Number", token.value.length, token.position, token.methods);
    }, []);

    // pure string
    new Method("eq", ["String"], (token, args) => {
        return new Token("Boolean", token.value == args[0].value, token.position, token.methods);
    }, ["String"]);

    new Method("neq", ["String"], (token, args) => {
        return new Token("Boolean", token.value != args[0].value, token.position, token.methods);
    }, ["String"]);

    new Method("append", ["String"], (token, args) => {
        let arg0 = args[0];
        return new Token("String", token.value + arg0.value, token.position, token.methods);
    }, ["String"]);

    new Method("length", ["String"], (token, args) => {
        return new Token("Number", token.value.length, token.position, token.methods);
    }, []);

    new Method("repeat", ["String"], (token, args) => {
        let arg0 = args[0];
        return new Token("String", token.value.repeat(arg0.value), token.position, token.methods);
    }, ["Number"]);
}