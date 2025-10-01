const math = require("mathjs");

class FS3Error {
    constructor(type, message, line, col, errLine){
        this.type = type;
        this.message = message;
        this.line = line;
        this.col = col;
        this.errLine = errLine;
    }
}

class FS3Warn {
    constructor(type, message, line, col){
        this.type = type;
        this.message = message;
        this.line = line;
        this.col = col;
    }
}

class SkipBlock {
    constructor(line, col){
        this.type = "SkipBlock";
        this.line = line;
        this.col = col;
    }
} 

class ExitFunction {
    constructor(line, col){
        this.type = "ExitFunction";
        this.line = line;
        this.col = col;
    }
} 

class BreakLoop {
    constructor(line, col){
        this.type = "BreakLoop";
        this.line = line;
        this.col = col;
    }
}

class ContinueLoop {
    constructor(line, col){
        this.type = "ContinueLoop";
        this.line = line;
        this.col = col;
    }
}

class Method {
    static table = {};
    constructor(name, parentTypes, args, fn, defaultMethod = true){
        this.parentTypes = parentTypes;
        this.args = args;
        this.fn = fn;
        this.defaultMethod = defaultMethod;

        Method.table[name] = this;
    }

    static get(name){
        return Method.table[name] || null;
    }
}

class Keyword {
    static table = {};
    constructor(name, scheme, fn, defaultKeyword = true){
        this.scheme = scheme;
        this.fn = fn;
        Keyword.table[name] = this;
        this.defaultKeyword = defaultKeyword;
    }

    static get(name){
        return Keyword.table[name] || null;
    }
}

const imports = {
    math: (interp) => {
        if(interp){
            if (interp.variables["Math"]) {
                throw new FS3Error("ReferenceError", `Variable [Math] is already defined`, -1, -1, []);
            }
            interp.variables["Math"] = {
                value: "Math Module",
                type: "Math",
                mut: false,
                freeable: false
            }
        }


        new Method("random", ["Math"], [{type: ["number"], optional: false}, {type: ["number"], optional: false}], undefined, false);
    },
    keyboard: (interp) => {
        new Keyword("keydown", ["string", "block"], undefined, false);

        new Keyword("keyup", ["string", "block"], undefined, false);
    },
    objects: (interp) => {
        if(interp){
            if (interp.variables["Object"]) {
                throw new FS3Error("ReferenceError", `Variable [Object] is already defined`, -1, -1, []);
            }

            interp.variables["Object"] = {
                value: "{}",
                tree: {},
                type: "object",
                mut: false,
                freeable: false
            }
        }


        Method.table.type.parentTypes.push("object")
        Keyword.table.var.scheme[2] += "|object"
        Keyword.table.cvar.scheme[2] += "|object"

        new Method("new", ["object"], [], (parent, args, interpreter) => {
            return {
                type: "object",
                value: {},
                line: parent.line,
                col: parent.col,
                methods: parent.methods,
            }
        }, false);

        new Method("get", ["object"], [{type: ["string"], optional: false}], (parent, args, interpreter) => {
            let key = args[0].value;

            if(!(key in parent.value)){
                throw new FS3Error("ReferenceError", `Key [${key}] does not exist on object`, args[0].line, args[0].col, args);
            }
            return parent.value[key];
        }, false);

        new Keyword("objset", ["variable_reference", "string", "literal_assignment" ,"string|number|array|object"], (args, interpreter) => {

        }, false);
    }
}

// {type: ['number'], optional: false}
new Method("splice", ["array"], [{type: ['number'], optional: false}, {type: ['number'], optional: true}], (parent, args, interpreter) => {
    let start = args[0].value;
    let deleteCount = args[1] ? args[1].value : parent.value.length - start;
    if(start < 0 || start >= parent.value.length){
        throw new FS3Error("RangeError", `Start index [${start}] is out of bounds for array of length [${parent.value.length}]`, args[0].line, args[0].col, args);
    }
    if(deleteCount < 0){
        throw new FS3Error("RangeError", `Delete count [${deleteCount}] cannot be negative`, args[1] ? args[1].line : args[0].line, args[1] ? args[1].col : args[0].col, args);
    }
    let array = structuredClone(parent.value);
    array.splice(start, deleteCount);
    parent.value = array;
    return parent;
});

// document
new Method("shift", ["array"], [], (parent, args, interpreter) => {
    if(parent.value.length === 0){
        throw new FS3Error("RangeError", `Cannot shift from an empty array`, parent.line, parent.col, args);
    }
    let array = structuredClone(parent.value);

    array.shift()

    parent.value = array;

    return parent;
});

// document
new Method('replaceAt', ['string', 'array'], [{type: ['number'], optional: false}, {type: ['string'], optional: false}], (parent, args, interpreter) => {
    if(parent.type === "array"){
        let index = args[0].value;
        let replacement = args[1];
        if(index < 0 || index >= parent.value.length){
            throw new FS3Error("RangeError", `Index [${index}] is out of bounds for array of length [${parent.value.length}]`, args[0].line, args[0].col, args);
        }
        parent.value[index] = replacement;
        return parent;
    } else {
        let index = args[0].value;
        let replacement = args[1].value;
        if(index < 0 || index >= parent.value.length){
            throw new FS3Error("RangeError", `Index [${index}] is out of bounds for string of length [${parent.value.length}]`, args[0].line, args[0].col, args);
        }
        parent.value = parent.value.substring(0, index) + replacement + parent.value.substring(index + 1);
        return parent;
    }
});


