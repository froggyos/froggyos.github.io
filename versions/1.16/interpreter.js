class FS3Error {
    constructor(type, message, token){
        this.type = type;
        this.message = message;
        this.line = token.line;
        this.col = token.col;
        this.errTokens = token;
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
        if (interp.variables["math"]) {
            throw new FS3Error("ReferenceError", `Variable [math] is already defined`, {line: -1, col: -1, value: "" });
        }

        interp.variables["math"] = {
            value: "Math Module",
            type: "module_math",
            mut: false,
            freeable: false
        }


        new Method("random", ["module_math"], [{type: ["number"], optional: false}, {type: ["number"], optional: false}], (parent, args, interpreter) => {
            let min = args[0].value;
            let max = args[1].value;
            if(min >= max){
                throw new FS3Error("RangeError", `math>random() min [${min}] must be less than max [${max}]`, args[0]);
            }
            let rand = Math.floor(Math.random() * (max - min)) + min;
            return {
                type: "number",
                value: rand,
                line: parent.line,
                col: parent.col,
                methods: []
            }
        }, false);
    },
    keyboard: (interp) => {
        new Keyword("anykeydown", ["block"], (args, interpreter) => {
            let block = args[0].body;
            async function handler(e) {
                interpreter.variables["__key__"] = { value: "", type: "string", mut: true, freeable: false };
                interpreter.variables["__key__"].value = e.key;
                try {
                    await interpreter.executeBlock(block);
                } catch (e) {
                    if (
                        e instanceof SkipBlock ||
                        e instanceof BreakLoop ||
                        e instanceof ExitFunction ||
                        e instanceof ContinueLoop
                    ) {
                        // ignore loop/function flow controls
                    } else {
                        interpreter.errout(e);
                    }
                }
                delete interpreter.variables["__key__"];
            }
            document.body.addEventListener("keydown", handler);
            interpreter.keyListeners.push({ type: "keydown", handler });
        }, false);

        new Keyword("keydown", ["string", "block"], (args, interpreter) => {
            let key = args[0].value.toLowerCase();
            let block = args[1].body;

            async function handler(e) {
                if (e.key.toLowerCase() === key) {
                    try {
                        await interpreter.executeBlock(block);
                    } catch (e) {
                        if (
                            e instanceof SkipBlock ||
                            e instanceof BreakLoop ||
                            e instanceof ExitFunction ||
                            e instanceof ContinueLoop
                        ) {
                            // ignore loop/function flow controls
                        } else {
                            interpreter.errout(e);
                        }
                    }
                }
            }

            document.body.addEventListener("keydown", handler);
            interpreter.keyListeners.push({ type: "keydown", handler });
        }, false);

        new Keyword("keyup", ["string", "block"], (args, interpreter) => {
            let key = args[0].value.toLowerCase();
            let block = args[1].body;

            async function handler(e) {
                if (e.key.toLowerCase() === key) {
                    try {
                        await interpreter.executeBlock(block);
                    } catch (e) {
                        if (
                            e instanceof SkipBlock ||
                            e instanceof BreakLoop ||
                            e instanceof ExitFunction ||
                            e instanceof ContinueLoop
                        ) {
                            // ignore loop/function flow controls
                        } else {
                            interpreter.errout(e);
                        }
                    }
                }
            }
            document.body.addEventListener("keyup", handler);
            interpreter.keyListeners.push({ type: "keyup", handler });
        }, false);
    }
}

// {type: ['number'], optional: false}
new Method("splice", ["array"], [{type: ['number'], optional: false}, {type: ['number'], optional: true}], (parent, args, interpreter) => {
    let start = args[0].value;
    let deleteCount = args[1] ? args[1].value : parent.value.length - start;
    if(start < 0 || start >= parent.value.length){
        throw new FS3Error("RangeError", `Start index [${start}] is out of bounds for array of length [${parent.value.length}]`, args[0]);
    }
    if(deleteCount < 0){
        throw new FS3Error("RangeError", `Delete count [${deleteCount}] cannot be negative`, args[1] || args[0]);
    }
    let array = structuredClone(parent.value);
    array.splice(start, deleteCount);
    parent.value = array;
    return parent;
});

new Method("shift", ["array"], [], (parent, args, interpreter) => {
    if(parent.value.length === 0){
        throw new FS3Error("RangeError", `Cannot shift from an empty array`, parent);
    }
    let array = structuredClone(parent.value);

    array.shift()

    parent.value = array;

    return parent;
});


new Method('replaceAt', ['string', 'array'], [{type: ['number'], optional: false}, {type: ['string'], optional: false}], (parent, args, interpreter) => {
    if(parent.type === "array"){
        let index = args[0].value;
        let replacement = args[1];
        if(index < 0 || index >= parent.value.length){
            throw new FS3Error("RangeError", `Index [${index}] is out of bounds for array of length [${parent.value.length}]`, args[0]);
        }
        parent.value[index] = replacement;
        return parent;
    } else {
        let index = args[0].value;
        let replacement = args[1].value;
        if(index < 0 || index >= parent.value.length){
            throw new FS3Error("RangeError", `Index [${index}] is out of bounds for string of length [${parent.value.length}]`, args[0]);
        }
        parent.value = parent.value.substring(0, index) + replacement + parent.value.substring(index + 1);
        return parent;
    }
});



new Method('last', ['array'], [], (parent, args, interpreter) => {
    if(parent.value.length === 0){
        throw new FS3Error("RangeError", `Cannot get last element of an empty array`, parent);
    }
    return parent.value[parent.value.length - 1];
});


