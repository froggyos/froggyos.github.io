const config = {
    currentPath: 'C:/Docs',
    commandHistory: [],
    commandHistoryIndex: -1,
    timeFormat: 'w. y/m/d h:n:s',
    updateStatBar: true,
    currentProgram: "cli",
    programList: ["cli", "lilypad"],
    programSession: 0,
    errorText: "!!ERROR!! - ",
    fileSystem: {
        "C:/Docs/Test": [
            { name: "test.txt", permissions: {read: true, write: false}, data: ['test', 'test', 'multiple lines', '', '', '', '', 'test', 'ribbit!'] },
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
    } else if (typeof document.body.createTextRange !== "undefined") {
        const textRange = document.body.createTextRange();
        textRange.moveToElementText(element);
        textRange.collapse(false);
        textRange.select();
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

setInterval(updateDateTime, 1000);
updateDateTime();

// Section 2: The terminal itself.
function createTerminalLine(text, path){
    let lineContainer = document.createElement('div');
    let terminalPath = document.createElement('span');
    let terminalLine = document.createElement('div');

    lineContainer.classList.add('line-container');

    terminalPath.textContent = path;
    terminalLine.textContent = text;

    lineContainer.appendChild(terminalPath);
    lineContainer.appendChild(terminalLine);
    terminal.appendChild(lineContainer);
    terminal.scrollTop = terminal.scrollHeight;
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

        // =========================== commands ===========================
        case "clear":
            document.getElementById('terminal').innerHTML = "";
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // delete files
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
        case "hatch":
            if(args.length == 0){
                createTerminalLine("Please provide a file name.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(config.fileSystem[config.currentPath] != undefined){
                createTerminalLine("File already exists.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            config.fileSystem[config.currentPath] = [];
            config.fileSystem[config.currentPath].push({name: args[0], permissions: {read: true, write: true}, data: []});
            createTerminalLine("File created.", ">")
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "hello":
            createTerminalLine("Hello, I'm Froggy! ^v^", ">");
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "help":
            createTerminalLine("* A few basic froggyOS commands *", "");
            createTerminalLine("clear - Clears the terminal output.", ">");
            createTerminalLine("croak [file] - Deletes the file.", ">");
            createTerminalLine("ribbit [text] - Displays the text.", ">");
            createTerminalLine("formattime [time format] - Changes the time format.", ">");
            createTerminalLine("hatch [file] - Creates a file.", ">");
            createTerminalLine("hello - Displays a greeting message.", ">");
            createTerminalLine("help - Displays this message.", ">");
            createTerminalLine("hop [directory] - Moves to a directory.", ">");
            createTerminalLine("meta [file] - Edits a file.", ">");
            createTerminalLine("spawn [directory] - Creates a directory.", ">");
            createTerminalLine("swimto - Start a program.", ">");
            createEditableTerminalLine(`${config.currentPath}>`);
        break;


        // move directories
        case "hop":
            directory = args[0];
            directory = directory.replace(".", config.currentPath);
            if(directory == undefined){
                createTerminalLine("Please provide a directory name.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(config.fileSystem[directory] == undefined){
                createTerminalLine("Directory does not exist.", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            sendCommand("[[FROGGY]]changepath", [directory]);
        break;

        // edit file
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
                createLilypadLine(">", file.name);
                let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
                lines[i].textContent = file.data[i];
                moveCaretToEnd(lines[i]);
            }
        break;

        // edit file permissions
        case "metaperm":
            createTerminalLine("idek how u found this command lol im not doing it just yet LOL", "");
            createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // make directories
        case "spawn":
            directory = config.currentPath + "/" + args[0];

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

        case "swimto":
            if(!config.programList.includes(args[0])){
                createTerminalLine("Please provide a valid program.", config.errorText);
                createTerminalLine("* Available programs *", "");
                createTerminalLine(config.programList.join(), ">");
                createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            if(args[0] == "cli"){
                createEditableTerminalLine(`${config.currentPath}>`);

            } else if(args[0] == "lilypad"){
                createTerminalLine("* press ESC to exit lilypad *", "");
                createLilypadLine(">");
            }
        break;

        // =========================== hidden commands ===========================
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
            createTerminalLine("* Welcome to froggyOS, version 1.2 *" , "");
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
function createLilypadLine(path, filename){
    let lineContainer = document.createElement('div');
    let terminalPath = document.createElement('span');
    let terminalLine = document.createElement('div');

    lineContainer.classList.add('line-container');
    terminalLine.setAttribute('contenteditable', 'true');
    terminalLine.setAttribute('data-path', `${path} `);
    terminalLine.setAttribute('data-program', `lilypad-session-${config.programSession}`);
    terminalLine.setAttribute('data-filename', filename);
    terminalLine.setAttribute('spellcheck', 'false');

    terminalPath.textContent = path;
    terminalLine.textContent = "";

    terminalLine.addEventListener('keydown', function(e){
        if(e.key == "Enter"){
            e.preventDefault();
            createLilypadLine(">", filename);
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
            // this is the file data, to be stored in a path somewhere
            let file = {
                name: null,
                permissions: {
                    read: true,
                    write: true,
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
            console.log(file);
        }
    });

    lineContainer.appendChild(terminalPath);
    lineContainer.appendChild(terminalLine);
    terminal.appendChild(lineContainer);

    terminal.scrollTop = terminal.scrollHeight;
    terminalLine.focus();
}

sendCommand('[[FROGGY]]greeting', []);