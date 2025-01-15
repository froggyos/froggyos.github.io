function parse(input) {
    let parsed = {
        variables: {},
        functions: {},
        lines: [],
        errors: []
    };

    // Parse lines into command objects
    for (let i = 0; i < input.length; i++) {
        let line = input[i];
        let commandContent = {
            command: line.split(" ")[0],
            args: line.split(" ").slice(1),
        };

        parsed.lines.push(commandContent);
    }

    // Parse variables
    for (let i = 0; i < parsed.lines.length; i++) {
        let line = parsed.lines[i];
        if (line.command === "var") {
            let variable = line.args[0].split(":")[0];
            let type = line.args[0].split(":")[1];
            let value = line.args[2];
            parsed.variables[variable] = {
                type: type,
                value: value
            };

            parsed.lines.splice(i, 1);
            i--; // Adjust index after splice
        }
    }

    // Handle `out` commands
    for (let i = 0; i < parsed.lines.length; i++) {
        let line = parsed.lines[i];
        if (line.command === "out") {
            line.args = line.args.join(" ");
            if (line.args.startsWith("v:")) {
                let varName = line.args.replace("v:", "");
                line.args = parsed.variables[varName]?.value || parsed.errors.push(`Variable ${varName} not defined.`);
            }
        }
    }

    // Parse functions
    for (let i = 0; i < parsed.lines.length; i++) {
        let line = parsed.lines[i];
        if (line.command === "func") {
            let functionName = line.args[0];
            let functionLines = [];
            let j = i + 1;

            // Collect all lines within the function body
            while (parsed.lines[j].command !== "endfunc") {
                functionLines.push(parsed.lines[j]);
                parsed.lines.splice(j, 1); // Remove processed line
            }

            // Remove the "endfunc" command
            parsed.lines.splice(j, 1); 

            // Store the function body
            parsed.functions[functionName] = functionLines;

            // Remove the "func" line
            parsed.lines.splice(i, 1); 
            i--; // Adjust index after splice
        }
    }

    // Execute `f:` commands
    for (let i = 0; i < parsed.lines.length; i++) {
        let line = parsed.lines[i];
        if (line.command === "f:") {
            let functionName = line.args[0];
            if (parsed.functions[functionName]) {
                // Inject function body into lines at this point
                let functionBody = JSON.parse(JSON.stringify(parsed.functions[functionName])); // Deep copy
                parsed.lines.splice(i, 1, ...functionBody);
                i += functionBody.length - 1; // Adjust index to skip added lines
            } else {
                parsed.errors.push(`Function ${functionName} not defined.`);
            }
        }
    }

    return parsed;
}