new Method('first', ['array'], [], (parent, args, interpreter) => {
    if(parent.value.length === 0){
        throw new FS3Error("RangeError", `Cannot get first element of an empty array`, parent);
    }
    return parent.value[0];
});


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
        value: `:${parentValue === argValue ? 1 : 0}:`,
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
        value: `:${parentValue !== argValue ? 1 : 0}:`,
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
        throw new FS3Error("MathError", "Division by zero is not permitted", args[0]);
    }
    parent.value = parent.value / args[0].value;
    return parent;
});

new Method("mod", ["number"], [{type: ["number"], optional: false}], (parent, args, interpreter) => {
    if(args[0].value === 0){
        throw new FS3Error("MathError", "Modulo by zero is not permitted", args[0]);
    }
    parent.value = parent.value % args[0].value;
    return parent;
});

new Method("index", ["array", "string"], [{type: ["number"], optional: false}], (parent, args, interpreter) => {
    if(parent.type === "array"){
        let index = args[0].value;
        if(index < 0 || index >= parent.value.length){
            throw new FS3Error("RangeError", `Index [${index}] is out of bounds for array of length [${parent.value.length}]`, args[0]);
        }

        return parent.value[index]
    } else {
        let str = parent.value;
        let index = args[0].value;
        if(index < 0 || index >= str.length){
            throw new FS3Error("RangeError", `Index [${index}] is out of bounds for string of length [${str.length}]`, args[0]);
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
        if(Array.isArray(el)) throw new FS3Error("TypeError", "Nested arrays are not supported in join()", el[0]);
        return String(el.value);
    }).join(separator);
    parent.type = "string";
    return parent;
});

new Method("not", ["condition_statement"], [], (parent, args, interpreter) => {
    let condValue = parent.value;
    condValue = interpreter.evaluateMathExpression(condValue);
    parent.value = `:${condValue === 1 ? 0 : 1}:`;
    return parent;
});

new Method("toNumber", ["string", "condition_statement"], [], (parent, args, interpreter) => {
    if(parent.type == "string"){
        let num = Number(parent.value);
        if(isNaN(num)){
            num = 0;
        }

        parent.value = num;
        parent.type = "number";
        return parent;
    } else {
        let num = interpreter.evaluateMathExpression(parent.value);
        parent.value = num;
        parent.type = "number";
        return parent;
    }
});

new Method("n", ["string", "condition_statement"], [], (parent, args, interpreter) => {
    if(parent.type == "string"){
        let num = Number(parent.value);
        if(isNaN(num)){
            num = 0;
        }

        parent.value = num;
        parent.type = "number";
        return parent;
    } else {
        let num = interpreter.evaluateMathExpression(parent.value);
        parent.value = num;
        parent.type = "number";
        return parent;
    }
});

new Method("toString", ["number", "condition_statement"], [], (parent, args, interpreter) => {
    if(parent.type == "number"){
        parent.value = String(parent.value);
        parent.type = "string";
        return parent;
    } else {
        parent.value = String(interpreter.evaluateMathExpression(parent.value));
        parent.type = "string";
        return parent;
    }
});

