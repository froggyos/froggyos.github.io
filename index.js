const config = {
    currentPath: 'C:/Home',
    commandHistory: [],
    commandHistoryIndex: -1,
    timeFormat: 'w. y/m/d h:n:s',
    updateStatBar: true,
    currentProgram: null, // do something with this later
    programList: ["cli", "lilypad"],
    allowedProgramDirectories: ["C:/Programs", "C:/Demo-Programs"],
    programSession: 0,
    errorText: "<span style='background-color: #FF5555; color: #FFFFFF;'>!!ERROR!!</span> - ",
    fileSystem: {
        "C:": [], 
        "C:/Home": [
            { name: "welcome!", permissions: {read: true, write: true, hidden: false}, data: ['Hello!', "Welcome to FroggyOS.", "Type 'help' for a list of commands.", "Have fun! ^v^"] },
        ],
        "C:/Docs": [],
        "C:/Programs": [
            { name: "cli", permissions: {read: false, write: false, hidden: true}, data: ["str cli = 'this program is hardcoded into froggyOS'", "endprog"] },
            { name: "lilypad", permissions: {read: false, write: false, hidden: true}, data: ["str lilypad = 'this program is hardcoded into froggyOS'", "endprog"] },
            { name: "test", permissions: {read: true, write: true, hidden: false}, data: [
                "define num1 int",
                "define num2 int",
                "out 'first number: v:num1'",
                "out 'second number: v:num2'",
                "if {v:num1 > v:num2}",
                "out 'v:num1 is greater than v:num2'",
                "else",
                "out 'v:num1 is less than or equal to v:num2'",
                "endif",
                "endprog"
            ] },
        ],
        "C:/Demo-Programs": [
            { name: "demo-output", permissions: {read: true, write: true, hidden: false}, data: [
                "out 'You can output strings directly.'",
                "str text = 'You can also output variables.'",
                "out v:text",
                "str embed = 'embed variables in'",
                "int number = 10",
                "out 'You can v:embed strings.'",
                "out 'You can also embed integers. I have v:number apples.'",
                "endprog"
            ] },
            { name: "demo-variables", permissions: {read: true, write: true, hidden: false}, data: [
                "str string = 'Froggy'",
                "int number = 10",
                "out v:string",
                "out v:number",
                "set string = 'Froggy's value has changed'",
                "set number = 20",
                "out v:string",
                "out v:number",
                "endprog"
            ] },
            {name: "demo-if-else", permissions: {read: true, write: true, hidden: false}, data: [
                "int number = 11",
                "int number_to_compare = 14",
                "if {v:number > v:number_to_compare}",
                "out 'v:number is greater than v:number_to_compare'",
                "else",
                "out 'v:number is less than or equal to v:number_to_compare'",
                "endif",
                "endprog"
            ] },
        ],
    }
};

let screen = document.getElementById('screen');
let terminal = document.getElementById('terminal');

screen.onclick = function() {
    terminal.lastChild.lastChild.focus();
}

function moveCaretToEnd(element) {
    if (typeof window.getSelection !== "undefined" && typeof document.createRange !== "undefined") {
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        if (element.getBoundingClientRect().bottom > window.innerHeight) element.scrollIntoView(false);
        if (element.getBoundingClientRect().top < 0) element.scrollIntoView(true);
        
    } else if (typeof document.body.createTextRange !== "undefined") {
        const textRange = document.body.createTextRange();
        textRange.moveToElementText(element);
        textRange.collapse(false);
        textRange.select();

        if (element.getBoundingClientRect().bottom > window.innerHeight) element.scrollIntoView(false);
        if (element.getBoundingClientRect().top < 0) element.scrollIntoView(true);
    }
}