// document
new Method('last', ['array'], [], (parent, args, interpreter) => {
    if(parent.value.length === 0){
        throw new FS3Error("RangeError", `Cannot get last element of an empty array`, parent.line, parent.col, args);
    }
    return parent.value[parent.value.length - 1];
});

// document
new Method('first', ['array'], [], (parent, args, interpreter) => {
    if(parent.value.length === 0){
        throw new FS3Error("RangeError", `Cannot get first element of an empty array`, parent.line, parent.col, args);
    }
    return parent.value[0];
});

// document
new Method("push", ["array"], [{type: ["string", "number", "array"], optional: false}], (parent, args, interpreter) => {
    parent.value.push(args[0]);
    return parent;
});

new Method('concat', ['string'], [{type: ['string'], optional: false}], (parent, args, interpreter) => {
    parent.value = parent.value + args[0].value;
    return parent;
});

new Method("eq", ["string"], [{type: ["string"], optional: false}], (parent, args, interpreter) => {
    let parentValue = parent.value;
    let argValue = args[0].value;

    return {
        type: "condition_statement",
        value: `<<${parentValue === argValue ? 1 : 0}>>`,
        line: parent.line,
        col: parent.col,
        methods: parent.methods
    }
});

new Method("neq", ["string"], [{type: ["string"], optional: false}], (parent, args, interpreter) => {
    let parentValue = parent.value;
    let argValue = args[0].value;

    return {
        type: "condition_statement",
        value: `<<${parentValue !== argValue ? 1 : 0}>>`,
        line: parent.line,
        col: parent.col,
        methods: parent.methods
    }
});

new Method("type", ["string", "number", "array"], [], (parent, args, interpreter) => {
    let type = structuredClone(parent.type);
    
    parent.value = type;
    parent.type = "string";

    return parent;
});

new Method("length", ["string", "array"], [], (parent, args, interpreter) => {
    parent.value = parent.value.length;
    parent.type = "number";
    return parent;
});

new Method("inc", ["number"], [], (parent, args, interpreter) => {
    parent.value = parent.value + 1;
    return parent;
});

new Method("dec", ["number"], [], (parent, args, interpreter) => {
    parent.value = parent.value - 1;
    return parent;
});

new Method("add", ["number"], [{type: ["number"], optional: false}], (parent, args, interpreter) => {
    parent.value = parent.value + args[0].value;
    return parent;
});

new Method("sub", ["number"], [{type: ["number"], optional: false}], (parent, args, interpreter) => {
    parent.value = parent.value - args[0].value;
    return parent;
});

new Method("mul", ["number"], [{type: ["number"], optional: false}], (parent, args, interpreter) => {
    parent.value = parent.value * args[0].value;
    return parent;
});

new Method("div", ["number"], [{type: ["number"], optional: false}], (parent, args, interpreter) => {
    if(args[0].value === 0){
        throw new FS3Error("MathError", "Division by zero is not permitted", args[0].line, args[0].col, args);
    }
    parent.value = parent.value / args[0].value;
    return parent;
});

new Method("mod", ["number"], [{type: ["number"], optional: false}], (parent, args, interpreter) => {
    if(args[0].value === 0){
        throw new FS3Error("MathError", "Modulo by zero is not permitted", args[0].line, args[0].col, args);
    }
    parent.value = parent.value % args[0].value;
    return parent;
});

new Method("index", ["array", "string"], [{type: ["number"], optional: false}], (parent, args, interpreter) => {
    if(parent.type === "array"){
        let index = args[0].value;
        if(index < 0 || index >= parent.value.length){
            throw new FS3Error("RangeError", `Index [${index}] is out of bounds for array of length [${parent.value.length}]`, args[0].line, args[0].col, args);
        }

        return parent.value[index]
    } else {
        let str = parent.value;
        let index = args[0].value;
        if(index < 0 || index >= str.length){
            throw new FS3Error("RangeError", `Index [${index}] is out of bounds for string of length [${str.length}]`, args[0].line, args[0].col, args);
        }

        return {
            type: "string",
            value: str.charAt(index),
            line: parent.line,
            col: parent.col,
            methods: []
        }
    }
});

new Method("join", ["array"], [{type: ["string"], optional: true}], (parent, args, interpreter) => {
    let separator = args[0] ? args[0].value : ",";

    parent.value = parent.value.map(el => {
        if(Array.isArray(el)) throw new FS3Error("TypeError", "Nested arrays are not supported in join()", el[0]?.line, el[0]?.col, el);
        return String(el.value);
    }).join(separator);
    parent.type = "string";
    return parent;
});

new Method("toNumber", ["string"], [], (parent, args, interpreter) => {
    let num = Number(parent.value);
    if(isNaN(num)){
        num = 0;
    }

    parent.value = num;
    parent.type = "number";

    return parent;
});

new Method("toString", ["number"], [], (parent, args, interpreter) => {
    parent.value = String(parent.value);
    parent.type = "string";
    return parent;
});

new Method("wrap", ["string"], [{type: ["string"], optional: true}, {type: ["string"], optional: true}], (parent, args, interpreter) => {
    let left = '"';
    let right = '"';

    if(args[0]){
        left = args[0].value;
        right = args[0].value;
    }

    if(args[1]){
        right = args[1].value;
    }

    parent.value = left + parent.value + right;
    return parent;
});

new Method("repeat", ["string"], [{type: ["number"], optional: false}], (parent, args, interpreter) => {
    let times = args[0].value;
    if(times < 0){
        throw new FS3Error("RangeError", `Cannot repeat a string a negative number of times`, args[0].line, args[0].col, args);
    }
    parent.value = parent.value.repeat(times);
    return parent;
});

