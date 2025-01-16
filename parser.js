function parse(input) {
    let parsed = {
        functions: {},
        labels: {},
        lines: [],
        errors: []
    };

    // Parse lines into command objects
    input.forEach((line) => {
        let [command, ...args] = line.split(" ");
        parsed.lines.push({ command, args });
    });

    // Parse variable declarations
    parsed.lines.forEach((line) => {
        if (line.command === "int" || line.command === "str") {
            line.args = {
                type: line.command,
                name: line.args[0],
                value: line.args[2]
            };
        }
    });

    // Parse set commands
    parsed.lines.forEach((line) => {
        if (line.command === "set") {
            line.args = {
                variable: line.args[0],
                value: line.args[2]
            };
        }
    });

    // Handle `out` commands
    parsed.lines.forEach((line) => {
        if (line.command === "out") {
            line.args = line.args.join(" ");
        }
    });

    // Parse functions
    for (let i = 0; i < parsed.lines.length; i++) {
        let line = parsed.lines[i];
        if (line.command === "func") {
            let functionName = line.args[0];
            let functionLines = [];
            let j = i + 1;
            let failsafe = 0;

            if(parsed.functions[functionName] !== undefined){
                parsed.errors.push(`Function ${functionName} already exists.`);
                break;
            }

            while (parsed.lines[j]?.command !== "endfunc") {
                functionLines.push(parsed.lines[j]);
                parsed.lines.splice(j, 1);
                failsafe++;
                
                if(failsafe > parsed.lines.length){
                    parsed.errors.push(`Function ${functionName} is not closed.`);
                    break;
                }
            }

            parsed.lines.splice(j, 1); // Remove "endfunc"
            parsed.functions[functionName] = functionLines;
            parsed.lines.splice(i, 1); // Remove "func"
            i--; // Adjust index
        }
    }

    // Execute `f:` commands
    for (let i = 0; i < parsed.lines.length; i++) {
        let line = parsed.lines[i];
        if (line.command === "f:") {
            let functionName = line.args[0];
            if (parsed.functions[functionName]) {
                let functionBody = JSON.parse(JSON.stringify(parsed.functions[functionName]));
                parsed.lines.splice(i, 1, ...functionBody);
                i += functionBody.length - 1;
            } else {
                parsed.errors.push(`Function ${functionName} not defined.`);
            }
        }
    }

    // Parse labels
    parsed.lines.forEach((line, index) => {
        if (line.command === "label") {
            let labelName = line.args[0];
            parsed.labels[labelName] = index;
            line.args = labelName;
        }
    });

    // Parse `goto` commands
    parsed.lines.forEach((line) => {
        if (line.command === "goto") {
            if (parsed.labels[line.args[0]] === undefined) {
                parsed.errors.push(`Label ${line.args[0]} not defined.`);
            } else {
                line.args = parsed.labels[line.args[0]];
            }
        }
    });

    // if
    parsed.lines.forEach((line) => {
        if (line.command === "if") {
            let input = line.args.join(" ");
            input = input.replace("{", "");
            input = input.replace("}", "");

            delete line.args 
            line.args = {};
            line.args.condition = input;
        }
    })

    return parsed;
}