function updateDateTime() {
    if(!config.updateStatBar) return;
    const now = new Date();

    // Grab the current weekday.
    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];  // Grab the live day of the week.
    const year = now.getFullYear(); // Year
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month
    const day = String(now.getDate()).padStart(2, '0'); // Day
    const hour = String(now.getHours()).padStart(2, '0'); // Hour in 24-hour format
    const minute = String(now.getMinutes()).padStart(2, '0'); // Minutes
    const second = String(now.getSeconds()).padStart(2, '0'); // Seconds

    let dateTemplate = config.timeFormat;
    dateTemplate = dateTemplate.replace('w', '###W###');
    dateTemplate = dateTemplate.replace('y', '###Y###');
    dateTemplate = dateTemplate.replace('m', '###M###');
    dateTemplate = dateTemplate.replace('d', '###D###');
    dateTemplate = dateTemplate.replace('h', '###H###');
    dateTemplate = dateTemplate.replace('n', '###N###');
    dateTemplate = dateTemplate.replace('s', '###S###');

    dateTemplate = dateTemplate.replace('!###W###', 'w');
    dateTemplate = dateTemplate.replace('!###Y###', 'y');
    dateTemplate = dateTemplate.replace('!###M###', 'm');
    dateTemplate = dateTemplate.replace('!###D###', 'd');
    dateTemplate = dateTemplate.replace('!###H###', 'h');
    dateTemplate = dateTemplate.replace('!###N###', 'n');
    dateTemplate = dateTemplate.replace('!###S###', 's');

    dateTemplate = dateTemplate.replace('###W###', dayOfWeek);
    dateTemplate = dateTemplate.replace('###Y###', year);
    dateTemplate = dateTemplate.replace('###M###', month);
    dateTemplate = dateTemplate.replace('###D###', day);
    dateTemplate = dateTemplate.replace('###H###', hour);
    dateTemplate = dateTemplate.replace('###N###', minute);
    dateTemplate = dateTemplate.replace('###S###', second);

    const dateString = dateTemplate;
    document.getElementById('bar').textContent = dateString;
}

setInterval(function() {
    // make an array that consist of all the file names of files in the all the allowed program directories
    let files = [];
    for(let directory of config.allowedProgramDirectories){
        if(config.fileSystem[directory] == undefined) continue;
        // if the files havent changed, do not update the program list
        if(config.fileSystem[directory].length == files.length && config.fileSystem[directory].every((file, index) => file.name == files[index])) continue;

        files = files.concat(config.fileSystem[directory]);
    }
    files = files.map(file => file.name);
    config.programList = files;
}, 1000);

setInterval(updateDateTime, 1000);
updateDateTime();

// Section 2: The terminal itself.
function createTerminalLine(text, path){
    let lineContainer = document.createElement('div');
    let terminalPath = document.createElement('span');
    let terminalLine = document.createElement('div');

    lineContainer.classList.add('line-container');

    terminalPath.innerHTML = path;
    terminalLine.textContent = text;

    lineContainer.appendChild(terminalPath);
    lineContainer.appendChild(terminalLine);
    terminal.appendChild(lineContainer);
    terminal.scrollTop = terminal.scrollHeight;
}

function getFileWithName(path, name){
    let file = config.fileSystem[path];
    if(file == undefined) return undefined;
    return file.find(file => file.name == name);
}