new Method("indexOf", ["array"], [{type: ["string", "number", "array"], optional: false}], (parent, args, interpreter) => {
    let searchValue = args[0];
    let index = -1;
    parent.value.forEach((el, i) => {
        if(el.type === searchValue.type && el.value === searchValue.value){
            index = i;
            return;
        }
    });

    return {
        type: "number",
        value: index,
        line: parent.line,
        col: parent.col,
        methods: []
    }
});

// document
new Keyword("clearterminal", []);

new Keyword("import", ["string"]);

new Keyword("skip", []);

new Keyword("break", []);

new Keyword("exit", []);

new Keyword("continue", []);

new Keyword("arrset", ["variable_reference", "number", "literal_assignment", "string|number|array"], (args, interpreter) => {
    let variableName = args[0].value.slice(1);
    let index = args[1].value;
    let newValue = args[3];

    if(!interpreter.variables[variableName]){
        throw new FS3Error("ReferenceError", `Variable [${variableName}] is not defined`, args[0].line, args[0].col, args);
    }

    if(!interpreter.variables[variableName].mut){
        throw new FS3Error("AccessError", `Variable [${variableName}] is immutable and cannot be changed`, args[0].line, args[0].col, args);
    }

    if(interpreter.variables[variableName].type !== "array"){
        throw new FS3Error("TypeError", `Variable [${variableName}] must be of type [array] to use [arrset] keyword`, args[0].line, args[0].col, args);
    }

    if(index < 0 || index >= interpreter.variables[variableName].value.length){
        throw new FS3Error("RangeError", `Index [${index}] is out of bounds for array of length [${interpreter.variables[variableName].value.length}]`, args[1].line, args[1].col, args);
    }

    interpreter.variables[variableName].value[index] = {
        type: newValue.type,
        value: newValue.value,
        line: interpreter.variables[variableName].value[index].line,
        col: interpreter.variables[variableName].value[index].col,
        methods: []
    }
});

new Keyword("foreach", ["variable_reference", "literal_in", "variable_reference", "block"]);

new Keyword("filearg", ["variable_reference", "number"]);

new Keyword("set", ["variable_reference", "literal_assignment", "string|number|array"], (args, interpreter) => {
    let variableName = args[0].value.slice(1);
    let variableValue = args[2].value;

    if(!interpreter.variables[variableName]){
        throw new FS3Error("ReferenceError", `Variable [${variableName}] is not defined`, args[0].line, args[0].col, args);
    } 

    if(interpreter.variables[variableName].type !== args[2].type){
        throw new FS3Error("TypeError", `Cannot set variable [${variableName}] of type [${interpreter.variables[variableName].type}] to value of type [${args[2].type}]`, args[0].line, args[0].col, args);
    }

    if(!interpreter.variables[variableName].mut){
        throw new FS3Error("AccessError", `Variable [${variableName}] is immutable and cannot be changed`, args[0].line, args[0].col, args);
    }
    
    interpreter.variables[variableName].value = variableValue;
});

// ["string", "string|number", "any?"]
new Keyword("out", ["string|number"]);

new Keyword("warn", ["string"]);

new Keyword("error", ["string"]);

new Keyword("longwarn", ["string", "string"]);

new Keyword("longerr", ["string", "string"]);

new Keyword("kill", []);

new Keyword("quietkill", []);

new Keyword("func", ["function_reference", "block"])

new Keyword("pfunc", ["function_reference", "array", "block"]);

new Keyword("pcall", ["function_reference", "array"]);

new Keyword("wait", ["number"]);


new Keyword("call", ["function_reference"]);
    

new Keyword("var", ["variable_reference", "literal_assignment", "string|number|array"], (args, interpreter) => {
    let name = args[0].value;
    let value = args[2].value;
    let type = args[2].type;

    if(interpreter.variables[name]){
        throw new FS3Error("ReferenceError", `Variable [${name}] is already defined`, args[0].line, args[0].col, args);
    }

    interpreter.variables[name] = {
        value: value,
        type: type,
        mut: true,
        freeable: true
    }

    if(type === "object") interpreter.variables[name].tree = {};
})

new Keyword("prompt", ["variable_reference", "number", "array"]);

// variable name, input type (string or number)
new Keyword("ask", ["variable_reference", "string"]);

new Keyword("cvar", ["variable_reference", "literal_assignment", "string|number|array"], (args, interpreter) => {
    let name = args[0].value;
    let value = args[2].value;
    let type = args[2].type;

    if(interpreter.variables[name]) throw new FS3Error("ReferenceError", `Variable [${name}] is already defined`, args[0].line, args[0].col, args);

    interpreter.variables[name] = {
        value: value,
        type: type,
        mut: false,
        freeable: true
    }

    if(type === "object") interpreter.variables[name].tree = {};
})

new Keyword("free", ["variable_reference"]);

new Keyword("return", ["string|number|array"]);

new Keyword("if", ["condition_statement", "block"]);

new Keyword("else", ["block"]);

new Keyword("loop", ["number|condition_statement", "block"]);