new Method("s", ["number"], [], (parent, args, interpreter) => {
    if(parent.type == "number"){
        parent.value = String(parent.value);
        parent.type = "string";
        return parent;
    } else {
        parent.value = String(interpreter.evaluateMathExpression(parent.value));
        parent.type = "string";
        return parent;
    }
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
        throw new FS3Error("RangeError", `Cannot repeat a string a negative number of times`, args[0]);
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

new Method("startsWith", ["string"], [{type: ["string"], optional: false}], (parent, args, interpreter) => {
    let parentValue = parent.value;
    let argValue = args[0].value;
    return {
        type: "condition_statement",
        value: `:${parentValue.startsWith(argValue) ? 1 : 0}:`,
        line: parent.line,
        col: parent.col,
        methods: parent.methods
    }
});

new Method("endsWith", ["string"], [{type: ["string"], optional: false}], (parent, args, interpreter) => {
    let parentValue = parent.value;
    let argValue = args[0].value;
    return {
        type: "condition_statement",
        value: `:${parentValue.endsWith(argValue) ? 1 : 0}:`,
        line: parent.line,
        col: parent.col,
        methods: parent.methods
    }
});


new Keyword("clearterminal", [], (args, interpreter) => {
    document.getElementById('terminal').innerHTML = "";
});

new Keyword("import", ["string"], (args, interpreter) => {
    let moduleName = args[0].value;
    if(!imports[moduleName]){
        throw new FS3Error("ReferenceError", `Import [${moduleName}] does not exist`, args[0]);
    }
    imports[moduleName](interpreter);
});

// new Keyword("do", [], (args, interpreter, line) => {
//     console.log(line)
// });

new Keyword("skip", [], (args, interpreter, line) => {
    throw new SkipBlock(line[0].line, line[0].col);
});

new Keyword("break", [], (args, interpreter, line) => {
    throw new BreakLoop(line[0].line, line[0].col);
});

new Keyword("exit", [], (args, interpreter, line) => {
    throw new ExitFunction(line[0].line, line[0].col);
});

new Keyword("continue", [], (args, interpreter, line) => {
    throw new ContinueLoop(line[0].line, line[0].col);
});

new Keyword("arrset", ["variable_reference", "number", "literal_assignment", "string|number|array"], (args, interpreter) => {
    let variableName = args[0].value.slice(1);
    let index = args[1].value;
    let newValue = args[3];

    if(!interpreter.variables[variableName]){
        throw new FS3Error("ReferenceError", `Variable [${variableName}] is not defined`, args[0]);
    }

    if(!interpreter.variables[variableName].mut){
        throw new FS3Error("AccessError", `Variable [${variableName}] is immutable and cannot be changed`, args[0]);
    }

    if(interpreter.variables[variableName].type !== "array"){
        throw new FS3Error("TypeError", `Variable [${variableName}] must be of type [array] to use [arrset] keyword`, args[0]);
    }

    if(index < 0 || index >= interpreter.variables[variableName].value.length){
        throw new FS3Error("RangeError", `Index [${index}] is out of bounds for array of length [${interpreter.variables[variableName].value.length}]`, args[1]);
    }

    interpreter.variables[variableName].value[index] = {
        type: newValue.type,
        value: newValue.value,
        line: interpreter.variables[variableName].value[index].line,
        col: interpreter.variables[variableName].value[index].col,
        methods: []
    }
});

new Keyword("foreach", ["variable_reference", "block"], async (args, interpreter) => {
    let targetArrayName = args[0].value.slice(1);

    let block = args[1].body;

    interpreter.variables["__item__"] = { value: "", type: "string", mut: true, freeable: false };
    interpreter.variables["__index__"] = { value: 0, type: "number", mut: true, freeable: false };

    if(!interpreter.variables[targetArrayName]){
        throw new FS3Error("ReferenceError", `Variable [${targetArrayName}] is not defined`, args[2]);
    }

    if(interpreter.variables[targetArrayName].type !== "array"){
        throw new FS3Error("TypeError", `Variable [${targetArrayName}] must be of type [array] to be used in [foreach]`, args[2]);
    }

    let array = interpreter.variables[targetArrayName].value;

    for(let i = 0; i < array.length; i++){
        interpreter.checkInterrupt();

        let el = array[i];

        interpreter.variables["__index__"].value = i;
        interpreter.variables["__index__"].type = "number";
        interpreter.variables["__item__"].value = el.value;
        interpreter.variables["__item__"].type = el.type;

        try {
            await interpreter.executeBlock(block);
        } catch (e) {
            if(e instanceof ContinueLoop){
                continue;
            } else if(e instanceof BreakLoop){
                break;
            } else throw e;
        }
        

        interpreter.variables[targetArrayName].value[i].value = interpreter.variables["__item__"].value;
        interpreter.variables[targetArrayName].value[i].type = interpreter.variables["__index__"].type;
    }

    delete interpreter.variables["__item__"];
    delete interpreter.variables["__index__"];
});

new Keyword("filearg", ["variable_reference", "number"], (args, interpreter) => {
    let variableName = args[0].value.slice(1);
    let argIndex = args[1].value;
    let argValue = interpreter.fileArguments[argIndex];

    if(argValue === undefined){
        throw new FS3Error("RuntimeError", `No command line argument found at index [${argIndex}]`, args[1]);
    }

    if(!interpreter.variables[variableName]){
        throw new FS3Error("ReferenceError", `Variable [${variableName}] is not defined`, args[0]);
    }

    if(!interpreter.variables[variableName].mut){
        throw new FS3Error("AccessError", `Variable [${variableName}] is immutable and cannot be changed`, args[0]);
    }

    if(interpreter.variables[variableName].type !== "string"){
        throw new FS3Error("TypeError", `Variable [${variableName}] must be of type [string] to store command line argument`, args[0]);
    }

    argValue = argValue.replaceAll("\\_", " ");

    interpreter.variables[variableName].value = argValue;
});

new Keyword("set", ["variable_reference|object_reference", "literal_assignment", "string|number|array|object_reference"], (args, interpreter) => {
    if(args[0].type == "variable_reference"){
        let variableName = args[0].value.slice(1);
        let variableValue = args[2].value;

        if(!interpreter.variables[variableName]){
            throw new FS3Error("ReferenceError", `Variable [${variableName}] is not defined`, args[0]);
        } 

        if(interpreter.variables[variableName].type !== args[2].type){
            throw new FS3Error("TypeError", `Cannot set variable [${variableName}] of type [${interpreter.variables[variableName].type}] to value of type [${args[2].type}]`, args[0]);
        }

        if(!interpreter.variables[variableName].mut){
            throw new FS3Error("AccessError", `Variable [${variableName}] is immutable and cannot be changed`, args[0]);
        }
        
        interpreter.variables[variableName].value = variableValue;
    } else {
        let variableName = args[0].objectReference[0];
        
        if(!interpreter.variables[variableName]){
            throw new FS3Error("ReferenceError", `Variable [${variableName}] is not defined`, args[0]);
        }

        if(!interpreter.variables[variableName].mut){
            throw new FS3Error("AccessError", `Variable [${variableName}] is immutable and cannot be changed`, args[0]);
        }

        if(interpreter.variables[variableName].type !== "object"){
            throw new FS3Error("TypeError", `Variable [${variableName}] must be of type [object] to use object reference assignment`, args[0]);
        }

        let obj = interpreter.variables[variableName].value;

        let current = obj;

        for(let i = 1; i < args[0].objectReference.length; i++){
            let prop = args[0].objectReference[i];
            if(i == args[0].objectReference.length - 1){
                if(current[prop] === undefined){
                    throw new FS3Error("ReferenceError", `Property [${prop}] does not exist on object [${variableName}]`, args[0]);
                }
                current[prop] = {
                    type: args[2].originalType ?? args[2].type,
                    value: args[2].value,
                    line: current[prop].line,
                    col: current[prop].col,
                    methods: []
                };
            } else {
                if(current[prop] === undefined){
                    throw new FS3Error("ReferenceError", `Property [${prop}] does not exist on object [${variableName}]`, args[0]);
                }
                current = current[prop].value;
            }
        }
    }
});

// ["string", "string|number", "any?"]
new Keyword("out", ["string|number"], (args, interpreter) => {
    interpreter.out(args[0]);
});

new Keyword("warn", ["string"], (args, interpreter) => {
    interpreter.smallwarnout(args[0].value);
});

new Keyword("error", ["string"], (args, interpreter) => {
    interpreter.smallerrout(args[0].value);
});

new Keyword("longwarn", ["string", "string"], (args, interpreter) => {
    let warningName = args[0].value;
    let warningMessage = args[1].value;
    interpreter.warnout(new FS3Warn(warningName, warningMessage, args[0].line, args[0].col));
});

new Keyword("longerr", ["string", "string"], (args, interpreter) => {
    let errorName = args[0].value; 
    let errorMessage = args[1].value;
    interpreter.errout(new FS3Error(errorName, errorMessage, args[1].line, args[1].col, args[1]));
});

new Keyword("kill", [], (args, interpreter, line) => {
    throw new FS3Error("RuntimeError", "Program terminated with [kill] keyword", line[0].line, line[0].col, args);
});

new Keyword("quietkill", [], (args, interpreter) => {
    throw new FS3Error("quietKill", "", -1, -1, args);
});

new Keyword("func", ["function_reference", "block"], (args, interpreter) => {
    let functionName = args[0].value;
    let functionBody = args[1].body;

    if(interpreter.functions[functionName]){
        throw new FS3Error("ReferenceError", `Function [${functionName}] is already defined`, args[0]);
    }
    interpreter.functions[functionName] = functionBody;
})

new Keyword("pfunc", ["function_reference", "array", "block"], (args, interpreter) => {
    let functionName = args[0].value;
    let functionParams = args[1].value.flat();
    let functionBody = args[2].body;

    let params = [];

    functionParams.forEach(p => {
        if(p.type != "string"){
            throw new FS3Error("TypeError", `Parameter declaration [${p.value}] in function [${functionName}] must be a string`, p);
        }

        let value = p.value.split(":")[0];
        let type = p.value.split(":")[1];

        if(type == "S") type = "string";
        else if(type == "N") type = "number";
        else if(type == "A") type = "array";
        else if(type == "" || type == undefined){
            throw new FS3Error("SyntaxError", `Parameter [${value}] in function [${functionName}] is missing a type declaration. Must be S (string), N (number), or A (array)`, p);
        } else {
            throw new FS3Error("TypeError", `Invalid parameter type [${type}] for parameter [${value}] in function [${functionName}]. Must be S (string), N (number), or A (array)`, p);
        }

        params.push({value, type});
    });


    if(interpreter.functions[functionName]){
        throw new FS3Error("ReferenceError", `Function [${functionName}] is already defined`, args[0]);
    }

    interpreter.functions[functionName] = {
        body: functionBody,
        params: params.flat()
    };
});

new Keyword("pcall", ["function_reference", "array"], async (args, interpreter) => {
    let functionName = args[0].value;
    let functionArgs = args[1].value;
    
    if(!interpreter.functions[functionName]){
        throw new FS3Error("ReferenceError", `Function [${functionName}] is not defined`, args[0]);
    }

    if(!interpreter.functions[functionName].body){
        throw new FS3Error("AccessError", `Function [${functionName}] is not a parameterized function and must be called with the [call] keyword`, args[0]);
    }

    let expectedFunctionArgs = interpreter.functions[functionName].params;
    let functionBody = interpreter.functions[functionName].body;

    expectedFunctionArgs.forEach((param, idx) => {
        let arg = functionArgs[idx];
        if(!arg){
            throw new FS3Error("ArgumentError", `Missing argument [${param.value}] of type [${param.type}] for function [${functionName}]`, args[0]);
        }
        if(arg.type !== param.type){
            throw new FS3Error("TypeError", `Invalid type for argument [${param.value}] in function [${functionName}]: expected [${param.type}], got [${arg.type}]`, arg.line, arg.col, args);
        }
        // create a temporary variable for this arg
        if(interpreter.variables[param.value]){
            throw new FS3Error("ReferenceError", `Cannot use parameter name [${param.value}] for function [${functionName}] because a variable with that name already exists`, arg.line, arg.col, args);
        }
        interpreter.variables[param.value] = {
            value: arg.value,
            type: arg.type,
            mut: false,
            freeable: false
        }
    });

    try {
        await interpreter.executeBlock(functionBody)
        // for each parameter, delete the temporary variable
        expectedFunctionArgs.forEach(param => {
            if(interpreter.variables[param.value] && !interpreter.variables[param.value].freeable){
                delete interpreter.variables[param.value];
            }
        });
    } catch (e) {
        if(e instanceof ExitFunction) return;
        else throw e;
    }
    
});

new Keyword("wait", ["number"], async (args, interpreter) => {
    let duration = args[0].value;

    if(duration < 0){
        throw new FS3Error("RangeError", `Cannot wait for a negative duration`, args[0]);
    }
    await new Promise((resolve, reject) => {
        // Start the timer
        const id = setTimeout(() => {
            // When timer finishes, check for interrupt
            if (interpreter.interrupted) {
                reject(new FS3Error("RuntimeError", "Program interrupted by user", {line: -1, col: -1, value: "" }));
            } else {
                resolve();
            }
        }, duration);

        // If user interrupts DURING the wait, clear the timeout and reject immediately
        const interruptCheck = () => {
            clearTimeout(id);
            reject(new FS3Error("RuntimeError", "Program interrupted by user", {line: -1, col: -1, value: "" }));
        };

        // Register a hook
        interpreter._onInterrupt = interruptCheck;
    }).finally(() => {
        // Cleanup hook so future waits aren't affected
        if (interpreter._onInterrupt) {
            interpreter._onInterrupt = null;
        }
    });
});

new Keyword("call", ["function_reference"], async (args, interpreter) => {
    let functionName = args[0].value;
    let functionBody = interpreter.functions[functionName];

    if(!functionBody){
        throw new FS3Error("ReferenceError", `Function [${functionName}] is not defined`, args[0]);
    }
    if(functionBody.body){
        throw new FS3Error("AccessError", `Function [${functionName}] is a parameterized function and must be called with the [pcall] keyword`, args[0]);
    }

    try {
        await interpreter.executeBlock(functionBody);
    } catch (e) {
        if(e instanceof ExitFunction) return;
        else throw e;
    }
});

new Keyword("cvar", ["variable_reference", "literal_assignment", "string|number|array|block"], (args, interpreter) => {
    let name = args[0].value;
    let value = args[2].value;
    let type = args[2].type;

    if(interpreter.variables[name]) throw new FS3Error("ReferenceError", `Variable [${name}] is already defined`, args[0]);

    if(type !== "block"){
        interpreter.variables[name] = {
            value: value,
            type: type,
            mut: false,
            freeable: false
        }
        
    } else {
        let block = args[2].body;
        let object = interpreter.parseObject(name, block);

        interpreter.variables[name] = {
            value: object,
            type: "object",
            mut: false,
            freeable: false
        }
    }
})

new Keyword("var", ["variable_reference", "literal_assignment", "string|number|array|block"], (args, interpreter) => {
    let name = args[0].value;
    let value = args[2].value;
    let type = args[2].type;

    if(interpreter.variables[name]) throw new FS3Error("ReferenceError", `Variable [${name}] is already defined`, args[0]);

    if(type !== "block"){
        interpreter.variables[name] = {
            value: value,
            type: type,
            mut: true,
            freeable: true
        }

    } else {
        let block = args[2].body;
        let object = interpreter.parseObject(name, block);

        interpreter.variables[name] = {
            value: object,
            type: "object",
            mut: true,
            freeable: true
        };
    }
})

new Keyword("prompt", ["variable_reference", "number", "array"], (args, interpreter) => {
    let variable = args[0].value.slice(1);
    let selectedIndex = args[1].value;
    let options = args[2].value.map(o => o.value);

    setSetting("currentSpinner", "prompt-in-progress");
    setSetting("showSpinner", true)

    if(!interpreter.variables[variable]){
        throw new FS3Error("ReferenceError", `Variable [${variable}] is not defined`, args[0]);
    }

    if(!interpreter.variables[variable].mut){
        throw new FS3Error("AccessError", `Variable [${variable}] is immutable and cannot be changed`, args[0]);
    }

    if(interpreter.variables[variable].type !== "string"){
        throw new FS3Error("TypeError", `Variable [${variable}] must be of type [string] to store user input`, args[0]);
    }

    if(selectedIndex < 0 || selectedIndex >= options.length){
        throw new FS3Error("RangeError", `Default index [${selectedIndex}] is out of bounds for options array of length [${options.length}]`, args[1]);
    }

    if(options.length === 0){
        throw new FS3Error("ArgumentError", `Options array cannot be empty`, args[2]);
    }

    return new Promise((resolve, reject) => {
        const finish = () => {
            interpreter.variables[variable].value = options[selectedIndex];
            interpreter.variables[variable].type = "string";
            setSetting("currentSpinner", getSetting("defaultSpinner"));
            setSetting("showSpinner", false)
            resolve();
        };

        const cleanup = () => {
            lineContainer.setAttribute('contenteditable', 'false');
            document.body.removeEventListener("keyup", promptHandler);
            if (interpreter._onInterrupt === interruptCheck) {
                interpreter._onInterrupt = null;
            }
        };

        const interruptCheck = () => {
            cleanup();
            reject(new FS3Error("RuntimeError", "Program interrupted by user", {line: -1, col: -1, value: "" }));
        };

        // hook for interrupt
        interpreter._onInterrupt = interruptCheck;
        interpreter.promptCount++;

        let prefixElement = document.createElement('span');
        prefixElement.textContent = `>`;

        let lineContainer = document.createElement('div');
        lineContainer.classList.add('line-container');

        lineContainer.appendChild(prefixElement);

        for(let i = 0; i < options.length; i++){
            let option = document.createElement('span');
            option.setAttribute("data-program", `cli-session-${config.programSession}-${interpreter.promptCount}`);
            if(i == selectedIndex) {
                option.classList.add('selected');
            }
            option.textContent = options[i];
            option.style.paddingLeft = 0;
            lineContainer.appendChild(option);
            if(i != options.length-1) lineContainer.appendChild(document.createTextNode(" • "));
        }

        function promptHandler(e){
            e.preventDefault();
            let optionElements = document.querySelectorAll(`[data-program='cli-session-${config.programSession}-${interpreter.promptCount}']`);
            if(e.key == "ArrowLeft"){
                if(selectedIndex > 0) selectedIndex--;
                optionElements.forEach(option => option.classList.remove('selected'));
                optionElements[selectedIndex].classList.add('selected');
            }
            if(e.key == "ArrowRight"){
                if(selectedIndex < options.length - 1) selectedIndex++;
                optionElements.forEach(option => option.classList.remove('selected'));
                optionElements[selectedIndex].classList.add('selected');
            }
            if(e.key == "Enter"){
                cleanup();
                finish();
            }
        }

        terminal.appendChild(lineContainer);
        terminal.scrollTop = terminal.scrollHeight;
        document.body.addEventListener("keyup", promptHandler)
    });
});

// variable name, input type (string or number)
new Keyword("ask", ["variable_reference", "string"], async (args, interpreter) => {
    let variableName = args[0].value.slice(1);
    let prefix = args[1].value;

    if (!interpreter.variables[variableName]) {
        throw new FS3Error("ReferenceError", `Variable [${variableName}] is not defined`, args[0]);
    }

    if (!interpreter.variables[variableName].mut) {
        throw new FS3Error("AccessError", `Variable [${variableName}] is immutable and cannot be changed`, args[0]);
    }

    if(interpreter.variables[variableName].type !== "string"){
        throw new FS3Error("TypeError", `Variable [${variableName}] must be of type [string] to store user input`, args[0]);
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

    setSetting("currentSpinner", "ask-in-progress");
    setSetting("showSpinner", true)

    return new Promise((resolve, reject) => {

        const cleanup = () => {
            lineElement.setAttribute('contenteditable', 'false');
            if (interpreter._onInterrupt === interruptCheck) {
                interpreter._onInterrupt = null;
            }
        };

        const finish = (value) => {
            interpreter.variables[variableName].value = value;
            interpreter.variables[variableName].type = "string";
            cleanup();
            resolve();
        };

        const interruptCheck = () => {
            cleanup();
            reject(new FS3Error("RuntimeError", "Program interrupted by user", -1, -1, args));
        };

        // hook for interrupt
        interpreter._onInterrupt = interruptCheck;

        lineElement.addEventListener('keydown', function(e){
            if(e.key == "Enter") e.preventDefault();
        });

        lineElement.addEventListener('keyup', function(e){
            if(e.key == "Enter"){
                let inputValue = lineElement.textContent.trim();

                setSetting("currentSpinner", getSetting("defaultSpinner"));
                setSetting("showSpinner", false)
                finish(inputValue);
            }
        });
    });
});

new Keyword("free", ["variable_reference"], (args, interpreter) => {
    let name = args[0].value.slice(1);
    let variable = interpreter.variables[name];
    if(!variable){
        throw new FS3Error("ReferenceError", `Variable [${name}] is not defined`, args[0]);
    }
    if(!variable.freeable){
        throw new FS3Error("AccessError", `Variable [${name}] cannot be freed`, args[0]);
    }
    if(!variable.mut){
        throw new FS3Error("AccessError", `Variable [${name}] is immutable and cannot be freed`, args[0]);
    }
    delete interpreter.variables[name];
});

new Keyword("return", ["string|number|array"], (args, interpreter) => {
    interpreter.variables["fReturn"].value = args[0].value;
    interpreter.variables["fReturn"].type = args[0].type;
});


new Keyword("if", ["condition_statement", "block"], async (args, interpreter) => {
    let conditionResult = interpreter.evaluateMathExpression(args[0].value)

    if(conditionResult){
        await interpreter.executeBlock(args[1].body);
        interpreter.lastIfExecuted = true;
    } else {
        interpreter.lastIfExecuted = false;
    }
});

new Keyword("else", ["block"], async (args, interpreter) => {
    if(!interpreter.lastIfExecuted){
        await interpreter.executeBlock(args[0].body);
    }
    interpreter.lastIfExecuted = false;
});

new Keyword("loop", ["number|condition_statement", "block"], async (args, interpreter) => {
    let cond = args[0];
    let block = args[1].body;

    if(cond.type === "number"){
        let count = cond.value;
        for(let i = 0; i < count; i++){
            interpreter.variables["__index__"] = {value: i, type: "number", mut: false, freeable: false};
            interpreter.checkInterrupt();
            let blockCopy = structuredClone(block);
            try {
                await interpreter.executeBlock(blockCopy);
            } catch (e) {
                if(e instanceof ContinueLoop){
                    continue;
                } else if(e instanceof BreakLoop){
                    break;
                } else throw e;
            }
        }
    } else if(cond.type === "condition_statement"){
        let breaker = interpreter.variables["MAX_LOOP_ITERATIONS"].value;
        let i = 0;

        while(interpreter.evaluateMathExpression(cond.value)){
            let blockCopy = structuredClone(block);
            i++;

            if(i >= breaker){
                // error not closing program
                throw new FS3Error("RuntimeError", `Possible infinite loop detected after ${breaker} iterations.`, cond);
            }

            try {
                await interpreter.executeBlock(blockCopy);
            } catch (e) {
                if(e instanceof ContinueLoop){
                    continue;
                } else if(e instanceof BreakLoop){
                    break;
                } else throw e;
            }
        
        }
    }
});

class FroggyScript3 {
    static matches = [
        ["comment", /#.*/],
        ["literal_in", / in /],
        ["number", /[0-9]+(?:\.[0-9]+)?/],
        ["variable", /[A-Za-z_][A-Za-z0-9_]*/],
        ["string_concat", / \+ /],
        ["object_indicator", /\./],
        ["function_reference", /@[A-Za-z_][A-Za-z0-9_]*/],
        ["variable_reference", /\$[A-Za-z_][A-Za-z0-9_]*/],
        ["string", /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/],
        ["condition_statement", /:[^\r\n]*?:/],
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

        document.body.removeEventListener("keydown", interruptHandler);
        document.body.addEventListener("keydown", interruptHandler.bind(this));
    }

    cleanupKeyListeners() {
        for (const { type, handler } of this.keyListeners) {
            document.body.removeEventListener(type, handler);
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
            throw new FS3Error("RuntimeError", "Program interrupted by user", {line: -1, col: -1, value: "" })
        }
    }

    evaluateMathExpression(expression){
        expression = expression.slice(1, -1).trim();

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
                throw new FS3Error("MathError", `Math expression did not evaluate to a number`, {line: -1, col: -1, value: "" });
            }
            return result;
        } catch (e) {
            throw new FS3Error("MathError", `Error evaluating math expression: ${e.message}`, {line: -1, col: -1, value: "" });
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

    parseObject(variableName, block){
        const obj = {};
        for(let i = 0; i < block.length; i++){
            block[i] = this.methodResolver(this.compact(block[i]));

            for(let j = 0; j < block[i].length; j++){
                let token = block[i][j];

                if(token.type === "keyword" || token.type === "variable") {
                    if(this.variables[token.value]){
                        let variable = this.variables[token.value];
                        token.type = variable.type;
                        token.value = variable.value;
                    } else {
                        throw new FS3Error("ReferenceError", `In object [${variableName}]: Variable [${token.value}] is not defined`, token);
                    }
                }

                if(token.methods.length > 0){
                    token = this.executeMethods(token)[0];
                    block[i][j] = token;
                }

                if(token.type === "block"){
                    token.body = this.parseObject(variableName, token.body);
                    block[i][j] = token;
                }
            }

            if(block[i][0]?.type !== "string"){
                throw new FS3Error("SyntaxError", `In object [${variableName}]: Object property names must be strings`, block[i][0]);
            }
            if(block[i][1]?.type !== "literal_assignment"){
                throw new FS3Error("SyntaxError", `In object [${variableName}]: Expected assignment operator ' = ' after property name`, block[i][1]);
            }
            const allowedTypes = ["string", "number", "array", "block"];

            if(block[i][2]?.type === undefined){
                throw new FS3Error("SyntaxError", `In object [${variableName}]: Object property values must be of type [${allowedTypes.join(" or ")}], got none`, block[i][2]);
            }

            if(!allowedTypes.includes(block[i][2].type)){
                throw new FS3Error("TypeError", `In object [${variableName}]: Object property values must be of type [${allowedTypes.join(" or ")}], got [${block[i][2].type}]`, block[i][2]);
            }
        }

        for(let i = 0; i < block.length; i++){
            let propName = block[i][0].value;
            let propValue = block[i][2];

            if(propValue.type === "block"){
                propValue = propValue.body;
            }

            obj[propName] = propValue;
        }

        return obj;
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


            let compacted = this.compact(line);

            if(!Array.isArray(compacted)) compacted = [compacted];

            if(compacted.some(t => t.type === "object_indicator")){
                const clone = structuredClone(compacted)
                const methodsToApply = clone[clone.length -1].methods;

                compacted = this.mergeObjectReferences(compacted);

                for(let j = 0; j < compacted.length; j++){
                    let token = compacted[j];
                    if(token.type === "object_reference") {
                        const resolved = this.resolveObjectReference(token.value, this.variables);

                        compacted[j].type = resolved.type;
                        compacted[j].value = resolved.value;
                        compacted[j].methods = methodsToApply;
                    }
                }
            }

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

    handleConcatOperator(line){
        for(let j = 0; j < line.length; j++){
            // concat string literals separated by string_concat tokens
            if(line[j].type === "string_concat"){
                if(j === 0 || j === line.length - 1){
                    throw new FS3Error("SyntaxError", "String concatenation operator cannot be at the start or end of a line", line[j]);
                }
                let left = line[j - 1];
                let right = line[j + 1];

                if(left.type !== "string"){
                    throw new FS3Error("TypeError", `Left operand of string concatenation must be of type [string], got [${left.type}]`, left);
                }

                if(right.type === "variable_reference" && this.variables[right.value.slice(1)]?.type === "object"){
                    right.type = "object_reference";
                }

                if(right.type === "variable_reference"){
                    const varName = right.value.slice(1);
                    if(!this.variables[varName]){
                        throw new FS3Error("ReferenceError", `Variable [${varName}] is not defined`, right);
                    }
                    right.type = this.variables[varName].type;
                    right.value = this.variables[varName].value;
                }

                if(right.type !== "string" && right.type !== "number"){
                    throw new FS3Error("TypeError", `Right operand of string concatenation must be of type [string or number], got [${right.type}]`, right);
                }

                left.value = left.value + right.value.toString();
                line.splice(j, 2);
                j--;
            }
        }

        return line;
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

    async _process(code, fileName, fileArguments, executeKeywords = false) {
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

        this.fileArguments = [fileName, ...fileArguments];

        if (code.length == 0) {
            throw new FS3Error("SyntaxError", "No code to process", { line: -1, col: -1 });
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
                    throw new FS3Error("SyntaxError", "Unclosed array", token);
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
            let line = compressed[i];

            line.forEach((t, idx) => {
                if (t.type === "variable") {
                    const v = this.variables[t.value];
                    if (v) {
                        line[idx].type = v.type;
                        line[idx].value = v.value;
                    } else {
                        throw new FS3Error("ReferenceError", `Variable [${t.value}] is not defined`, t);
                    }
                }

                if (t.type === "array") {
                    t.value = t.value.map(el => {
                        if (Array.isArray(el) && el.length === 1) el = el[0];
                        if (el && el.type === "variable") {
                            const v = this.variables[el.value];
                            if (!v) {
                                throw new FS3Error("ReferenceError", `Variable [${el.value}] is not defined`, el);
                            }
                            return { ...el, type: v.type, value: v.value };
                        }
                        return el;
                    });
                }
            });

            if(line.some(t => t.type === "object_indicator")){
                line = this.mergeObjectReferences(line);
                for(let j = 0; j < line.length; j++){
                    let token = line[j];
                    if(token.type === "object_reference"){
                        let objectReference = structuredClone(token.value);
                        let resolved = this.resolveObjectReference(token.value, this.variables);
                        if(resolved === undefined){
                            throw new FS3Error("ReferenceError", `Object reference [${token.value.join(".")}] is not defined`, token);
                        }
                        token.type = resolved.type;
                        token.value = resolved.value;
                        token.objectReference = objectReference;
                        token.methods = [];
                    }
                }
            }

            line = this.handleConcatOperator(line);

            compressed[i] = this.methodResolver(this.compact(line));

            if(executeKeywords){
                await this.keywordExecutor(compressed[i]);
            }

            if(executeKeywords && i === compressed.length - 1){
                this.onComplete();
            }
        }

        return compressed;
    }

    resolveObjectReference(refChain, objectTree) {
        let current = objectTree;

        for (const key of refChain) {
            if (current == null) return undefined;

            // if current is an object with `value` field that is itself a key
            if (current.value && typeof current.value === "string" && current.value in objectTree) {
                current = objectTree[current.value];
            }

            if (key in current) {
                current = current[key];
            } else if (current.value && typeof current.value === "object" && key in current.value) {
                current = current.value[key];
            } else {
                return undefined;
            }
        }

        if(current.type == undefined) current.type = "object"

        return current;
    }

    mergeObjectReferences(tokens) {
        const result = [];
        let i = 0;

        let rootLine = null;
        let rootCol = null;

        while (i < tokens.length) {
            const t = tokens[i];

            if (t.type === "variable_reference") {
                let chain = [t.value.replace(/^\$/, "")];
                rootLine = rootLine === null ? t.line : rootLine;
                rootCol = rootCol === null ? t.col : rootCol;

                let j = i + 1;
                while (
                    j + 1 < tokens.length &&
                    tokens[j].type === "object_indicator" &&
                    ["string", "variable_reference"].includes(tokens[j + 1].type)
                ) {
                    const nextVal = tokens[j + 1].value.replace(/^['"]|['"]$/g, ""); // remove quotes
                    chain.push(nextVal);
                    j += 2;
                }

                if (chain.length > 1) {
                    result.push({
                        type: "object_reference",
                        value: chain,
                        line: rootLine,
                        col: rootCol,
                    });
                    i = j;
                } else {
                    result.push(t);
                    i++;
                }
            } else {
                result.push(t);
                i++;
            }
        }

        return result;
    }

    async interpret(code, fileName, fileArguments) {
        try {
            await this._process(code, fileName, fileArguments, true).catch(e => { throw e; });
        } catch (e) {
            this._handleError(e);
        } finally {
            this.cleanupKeyListeners();
        }
    }

    async parse(code, fileName, fileArguments) {
        try {
            return await this._process(code, fileName, fileArguments).catch(e => { throw e; });
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
            this.errout(new FS3Error("InternalJavaScriptError", `Internal JavaScript error: ${e.message}`, {line: -1, col: -1, value: "" }));
            throw e;
        }
        this.onError(e);
    }

    async keywordExecutor(line) {
        try {
            // Resolve variables
            this.checkInterrupt();
            if(this.clockLengthMs != 0) await new Promise(resolve => setTimeout(resolve, this.clockLengthMs));
            const keyword = line[0]?.type === "keyword" ? line[0].value : null;
            if (!keyword) return;
            
            let executedMethodTokens = this.executeMethods(line)

            const lineArgs = executedMethodTokens.slice(1);

            const keywordDef = Keyword.get(keyword);

            if (!keywordDef) {
                throw new FS3Error(
                    "ReferenceError",
                    `Unknown keyword [${keyword}]`,
                    line[0]
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
                                line[0]
                            );
                        }
                        continue;
                    }

                    if(keyword === "set" && actual.objectReference !== undefined){
                        lineArgs[i].originalType = structuredClone(actual.type);
                        actual.type = "object_reference"
                    }

                    if (!expected.includes(actual.type) && !expected.includes("any")) {
                        throw new FS3Error(
                            "TypeError",
                            `Invalid type for arg [${i + 1}] for keyword [${keyword}]: expected [${expected.map(e => e.replace("?", "")).join(" or ")}], got [${actual.type}]`,
                            actual
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
                        throw new FS3Error("SyntaxError", "Unmatched closing bracket for block", t);
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
                throw new FS3Error("SyntaxError", "Unmatched opening bracket for block", u);
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
        let tokens = Array.isArray(line) ? line : [line];

        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];

            // --- Variable resolution ---
            if (token.type === "variable") {
                const variable = this.variables[token.value];
                if (!variable) {
                    throw new FS3Error(
                        "ReferenceError",
                        `Variable [${token.value}] is not defined`,
                        token
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
                            method
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
                                    actual
                                );
                            }
                        }
                    }

                    // Validate parent type
                    if (def.parentTypes && !def.parentTypes.includes(token.type)) {
                        throw new FS3Error(
                            "TypeError",
                            `Invalid parent type for method [${method.name}]: expected [${def.parentTypes.join(" or ")}], got [${token.type}]`,
                            token,
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

        if(tokens.some(t => t.type === "object_indicator")){
            tokens = this.mergeObjectReferences(tokens);
            for(let j = 0; j < tokens.length; j++){
                let token = tokens[j];
                if(token.type === "object_reference"){
                    let objectReference = structuredClone(token.value);
                    let resolved = this.resolveObjectReference(token.value, this.variables);
                    if(resolved === undefined){
                        throw new FS3Error("ReferenceError", `Object reference [${token.value.join(".")}] is not defined`, token);
                    }
                    token.type = resolved.type;
                    token.value = resolved.value;
                    token.objectReference = objectReference;
                    token.methods = [];
                }
            }
        }


        // if(line.some(t => t.type === "object_indicator")){
        //     line = this.mergeObjectReferences(line);
        //     for(let j = 0; j < line.length; j++){
        //         let token = line[j];
        //         if(token.type === "object_reference"){
        //             let objectReference = structuredClone(token.value);
        //             let resolved = this.resolveObjectReference(token.value, this.variables);
        //             if(resolved === undefined){
        //                 throw new FS3Error("ReferenceError", `Object reference [${token.value.join(".")}] is not defined`, token);
        //             }
        //             token.type = resolved.type;
        //             token.value = resolved.value;
        //             token.objectReference = objectReference;
        //             token.methods = [];
        //         }
        //     }
        // }

        tokens = this.handleConcatOperator(tokens);

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
                        method
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
                        return new FS3Error("SyntaxError", "Empty argument in method call", t);
                    }
                    const parsed = this.compact(currentArg);
                    args.push(parsed);
                    currentArg = [];
                } else {
                    currentArg.push(t);
                }
            }

            throw new FS3Error("SyntaxError", "Unclosed parenthesis in method call", tokens[startIndex - 1]);
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
                            throw new FS3Error("SyntaxError", "method_indicator has no following method", t);
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
                throw new FS3Error("SyntaxError", `Unexpected token [${token.value}]`, token);
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
                    throw new FS3Error("TokenizationError", `Unrecognized token [${line[pos]}]`, {line: lineNo, col: pos});
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