function cleanInnerQuotes(input) {
    if ((input.startsWith('"') && input.endsWith('"')) || (input.startsWith("'") && input.endsWith("'"))) {
        let quoteType = input[0];
        let innerContent = input.slice(1, -1);
        let cleanedContent = innerContent.replace(/["']/g, '');
        return quoteType + cleanedContent + quoteType;
    }
    return input;
}

function sendCommand(command, args){
    command = command.trim();
    args = args.filter(arg => arg.trim() != "");
    let directory;
    let file;

    switch(command){
        case "":
            createTerminalLine("Froggy doesn't like that. >:(", "");
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // commands =========================================================================================================================================================
        case "cl":
        case "clear":
            document.getElementById('terminal').innerHTML = "";
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // delete files
        case "c":
        case "croak":
            if(args.length == 0){
                createTerminalLine("Please provide a file name.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file = config.fileSystem[config.currentPath];
            if(file == undefined){
                createTerminalLine("File does not exist.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file = file.find(file => file.name == args[0]);
            if(file == undefined){
                createTerminalLine("File does not exist.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(file.permissions.write == false){
                createTerminalLine("You do not have permission to delete this file.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            let fileIndex = config.fileSystem[config.currentPath].findIndex(file => file.name == args[0]);
            delete config.fileSystem[config.currentPath][fileIndex];
            config.fileSystem[config.currentPath] = config.fileSystem[config.currentPath].filter(file => file != undefined);

            createTerminalLine("File deleted.", ">")
            createEditableTerminalLine(`${config.currentPath}>`);
        break;
        
        case "ribbit":
            if(args.length == 0){
                createTerminalLine("Please provide text to display.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            createTerminalLine(args.join(" "), ">")
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "ft":
        case "formattime":
            if(args.length == 0){
                createTerminalLine("Please provide a time format. example time format below:", config.errorText);
                createTerminalLine("w. y/m/d h:n:s", config.errorText);
                createTerminalLine("If you want to include any of those key characters, prefix", config.errorText);
                createTerminalLine("the character with !. Example: !w", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(args.join(" ").length > 63){
                createTerminalLine("The argument is too long.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            config.timeFormat = args.join(" ");
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // make files
        case "ch":
        case "hatch":
            if(args.length == 0){
                createTerminalLine("Please provide a file name.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(config.fileSystem[config.currentPath] == undefined){
                createTerminalLine("Directory does not exist.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
            }
            if(config.fileSystem[config.currentPath].find(file => file.name == args[0]) != undefined){
                createTerminalLine("File already exists.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            config.fileSystem[config.currentPath].push({
                name: args[0],
                permissions: {
                    read: true,
                    write: true,
                    hidden: false
                }, 
                data: [""]
            });
            createTerminalLine("File created.", ">")
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "hello":
            createTerminalLine("Hello, I'm Froggy! ^v^", ">");
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "?":
        case "help":
            createTerminalLine("* A few basic froggyOS commands *", "");
            createTerminalLine("clear. . . . . . . . . . . . . Clears the terminal output.", ">");
            createTerminalLine("croak [file] . . . . . . . . . Deletes the file.", ">");
            createTerminalLine("ribbit [text]. . . . . . . . . Displays the text.", ">");
            createTerminalLine("formattime [format]. . . . . . Changes the time format.", ">");
            createTerminalLine("hatch [file] . . . . . . . . . Creates a file.", ">");
            createTerminalLine("hello. . . . . . . . . . . . . Displays a greeting message.", ">");
            createTerminalLine("help . . . . . . . . . . . . . Displays this message.", ">");
            createTerminalLine("hop [directory]. . . . . . . . Moves to a directory.", ">");
            createTerminalLine("list . . . . . . . . . . . . . Lists files and subdirectories in the current                                directory.", ">");
            createTerminalLine("loadstate. . . . . . . . . . . Load froggyOS state.", ">");
            createTerminalLine("meta [file]. . . . . . . . . . Edits a file.", ">");
            createTerminalLine("metaperm [file] [perm] [0/1] . Edits a file's permissions.", ">");
            createTerminalLine("savestate. . . . . . . . . . . Save froggyOS state.", ">");
            createTerminalLine("spawn [directory]. . . . . . . Creates a directory.", ">");
            createTerminalLine("spy [file] . . . . . . . . . . Reads the file.", ">");
            createTerminalLine("swimto [program] . . . . . . . Start a program.", ">");
            createEditableTerminalLine(`${config.currentPath}>`);
        break;


        // move directories
        case "h":
        case "hop":
            directory = args[0];

            if(directory == undefined){
                createTerminalLine("Please provide a directory name.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            directory = directory.replace(".", config.currentPath);
            if(directory == "~") directory = "C:";
            if(directory == "-") directory = config.currentPath.split("/").slice(0, -1).join("/");

            if(config.fileSystem[directory] == undefined){
                createTerminalLine("Directory does not exist.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            sendCommand("[[FROGGY]]changepath", [directory]);
        break;

        // list files
        case "ls":
        case "list":
            let currentPathWithSlash = config.currentPath.endsWith('/') ? config.currentPath : config.currentPath + '/';

            // Get subdirectory names under the currentPath
            let subdirectoryNames = Object.keys(config.fileSystem)
                .filter(path => path.startsWith(currentPathWithSlash) && path !== config.currentPath && !path.slice(currentPathWithSlash.length).includes('/'))
                .map(path => path.slice(currentPathWithSlash.length)); // Extract only the subdirectory name

            let files = config.fileSystem[config.currentPath];
            if(files == undefined) files = [];
            // remove all files that are hidden
            files = files.filter(file => file.permissions.hidden == false);

            if(files.length == 0 && subdirectoryNames.length == 0){
                createTerminalLine("This directory is empty.", ">")
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            subdirectoryNames.forEach(subdirectory => {
                createTerminalLine(` [DIR] ${subdirectory}`, ">")
            });
            files.forEach(file => {
                createTerminalLine(`       ${file.name}`, ">")
            });
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // load state
        case "lds":
        case "loadstate":
            let state = localStorage.getItem("froggyOS-state");
            if(state == null){
                createTerminalLine("No state found.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            for(let key in JSON.parse(state)){
                config[key] = JSON.parse(state)[key];
            }

            createTerminalLine("State loaded.", ">")
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // edit file
        case "m":
        case "meta":
            if(args.length == 0){
                createTerminalLine("Please provide a file name.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file = config.fileSystem[config.currentPath];
            if(file == undefined){
                createTerminalLine("File does not exist.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file = file.find(file => file.name == args[0]);
            if(file == undefined){
                createTerminalLine("File does not exist.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(file.permissions.write == false){
                createTerminalLine("You do not have permission to edit this file.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            createTerminalLine("* press ESC to save and exit lilypad *", "");
            for(let i = 0; i < file.data.length; i++){
                if(config.allowedProgramDirectories.includes(config.currentPath)){
                    createLilypadLine("code", String(i+1).padStart(3, "0"), file.name);
                } else createLilypadLine("normal", ">", file.name);
                let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
                lines[i].textContent = file.data[i];
                moveCaretToEnd(lines[i]);
            }
        break;

        // edit file permissions
        case "mp":
        case "metaperm":
            file = getFileWithName(config.currentPath, args[0]);

            let permission = args[1];
            let value = args[2];
            if(file == undefined){
                createTerminalLine("File does not exist.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            let permissionType = Object.keys(file.permissions);

            if(permission == undefined || permissionType.includes(permission) == false){
                createTerminalLine("Please provide a valid permission type.", config.errorText);
                createTerminalLine("* Available permissions *", "");
                createTerminalLine(permissionType.join(", "), ">");
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            if(value == undefined || (value != "0" && value != "1")){
                createTerminalLine("Please provide a valid value. 0 or 1.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break
            }

            if(file.permissions.write == false){
                createTerminalLine("You do not have permission to edit this file.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            file.permissions[permission] = value == "1" ? true : false;
            createTerminalLine("Permissions updated.", ">")
                

            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // save state
        case "svs":
        case "savestate":
            localStorage.setItem("froggyOS-state", JSON.stringify(config));
            createTerminalLine("State saved.", ">")
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // make directories
        case "s":
        case "spawn":
            directory = config.currentPath + "/" + args[0];

            if(config.allowedProgramDirectories.includes(config.currentPath)){
                createTerminalLine("You cannot create directories in this directory.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(args[0] == undefined){
                createTerminalLine("Please provide a directory name.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(config.fileSystem[directory] != undefined){
                createTerminalLine("Directory already exists.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            config.fileSystem[directory] = [];
            createTerminalLine("Directory created.", ">");
            sendCommand("[[FROGGY]]changepath", [directory]);
        break;

        // read file contents
        case "spy":
            if(args.length == 0){
                createTerminalLine("Please provide a file name.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file = config.fileSystem[config.currentPath];
            if(file == undefined){
                createTerminalLine("File does not exist.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file = file.find(file => file.name == args[0]);
            if(file == undefined){
                createTerminalLine("File does not exist.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(file.permissions.read == false){
                createTerminalLine("You do not have permission to read this file.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file.data.forEach(line => {
                createTerminalLine(line, ">")
            });
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "st":
        case "swimto":
            if(!config.programList.includes(args[0])){
                createTerminalLine("Please provide a valid program.", config.errorText);
                createTerminalLine("* Available programs *", "");
                createTerminalLine(config.programList.join(", "), ">");
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            if(args[0] == "cli"){
                createEditableTerminalLine(`${config.currentPath}>`);
            } else if(args[0] == "lilypad"){
                createTerminalLine("* press ESC to exit lilypad *", "");
                createLilypadLine("normal", ">");
            } else {
                let file;
                for(let directory of config.allowedProgramDirectories){
                    file = getFileWithName(directory, args[0]);
                    if(file != undefined) break;
                }
                if(file.permissions.read == false){
                    createTerminalLine("You do not have permission to run this program.", config.errorText);
                    createEditableTerminalLine(`${config.currentPath}>`);
                    break;
                }

                let parsed = parse(file.data);
                if(parsed.errors.length > 0){
                    createTerminalLine(parsed.errors[0], config.errorText);
                    createEditableTerminalLine(`${config.currentPath}>`);
                } else {
                    let endprogFound = false;
                    let endProgram = () => endprogFound = true;

                    function evalutate(string){
                        let parsedString;
                        try {
                            parsedString = new Function(`return (${string});`)();
                        } catch (err) {
                            createTerminalLine(`Error evaluating statement: "${string}".`, config.errorText);
                            endProgram();
                        }
                        return parsedString;
                    }

                    let lineIndex = 0;
                    let variables = {};
                    let defineCount = 0;
                    while(lineIndex < parsed.lines.length){
                        let line = parsed.lines[lineIndex];
                        let command = line.command;
                        switch(command){
                            // FroggyScript interpreter ===============================================================================================
                            case "--":
                            break;
                            case "define":
                                if (!line.args || !line.args.name || !line.args.type || !line.args.value) {
                                    createTerminalLine(`Invalid declaration syntax.`, config.errorText);
                                    endProgram();
                                    break;
                                }

                                let name = line.args.name;
                                let type = line.args.value;  

                                if(variables["v:" + name] != undefined){
                                    createTerminalLine(`Variable "${name}" already exists.`, config.errorText);
                                    endProgram();
                                    break;
                                }

                                // count the number of variables with the type of "define"
                                defineCount++;

                                if(args.length - 1 < defineCount){
                                    createTerminalLine(`Missing argument ${defineCount} (type ${type}).`, config.errorText);
                                    endProgram();
                                    break;
                                }

                                let varVal = args[defineCount];

                                variables["v:" + name] = {
                                    type: type,
                                    value: varVal,
                                    name: name,
                                };
                            break;
                            case "str":
                                if (!line.args || !line.args.name) {
                                    createTerminalLine(`Invalid declaration syntax.`, config.errorText);
                                    lineIndex = parsed.lines.length - 2;
                                    break;
                                }
                                // if the variable already exist, throw error
                                if(variables[line.args.name] != undefined){
                                    createTerminalLine(`String "${line.args.name}" already exists.`, config.errorText);
                                    endProgram();
                                    break;
                                }

                                for(let variable in variables){
                                    if(line.args.value.includes(variable)){
                                        line.args.value = line.args.value.replaceAll(new RegExp(`\\b${variable}\\b`, 'g'), variables[variable].value);
                                    }
                                }

                                variables["v:" + line.args.name] = line.args;
                            break;
                            case "int":
                                if (!line.args || !line.args.name) {
                                    createTerminalLine(`Invalid declaration syntax.`, config.errorText);
                                    endProgram();
                                    break;
                                }
                                if(variables[line.args.name] != undefined){
                                    createTerminalLine(`Integer "${line.args.name}" already exists.`, config.errorText);
                                    endProgram();
                                    break;
                                }

                                let argument = line.args.value;
                                if(argument.includes("\"")){
                                    createTerminalLine(`Type mismatch.`, config.errorText);
                                    endProgram();
                                    break;
                                }
                                let parsedArgument = evalutate(argument);

                                line.args.value = parsedArgument + [];
                                variables["v:" + line.args.name] = line.args;
                            break;
                            case "set":
                                let variableName = "v:" + line.args?.variable;
                                let value = line.args?.value;
                    
                                if (!variableName || !value) {
                                    createTerminalLine(`Invalid "set" syntax.`, config.errorText);
                                    endProgram();
                                    break;
                                }

                                if(variables[variableName] == undefined){
                                    createTerminalLine(`Variable "${variableName}" does not exist.`, config.errorText);
                                    endProgram();
                                    break;
                                }

                                for(let variable in variables){
                                    if(variable == variableName){
                                        if(variables[variable].type == "int"){
                                            if(value.includes("\"")){
                                                createTerminalLine(`Type mismatch.`, config.errorText);
                                                endProgram();
                                                break;
                                            }
                                        }

                                        value = value.replaceAll(new RegExp(`\\b${variableName}\\b`, 'g'), variables[variableName].value);
                                    }
                                }

                                let parsedValue;
                                try {
                                    parsedValue = new Function(`return (${value});`)();
                                } catch (err) {
                                    createTerminalLine(`Error evaluating statement: "${value}".`, config.errorText);
                                    endProgram();
                                    break;
                                }

                                variables[variableName].value = parsedValue;
                            break;
                            case "if":
                                let condition = line.args.condition;

                                if(!condition){
                                    createTerminalLine(`Invalid "if" syntax.`, config.errorText);
                                    endProgram();
                                    break;
                                }
                            
                                let varType = undefined;
                                for(let variable in variables){
                                    if(condition.includes(variable)){
                                        if(varType == undefined) varType = variables[variable].type;
                                        if(varType != variables[variable].type && varType != undefined){
                                            createTerminalLine(`Type mismatch in condition statement.`, config.errorText);
                                            endProgram();
                                            break;
                                        }
                                        condition = condition.replaceAll(new RegExp(`\\b${variable}\\b`, 'g'), `¶v¬${varType}¦${variables[variable].value}¶v¬${varType}¦`);
                                    }
                                }

                                
                                condition = condition.replaceAll("¶v¬str¦", "\"");
                                condition = condition.replaceAll("¶v¬int¦", "");

                                let parsedCondition = evalutate(condition);

                                // find the else statement
                                let elseIndex = parsed.lines.findIndex((line, index) => line.command == "else" && index > lineIndex);
                                let endifIndex = parsed.lines.findIndex((line, index) => line.command == "endif" && index > lineIndex);

                                if(endifIndex == -1){
                                    createTerminalLine(`"endif" not found.`, config.errorText);
                                    endProgram();
                                    break;
                                }

                                if(parsedCondition){
                                    if(elseIndex != -1){
                                        parsed.lines.splice(elseIndex, endifIndex - elseIndex);
                                    } else {
                                        parsed.lines.splice(endifIndex, 1);
                                    }
                                } else {
                                    if(elseIndex != -1){
                                        parsed.lines.splice(lineIndex, elseIndex - lineIndex);
                                    } else {
                                        parsed.lines.splice(lineIndex, endifIndex - lineIndex);
                                    }
                                }
                            break;
                            case "out":
                                let out = line.args;
                                if(line.args == undefined){
                                    createTerminalLine(`Invalid "out" syntax.`, config.errorText);
                                    endProgram();
                                    break;
                                }

                                for(let variable in variables){
                                    if(out.includes(variable)){
                                        if(variables[variable].type == "str"){  
                                            out = out.replaceAll(new RegExp(`\\b${variable}\\b`, 'g'), `'${variables[variable].value}'`);
                                        } else {
                                            out = out.replaceAll(new RegExp(`\\b${variable}\\b`, 'g'), variables[variable].value);
                                        };
                                    }
                                }

                                if(out.includes("v:")){
                                    createTerminalLine(`Variable does not exist in out statement.`, config.errorText);
                                    endProgram();
                                    break;
                                }
                                

                                let parsedOut;
                                try {
                                    out = cleanInnerQuotes(out);
                                    parsedOut = new Function(`return (${out});`)();
                                } catch (err) {
                                    console.log(err);
                                    createTerminalLine(`Error evaluating statement: "${out}".`, config.errorText);
                                    endProgram();
                                    break;
                                }
                                createTerminalLine(parsedOut, ">");
                            break;
                            case "goto":
                                if(line.args == undefined){
                                    createTerminalLine(`Invalid "goto" syntax.`, config.errorText);
                                    endProgram();
                                    break;
                                }

                                lineIndex = line.args;
                                continue;
                            case "endprog":
                                endProgram();
                            break;
                        }

                        if(endprogFound) break;
                        lineIndex++;
                    }
                    if(endprogFound == false){
                        createTerminalLine("Program was not ended internally. Initiating failsafe.", config.errorText);
                        let decrementer = 10;
                        let failsafe = setInterval(function(){
                            createTerminalLine(`${decrementer}...`, ">");
                            decrementer--;

                            if(decrementer == 0){
                                clearInterval(failsafe);
                                createEditableTerminalLine(`${config.currentPath}>`);
                            }
                        }, 1000);
                    } else {
                        createEditableTerminalLine(`${config.currentPath}>`);
                    }
                }
            }
        break;

        // hidden commands =======================================================================================================================================
        case "[[FROGGY]]changepath":
            if(args.length == 0){
                createTerminalLine("Please provide a path.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            config.currentPath = args.join(" ");
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case '[[FROGGY]]greeting':
            createTerminalLine("Type ‘help’ to receive support with commands, and possibly navigation.", "");
            createTerminalLine("* Welcome to froggyOS, version 1.3 *" , "");
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case '[[FROGGY]]help':
            createTerminalLine("* A few frog commands *", "");
            createTerminalLine("[[FROGGY]]changepath [path] - Changes the path of the terminal", ">");
            createTerminalLine("[[FROGGY]]greeting - Displays the greeting message", ">");
            createTerminalLine("[[FROGGY]]help - Displays this message", ">");
            createTerminalLine("[[FROGGY]]setstatbar [text] - Changes the text in the status bar", ">");
            createTerminalLine("[[FROGGY]]statbarlock [0/1] - Locks the status bar from updating", ">");
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case '[[FROGGY]]setstatbar':
            if(args.length > 80){
                createTerminalLine("The argument is too long.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            document.getElementById('bar').textContent = args.join(" ");
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case '[[FROGGY]]statbarlock':
            let bool = args[0];
            if(bool == "1"){
                config.updateStatBar = false;
            } else if(bool == "0"){
                config.updateStatBar = true;
            } else {
                createTerminalLine("Invalid argument. Please provide '1' or '0'.", config.errorText);
            }
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        default:
            createTerminalLine(`Froggy doesn't know "${command}", sorry.`, ">");
            createEditableTerminalLine(`${config.currentPath}>`);
        break;
    }
}

/*
create a line for user input
path - the path

PROGRAM SPECIFIC: for program CLI ===============================================================================================
*/
function createEditableTerminalLine(path){
    let lineContainer = document.createElement('div');
    let terminalPath = document.createElement('span');
    let terminalLine = document.createElement('div');

    lineContainer.classList.add('line-container');
    terminalLine.setAttribute('contenteditable', 'true');
    terminalLine.setAttribute('spellcheck', 'false');

    terminalPath.textContent = path;
    terminalLine.textContent = "";

    terminalLine.addEventListener('keydown', function(e){
        let userInput = terminalLine.textContent;
        if(e.key == "Enter"){
            e.preventDefault();
            terminalLine.setAttribute('contenteditable', 'false');
            let args = userInput.split(" ");

            terminalLine.innerHTML = terminalLine.innerHTML.replaceAll("<div><br></div>", "");

            let command = args[0].trim();
            args = args.slice(1);

            config.commandHistory.reverse();
            config.commandHistory.push(userInput);
            config.commandHistory.reverse();
            config.commandHistoryIndex = -1;

            sendCommand(command, args);
        }

        if(e.key == "ArrowUp"){
            e.preventDefault();
            if(config.commandHistoryIndex <= config.commandHistory.length - 2) config.commandHistoryIndex++;
            if(config.commandHistoryIndex != -1){
                terminalLine.textContent = config.commandHistory[config.commandHistoryIndex];
                moveCaretToEnd(terminalLine);
            }
        }

        if(e.key == "ArrowDown"){
            e.preventDefault();
            if(config.commandHistoryIndex > 0) config.commandHistoryIndex--;
            if(config.commandHistoryIndex == -1){
                terminalLine.textContent = "";
            } else {
                terminalLine.textContent = config.commandHistory[config.commandHistoryIndex];
                moveCaretToEnd(terminalLine);
            }
        }
    });

    lineContainer.appendChild(terminalPath);
    lineContainer.appendChild(terminalLine);
    terminal.appendChild(lineContainer);

    terminal.scrollTop = terminal.scrollHeight;
    terminalLine.focus();
}

/*
PROGRAM SPECIFIC: for program LILYPAD ===============================================================================================
*/
function createLilypadLine(linetype, path, filename){
    let lineContainer = document.createElement('div');
    let terminalPath = document.createElement('span');
    let terminalLine = document.createElement('div');

    lineContainer.classList.add('line-container');
    terminalLine.setAttribute('contenteditable', 'true');
    terminalLine.setAttribute('data-program', `lilypad-session-${config.programSession}`);
    terminalLine.setAttribute('data-filename', filename);
    terminalLine.setAttribute('spellcheck', 'false');

    terminalPath.textContent = path;
    terminalLine.textContent = "";

    terminalLine.addEventListener('keyup', function(e){
        if(linetype == "code"){
            let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
            for(let i = 0; i < lines.length; i++){
                let lineNumber = String(i+1).padStart(3, "0");
                lines[i].previousElementSibling.textContent = lineNumber;
            }
        }
    });

    terminalLine.addEventListener('keydown', function(e){
        if(e.key == "Enter"){
            e.preventDefault();
            if(linetype == "code"){
                // get the number of lines in the lilypad session
                let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
                let lineNumber = String(+lines[lines.length - 1].previousElementSibling.textContent+1).padStart(3, '0');
                createLilypadLine("code", lineNumber, filename);
            } else {
                createLilypadLine("normal", ">", filename);
            }
        }
        if(e.key == "Backspace"){
            if(terminalLine.textContent.length == 0) {
                let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
                if(lines.length > 1){
                    let parent = document.activeElement.parentElement;

                    let previousLine = parent.previousElementSibling.children[1];
                    previousLine.textContent = previousLine.textContent + "​";

                    moveCaretToEnd(previousLine);
                    parent.remove();

                }
            }
        };
        if(e.key == "ArrowUp"){
            e.preventDefault();
            // get the lines by the data-program attribute
            let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
            let focusedLine = document.activeElement;

            let focusedLineIndex = Array.from(lines).indexOf(focusedLine);
            if(focusedLineIndex > 0){
                moveCaretToEnd(lines[focusedLineIndex - 1]);
            };
        };
        if(e.key == "ArrowDown"){
            e.preventDefault();
            let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
            let focusedLine = document.activeElement;

            let focusedLineIndex = Array.from(lines).indexOf(focusedLine);
            if(focusedLineIndex < lines.length - 1){
                moveCaretToEnd(lines[focusedLineIndex + 1]);
            };
        };
        if(e.key == "Escape"){
            let file = {
                name: null,
                permissions: {
                    read: true,
                    write: true,
                    hidden: false
                },
                data: []
            };
            let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
            for(let i = 0; i < lines.length; i++){
                file.data.push(lines[i].textContent);
                lines[i].setAttribute('contenteditable', 'false');
            };

            if(filename == undefined){
                createEditableTerminalLine(`${config.currentPath}>`);
            } else {
                file.name = filename;
                let fileIndex = config.fileSystem[config.currentPath].findIndex(file => file.name == filename);
                config.fileSystem[config.currentPath][fileIndex].data = file.data;
                createEditableTerminalLine(`${config.currentPath}>`);
            }
            config.programSession++;
        }
    });

    lineContainer.appendChild(terminalPath);
    lineContainer.appendChild(terminalLine);

    let focusedLine = document.activeElement;
    
    let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);

    if(lines.length == 0) terminal.appendChild(lineContainer);
    else focusedLine.parentElement.parentNode.insertBefore(lineContainer, focusedLine.parentElement.nextSibling);

    terminal.scrollTop = terminal.scrollHeight;
    terminalLine.focus();
}

sendCommand('[[FROGGY]]greeting', []);