class FroggyScript3 {
    static matches = [
        ["comment", /# .*/],
        ["literal_in", / in /],
        ["number", /[0-9]+(?:\.[0-9]+)?/],
        ["variable", /[A-Za-z_][A-Za-z0-9_]*/],
        ["function_reference", /@[A-Za-z_][A-Za-z0-9_]*/],
        ["variable_reference", /\$[A-Za-z_][A-Za-z0-9_]*/],
        ["string", /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/],
        ["condition_statement", /<<[^\r\n]*?>>/],
        ["block_start", /\{/],
        ["block_end", /\}/],
        ["paren_start", /\(/],
        ["paren_end", /\)/],
        ["literal_assignment", / = /],
        ["comma", /,/],
        ["method_indicator", />/],
        ["whitespace", /\s+/],
        ["array_start", /\[/],
        ["array_end", /\]/],
    ];
    
    constructor(options) {
        options = options || {};
        this.setOutputFunction(options.out);
        this.setErrorOutputFunction(options.errout);
        this.setWarnOutputFunction(options.warnout);
        this.setSmallWarnOutputFunction(options.smallwarnout);
        this.setSmallErrorOutputFunction(options.smallerrout);
        this.setOnComplete(options.onComplete);
        this.setOnError(options.onError);

        /*
            scope: {
                name: {
                    value: ...,
                    type: "num" | "str" | "arr",
                    mutable: true | false
                }
            } 
        */
        this.variables = {
            "true": { value: 1, type: "number", mut: false, freeable: false },
            "false": { value: 0, type: "number", mut: false, freeable: false },
            "fReturn": { value: "", type: "string", mut: true, freeable: false },
            "MAX_LOOP_ITERATIONS": { value: 10000, type: "number", mut: true, freeable: false },
        };
        this.temporaryVariables = {};
        this.functions = {};
        this.debug = false;
        this.lastIfExecuted = false;
        this._interrupt = false;
        this.clockLengthMs = 0;
        this._onInterrupt = null;
        this.promptCount = 0;
        this.keyListeners = [];

        function interruptHandler(e) {
            if (e.key === "c" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                if (!this._interrupt) {
                    this.interrupt();
                }
            }
        }

    }

    cleanupKeyListeners() {
        for (const { type, handler } of this.keyListeners) {

        }
        this.keyListeners = [];
    }

    clockLength(ms){
        this.clockLengthMs = ms;
    }

    interrupt(){
        this._interrupt = true;
        this.cleanupKeyListeners();
        if (typeof this._onInterrupt === "function") {
            this._onInterrupt();
        }
    }

    checkInterrupt(){
        if(this._interrupt){
            setSetting("currentSpinner", getSetting("defaultSpinner"));
            setSetting("showSpinner", false)
            throw new FS3Error("RuntimeError", "Program interrupted by user", -1, -1);
        }
    }

    evaluateMathExpression(expression){
        expression = expression.slice(2, -2).trim();

        let scope = {};
        for(const [key, val] of Object.entries(this.variables)){
            if(val.type === "number"){
                scope[key] = val.value;
            }
        }

        try {
            let result = math.evaluate(expression, scope);
            if(typeof result === "boolean"){
                result = result ? 1 : 0;
            } else if(typeof result !== "number"){
                throw new FS3Error("MathError", `Math expression did not evaluate to a number`, -1, -1);
            }
            return result;
        } catch (e) {
            throw new FS3Error("MathError", `Error evaluating math expression: ${e.message}`, -1, -1);
        }
    }

    setOutputFunction(fn) {
        this.out = fn || console.log;
    }

    setErrorOutputFunction(fn) {
        this.errout = fn || console.error;
    }

    setWarnOutputFunction(fn) {
        this.warnout = fn || console.warn;
    }

    setSmallWarnOutputFunction(fn) {
        this.smallwarnout = fn || console.warn;
    }

    setSmallErrorOutputFunction(fn) {
        this.smallerrout = fn || console.error;
    }

    setOnComplete(fn) {
        this.onComplete = fn || function() {};
    }

    setOnError(fn) {
        this.onError = fn || function() {};
    }

    /**
     * 
     * @param {Boolean} value 
     */
    setDebug(value){
        this.debug = value;
    }

    walkMethods(node, callback) {
        // If this node is a list of arguments (array), walk each element.
        if (Array.isArray(node)) {
            for (const arg of node) {
                const err = this.walkMethods(arg, callback);
                if (err instanceof FS3Error) return err;
            }
            return null;
        }

        // Visit this node’s methods if it has any.
        if (node && node.methods && node.methods.length) {
            for (const m of node.methods) {
                // Run the callback for this method.
                const result = callback(m, node);
                if (result instanceof FS3Error) return result;

                // Walk each argument of the method recursively.
                for (const arg of m.args) {
                    const err = this.walkMethods(arg, callback);
                    if (err instanceof FS3Error) return err;
                }
            }
        }

        return null;
    }

    async executeBlock(block){
        for(let i = 0; i < block.length; i++){
            this.checkInterrupt();
            const line = block[i];


            const compacted = this.compact(line);
            const resolvedMethods = this.methodResolver(compacted);

            try {
                await this.keywordExecutor(resolvedMethods);
            } catch (e) {
                if(e instanceof SkipBlock){
                    break;
                } else throw e;
            }
        }
    }

    resolveExpressions(node) {
        if (Array.isArray(node)) {
            return node.map(n => this.resolveExpressions(n));
        }

        if (!node || typeof node !== "object") return node;

        // Recurse into method args
        if (node.methods && node.methods.length) {
            node.methods = node.methods.map(m => {
                m.args = m.args.map(arg => this.resolveExpressions(arg));
                return m;
            });
        }

        // Recurse into array elements
        if (node.type === "array" && Array.isArray(node.value)) {
            node.value = node.value.map(el => this.resolveExpressions(el));
        }

        // Recurse into blocks
        if (node.type === "block" && Array.isArray(node.body)) {
            node.body = node.body.map(line => this.resolveExpressions(line));
        }

        return node;
    }

    mergeDanglingBlocks(lines) {
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];

            // Recurse into blocks inside the line
            for (let token of line) {
                if (token.type === "block" && Array.isArray(token.body)) {
                    token.body = this.mergeDanglingBlocks(token.body);
                }
            }

            // If this line is just a block, attach it to the end of the previous line
            if (line.length === 1 && line[0].type === "block" && i > 0) {
                lines[i - 1].push(line[0]);
                lines.splice(i, 1);
                i--; // recheck this index after splice
            }
        }
        return lines;
    }

    static GetAllKeywords() {
        for(let imp in imports){
            imports[imp]();
        }
        return Object.keys(Keyword.table).join("|");
    }

    _vscode_process(code) {
        // Strip non-default methods/keywords
        for (let method in Method.table) {
            let def = Method.table[method];
            if (!def.defaultMethod) delete Method.table[method];
        }
        for (let keyword in Keyword.table) {
            let def = Keyword.table[keyword];
            if (!def.defaultKeyword) delete Keyword.table[keyword];
        }

        if (code.length === 0) {
            throw new FS3Error("SyntaxError", "No code to process", 0, 0);
        }

        let tokens = this.tokenize(code);
        let lines = tokens.map(line => [{ type: "start_of_line", value: "" }, ...line]);
        let flattened = lines.flat();
        let compressed = this.blockCompressor(flattened);

        return compressed;
    }

    _process(code, fileName = "*", fileArguments = []) {
        this.cleanupKeyListeners();
        this._interrupt = false;

        for (let method in Method.table) {
            let def = Method.table[method];
            if (!def.defaultMethod) delete Method.table[method];
        }

        for (let keyword in Keyword.table) {
            let def = Keyword.table[keyword];
            if (!def.defaultKeyword) delete Keyword.table[keyword];
        }

        this.fileName = fileName;
        this.fileArguments = fileArguments;

        if (code.length == 0) {
            throw new FS3Error("SyntaxError", "No code to process", 0, 0);
        }

        let tokens = this.tokenize(code);
        let lines = tokens.map(line => [{ type: "start_of_line", value: "" }, ...line]);
        let flattened = lines.flat();

        // Collapse array literals
        for (let i = 0; i < flattened.length; i++) {
            const token = flattened[i];
            if (token.type === "array_start") {
                let depth = 1;
                let arrayTokens = [];
                let j = i + 1;

                while (j < flattened.length && depth > 0) {
                    const t = flattened[j];
                    if (t.type === "array_start") depth++;
                    else if (t.type === "array_end") depth--;
                    if (depth > 0) arrayTokens.push(t);
                    j++;
                }

                if (depth !== 0) {
                    throw new FS3Error("SyntaxError", "Unclosed array literal", token.line, token.col, flattened);
                }

                // Split by commas at top level
                let elements = [];
                let current = [];
                let elDepth = 0;
                for (let k = 0; k < arrayTokens.length; k++) {
                    const t = arrayTokens[k];
                    if (t.type === "array_start") elDepth++;
                    if (t.type === "array_end") elDepth--;
                    if (t.type === "comma" && elDepth === 0) {
                        elements.push(current);
                        current = [];
                    } else current.push(t);
                }
                if (current.length) elements.push(current);

                elements = elements.map(el => {
                    const compacted = this.compact(el);
                    let resolved = this.methodResolver(compacted);
                    if (Array.isArray(resolved) && resolved.length === 1) resolved = resolved[0];
                    return resolved;
                });

                flattened.splice(i, j - i, {
                    type: "array",
                    value: elements,
                    line: token.line,
                    col: token.col,
                    methods: []
                });
            }
        }

        // Compress blocks
        let compressed = this.blockCompressor(flattened);

        // Variable substitution + method resolution
        for (let i = 0; i < compressed.length; i++) {
            const line = compressed[i];

            line.forEach((t, idx) => {
                if (t.type === "variable") {
                    const v = this.variables[t.value];
                    if (v) {
                        line[idx].type = v.type;
                        line[idx].value = v.value;
                    } else {
                        throw new FS3Error("ReferenceError", `Variable [${t.value}] is not defined`, t.line, t.col, line);
                    }
                }

                if (t.type === "array") {
                    t.value = t.value.map(el => {
                        if (Array.isArray(el) && el.length === 1) el = el[0];
                        if (el && el.type === "variable") {
                            const v = this.variables[el.value];
                            if (!v) {
                                throw new FS3Error("ReferenceError", `Variable [${el.value}] is not defined`, el.line, el.col, line);
                            }
                            return { ...el, type: v.type, value: v.value };
                        }
                        return el;
                    });
                }
            });

            compressed[i] = this.methodResolver(this.compact(line));
        }

        return compressed;
    }

    async interpret(code, fileName, fileArguments) {
        try {
            let parsed = this._process(code, fileName, fileArguments);

            for (let i = 0; i < parsed.length; i++) {
                await this.keywordExecutor(parsed[i]);

                if (i === parsed.length - 1) {
                    this.onComplete();
                }
            }
        } catch (e) {
            this._handleError(e);
        } finally {
            this.cleanupKeyListeners();
        }
    }

    async parse(code, fileName, fileArguments) {
        try {
            return this._process(code, fileName, fileArguments);
        } catch (e) {
            this._handleError(e);
            return null;
        } finally {
            this.cleanupKeyListeners();
        }
    }

    _handleError(e) {
        if (e instanceof FS3Error) {
            this.cleanupKeyListeners();
            if (e.type === "quietKill") {
                this.onError(e);
                return;
            }
            this.errout(e);
        } else if (
            !(e instanceof SkipBlock ||
            e instanceof BreakLoop ||
            e instanceof ExitFunction ||
            e instanceof ContinueLoop)
        ) {
            this.cleanupKeyListeners();
            this.errout(new FS3Error("InternalJavaScriptError", `Internal JavaScript error: ${e.message}`, -1, -1));
            throw e;
        }
        this.onError(e);
    }

    async keywordExecutor(line) {
        try {
            // Resolve variables
            this.checkInterrupt();
            if(this.clockLengthMs != 0) await new Promise(resolve => setTimeout(resolve, this.clockLengthMs));
            let keyword = line[0]?.type === "keyword" ? line[0].value : null;
            if (!keyword) return;
            
            let executedMethodTokens = this.executeMethods(line)

            const lineArgs = executedMethodTokens.slice(1);

            const keywordDef = Keyword.get(keyword);

            if (!keywordDef) {
                throw new FS3Error(
                    "ReferenceError",
                    `Unknown keyword [${keyword}]`,
                    line[0].line,
                    line[0].col,
                    line
                );
            }

            // Validate arguments
            if (keywordDef.scheme) {
                for (let i = 0; i < keywordDef.scheme.length; i++) {
                    const expected = keywordDef.scheme[i].split("|");
                    const actual = lineArgs[i];
                    const expectedOptional = expected.some(e => e.endsWith("?"));

                    if (!actual) {
                        if (!expectedOptional) {
                            throw new FS3Error(
                                "ArgumentError",
                                `Expected arg [${i + 1}] for keyword [${keyword}] to be of type [${expected.map(e => e.replace("?", "")).join(" or ")}], but found none`,
                                line[0].line,
                                line[0].col,
                                line
                            );
                        }
                        continue;
                    }

                    if (!expected.includes(actual.type) && !expected.includes("any")) {
                        throw new FS3Error(
                            "TypeError",
                            `Invalid type for arg [${i + 1}] for keyword [${keyword}]: expected [${expected.map(e => e.replace("?", "")).join(" or ")}], got [${actual.type}]`,
                            actual.line,
                            actual.col,
                            line
                        );
                    }
                }
            }


            await keywordDef.fn(lineArgs, this, line);
        } catch (e) {
            throw e;
        }
    }

    blockCompressor(flattened) {
        function compressBlocks(tokens) {
            const result = [];
            const stack = [];
            let currentLine = [];

            const pushLine = (arr, line) => {
                if (line.length) arr.push(line);
            };

            for (let i = 0; i < tokens.length; i++) {
                const t = tokens[i];

                if (t.type === "start_of_line") {
                    // Start a new line: push previous line to the appropriate array
                    if (stack.length) {
                        pushLine(stack[stack.length - 1].body, currentLine);
                    } else {
                        pushLine(result, currentLine);
                    }
                    currentLine = [];
                    continue;
                }

                if (t.type === "block_start") {
                    // Push current line (may contain tokens before the block)
                    pushLine(stack.length ? stack[stack.length - 1].body : result, currentLine);
                    currentLine = [];
                    // Begin a new block
                    stack.push({ start: t, body: [] });
                } else if (t.type === "block_end") {
                    // End of block
                    if (!stack.length) {
                        throw new FS3Error("SyntaxError", "Unmatched closing bracket for block", t.line, t.col, t);
                    }
                    // Push any remaining tokens on this line before closing block
                    pushLine(stack[stack.length - 1].body, currentLine);
                    currentLine = [];

                    const finished = stack.pop();
                    const block = {
                        type: "block",
                        value: "{}",
                        line: finished.start.line,
                        col: finished.start.col,
                        methods: finished.start.methods || [],
                        body: finished.body // already grouped by lines
                    };

                    if (stack.length) {
                        // Inside another block: treat as a token in its own line
                        stack[stack.length - 1].body.push([block]);
                    } else {
                        result.push([block]);
                    }
                } else {
                    // Normal token: add to current line
                    currentLine.push(t);
                }
            }

            // Push any trailing line after finishing tokens
            if (stack.length) {
                const u = stack.pop().start;
                throw new FS3Error("SyntaxError", "Unmatched opening bracket for block", u.line, u.col, u);
            }
            pushLine(result, currentLine);

            return result;
        }

        // Recursive merge pass
        function mergeDanglingBlocks(lines) {
            if (!Array.isArray(lines)) return lines;

            for (let i = 0; i < lines.length;) {
                const line = lines[i];

                // Recurse into block bodies first
                for (let t = 0; t < line.length; t++) {
                    const tok = line[t];
                    if (tok && tok.type === "block" && Array.isArray(tok.body)) {
                        tok.body = mergeDanglingBlocks(tok.body);
                    }
                }

                // If line is exactly [block], merge with previous line
                if (line.length === 1 && line[0] && line[0].type === "block" && i > 0) {
                    let prevIndex = i - 1;
                    // walk back to find a non-empty line
                    while (prevIndex >= 0 && (!Array.isArray(lines[prevIndex]) || lines[prevIndex].length === 0)) {
                        prevIndex--;
                    }
                    if (prevIndex >= 0) {
                        lines[prevIndex].push(line[0]); // attach block
                        lines.splice(i, 1);             // remove dangling
                        continue; // recheck same index
                    }
                }

                i++;
            }

            return lines;
        }

        let tokens = compressBlocks(flattened);
        tokens = mergeDanglingBlocks(tokens);
        return tokens;
    }

    executeMethods(line) {
        // Ensure we always work on an array of tokens
        const tokens = Array.isArray(line) ? line : [line];

        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];

            // --- Variable resolution ---
            if (token.type === "variable") {
                const variable = this.variables[token.value];
                if (!variable) {
                    throw new FS3Error(
                        "ReferenceError",
                        `Variable [${token.value}] is not defined`,
                        token.line,
                        token.col,
                        line
                    );
                }
                token.type = variable.type;
                token.value = variable.value;
            }

            // --- Recursively process arrays ---
            if (token.type === "array" && Array.isArray(token.value)) {
                token.value = token.value.map(el => {
                    let resolved = this.executeMethods(el);

                    // unwrap single-element arrays
                    if (Array.isArray(resolved) && resolved.length === 1) {
                        resolved = resolved[0];
                    }

                    // ⚡ NEW: if element still has methods, execute them too
                    if (resolved && resolved.methods && resolved.methods.length > 0) {
                        let executed = this.executeMethods([resolved]);
                        if (Array.isArray(executed) && executed.length === 1) {
                            resolved = executed[0];
                        } else {
                            resolved = executed;
                        }
                    }

                    return resolved;
                });
            }

            // --- Execute attached methods on this token ---
            if (token.methods && token.methods.length > 0) {
                let methodIndex = 0;
                for (const method of token.methods) {
                    const def = Method.get(method.name);
                    if (!def) {
                        throw new FS3Error(
                            "ReferenceError",
                            `Unknown method [${method.name}] for type [${token.type}]`,
                            method.line,
                            method.col,
                            line
                        );
                    }

                    // Resolve args recursively
                    method.args = method.args.map(arg => this.executeMethods(arg));

                    // unwrap method args
                    method.args = method.args.map(arg => {
                        if (Array.isArray(arg) && arg.length === 1) return arg[0];
                        return arg;
                    });

                    // Validate args
                    if (def.args) {
                        for (let idx = 0; idx < def.args.length; idx++) {
                            const expected = def.args[idx];
                            let actual = method.args[idx];

                            // optional missing argument
                            if (!actual) {
                                if (!expected.optional) {
                                    throw new FS3Error(
                                        "ArgumentError",
                                        `Expected argument [${idx + 1}] for method [${method.name}] of type [${expected.type.join(" or ")}], but found none`,
                                        method.line,
                                        method.col,
                                        method
                                    );
                                }
                                continue;
                            }

                            // math/condition tokens → evaluate

                            if (!expected.type.includes(actual.type) && !expected.type.includes("any")) {
                                // doesnt get caught
                                throw new FS3Error(
                                    "TypeError",
                                    `Invalid type for argument [${idx + 1}] for method [${method.name}]: expected [${expected.type.join(" or ")}], got [${actual.type}]`,
                                    actual.line ?? method.line,
                                    actual.col ?? method.col,
                                    method
                                );
                            }
                        }
                    }

                    // Validate parent type
                    if (def.parentTypes && !def.parentTypes.includes(token.type)) {
                        throw new FS3Error(
                            "TypeError",
                            `Invalid parent type for method [${method.name}]: expected [${def.parentTypes.join(" or ")}], got [${token.type}]`,
                            token.line,
                            token.col,
                            method
                        );
                    }

                    // Execute method
                    try {
                        const result = def.fn(token, method.args, this);
                        if (result) {
                            token.type = result.type;
                            token.value = result.value;
                        }
                    } catch (e) {
                        if (e instanceof FS3Error) {
                            e.message = `In method [${method.name}]: ${e.message}`;
                            throw e;
                        } else {
                            throw new FS3Error(
                                "InternalJavaScriptError",
                                `Error executing method [${method.name}]: ${e.message}`,
                                method.line,
                                method.col,
                                method
                            );
                        }
                    }
                
                    methodIndex++;
                }
            }

            tokens[i] = token;

            tokens[i].methods = [];
        }

        return tokens;
    }

    methodResolver(compacted) {
        const resolveLine = (lineTokens) => {
            // Ensure lineTokens is always an array
            const tokensArray = Array.isArray(lineTokens) ? lineTokens : [lineTokens];

            this.walkMethods(tokensArray, (method, parent) => {
                const def = Method.get(method.name);
                if (!def) {
                    throw new FS3Error(
                        "ReferenceError",
                        `Unknown method [${method.name}] for type [${parent.type}]`,
                        parent.line, parent.col, method
                    );
                }

                // Recursively resolve methods inside arguments first
                method.args = method.args.map(argLine => {
                    const resolved = this.methodResolver(argLine);
                    // If resolved is an array of length 1, unwrap it
                    if (Array.isArray(resolved) && resolved.length === 1) return resolved[0];
                    return resolved;
                });
            });

            // Recursively resolve methods inside blocks
            tokensArray.forEach((t) => {
                if (t.type === "block" && Array.isArray(t.body)) {
                    t.body = t.body.map(innerLine => this.methodResolver(innerLine));
                }
            });

            return tokensArray;
        };

        // Handle single line vs multiple lines
        if (!Array.isArray(compacted[0]) || (compacted[0] && !Array.isArray(compacted[0][0]))) {
            return resolveLine(compacted);
        } else {
            return compacted.map(lineTokens => resolveLine(lineTokens));
        }
    }


    compact(lineTokens) {
        // Helper to parse arguments inside parentheses
        const parseArgs = (tokens, startIndex) => {
            let args = [];
            let currentArg = [];
            let depth = 0;
            let i = startIndex;

            for (; i < tokens.length; i++) {
                const t = tokens[i];
                if (t.type === "paren_start") {
                    depth++;
                    if (depth > 1) currentArg.push(t);
                } else if (t.type === "paren_end") {
                    if (depth === 0) {
                        return [args, i]; // unmatched )
                    }
                    depth--;
                    if (depth === 0) {
                        if (currentArg.length) {
                            const parsed = this.compact(currentArg);
                            args.push(parsed);
                            currentArg = [];
                        }
                        return [args, i];
                    } else {
                        currentArg.push(t);
                    }
                } else if (t.type === "comma" && depth === 1) {
                    if (!currentArg.length) {
                        return new FS3Error("SyntaxError", "Empty argument in method call", t.line, t.col, t);
                    }
                    const parsed = this.compact(currentArg);
                    args.push(parsed);
                    currentArg = [];
                } else {
                    currentArg.push(t);
                }
            }

            throw new FS3Error("SyntaxError", "Unclosed parenthesis in method call", tokens[startIndex - 1].line, tokens[startIndex - 1].col, tokens[startIndex - 1]);
        };

        const attachMethod = (parent, methodToken, args = []) => {
            parent.methods.push({
                name: methodToken.value,
                args: args,
                line: methodToken.line,
                col: methodToken.col
            });
        };

        let result = [];
        let i = 0;

        while (i < lineTokens.length) {
            const token = lineTokens[i];

            if (!token) { i++; continue; }

            // Detect parent: first non-method token in chain
            if (!["method_indicator", "method", "paren_start", "paren_end", "comma"].includes(token.type)) {
                // Copy line and col
                result.push({
                    ...token,
                    methods: [],
                    line: token.line,
                    col: token.col
                });
                i++;

                while (i < lineTokens.length) {
                    const t = lineTokens[i];

                    if (t.type === "method_indicator") {
                        const next = lineTokens[i + 1];
                        if (!next || next.type !== "method") {
                            throw new FS3Error("SyntaxError", "method_indicator has no following method", t.line, t.col);
                        }
                        const methodTok = next;
                        i += 2;

                        let args = [];
                        if (i < lineTokens.length && lineTokens[i].type === "paren_start") {
                            const [parsedArgs, endIndex] = parseArgs(lineTokens, i);
                            if (parsedArgs instanceof FS3Error) return parsedArgs;
                            args = parsedArgs;
                            i = endIndex + 1;
                        }

                        attachMethod(result[result.length - 1], methodTok, args);
                    } else if (t.type === "comma" || t.type === "paren_end") {
                        break;
                    } else {
                        break;
                    }
                }
            } else {
                throw new FS3Error("SyntaxError", `Unexpected token [${token.value}]`, token.line, token.col);
            }
        }

        return result.length === 1 ? result[0] : result;
    }

    tokenize(lines) {
        const tokens = [];

        lines.forEach((line, lineNo) => {
            let pos = 0;
            const lineTokens = [];

            while (pos < line.length) {
                let matched = false;

                for (const [type, base] of FroggyScript3.matches) {
                    const regex = new RegExp(base.source, 'y'); // sticky
                    regex.lastIndex = pos;
                    const m = regex.exec(line);

                    if (m) {
                        matched = true;
                        const value = m[0];
                        // skip whitespace tokens by default
                        if (type !== "whitespace") {
                            lineTokens.push({
                                type,
                                value,
                                line: lineNo,
                                col: pos,
                                methods: []
                            });
                        }
                        pos += value.length;
                        break;
                    }
                }

                if (!matched) {
                    throw new FS3Error("TokenizationError", `Unrecognized token [${line[pos]}]`, lineNo, pos, tokens);
                }
            }

            tokens.push(lineTokens);
        });

        for(let lineNo = 0; lineNo < tokens.length; lineNo++){
            let _tokens = tokens[lineNo];
            if(_tokens instanceof FS3Error) break;

            // if _tokens is the type of FS3Error or FS3Warn
            if(_tokens instanceof FS3Warn) {
                this.warnout(_tokens);
            }

            // if the first token is a type variable, change it to type keyword
            if(_tokens[0] && _tokens[0].type === "variable"){
                _tokens[0].type = "keyword"; 
            }


            _tokens.forEach((token, i) => {
                let prev = _tokens[i-1];
                let current = _tokens[i];
                let next = _tokens[i+1];

                if(prev && prev.type == "method_indicator" && current.type == "variable"){
                    tokens[lineNo][i].type = "method"
                }
            })
        }

        // filter out FS3Warn tokens
        tokens.forEach((t, i) => {
            if(t instanceof FS3Warn){
                tokens.splice(i, 1);
            }
        }); 


        // strip quotes, and turn number strings into actual numbers
        for(let i = 0; i < tokens.length; i++){
            for(let j = 0; j < tokens[i].length; j++){
                let token = tokens[i][j];
                if(token.type === "string"){
                    // strip quotes and unescape
                    const quoteType = token.value[0];
                    token.value = token.value.slice(1, -1).replace(/\\(.)/g, "$1");
                    tokens[i][j] = token;
                }
                else if(token.type === "number"){
                    token.value = parseFloat(token.value);
                    tokens[i][j] = token;
                }
            }
        }

        for(let i = 0; i < tokens.length; i++){
            for(let j = 0; j < tokens[i].length; j++){
                let token = tokens[i][j];

                if(token.type === "variable" && tokens[i][j-1]?.type === "keyword" && tokens[i][j-1]?.value === "var"){
                    tokens[i][j].type = "variable_reference";
                }
            }
        }

        return tokens;
    }
}

module.exports = { FroggyScript3, Keyword, Method, FS3Error, imports };