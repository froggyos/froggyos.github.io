const errorText = "!!ERROR!! - ";

const config = {
    path: 'C:/>',
    commandHistory: [],
    commandHistoryIndex: -1,
    timeFormat: 'w. y/m/d h:n:s',
    updateStatBar: true,
    currentProgram: "cli",
    programList: ["cli", "lilypad"],
    programSession: 0,
}

let screen = document.getElementById('screen');
let terminal = document.getElementById('terminal');

screen.onclick = function() {
    terminal.lastChild.focus();
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
    let terminalLine = document.createElement('div');
    terminalLine.classList.add('term-line');

    terminalLine.setAttribute('data-path', `${path} `);

    terminalLine.textContent = text;

    terminal.appendChild(terminalLine);
    terminal.scrollTop = terminal.scrollHeight;
}

function sendCommand(command, args){
    command = command.trim();
    args = args.filter(arg => arg.trim() != "");

    switch(command){
        case "clear":
            document.getElementById('terminal').innerHTML = "";
            createEditableTerminalLine(config.path);
            break;

        case "ribbit":
            if(args.length == 0){
                createTerminalLine("Please provide text to display.", errorText);
                createEditableTerminalLine(config.path);
                break;
            }
            createTerminalLine(args.join(" "), ">")
            createEditableTerminalLine(config.path);
            break;

        case "formattime":
            if(args.length == 0){
                createTerminalLine("Please provide a time format. example time format below:", errorText);
                createTerminalLine("w. y/m/d h:n:s", errorText);
                createTerminalLine("If you want to include any of those key characters, prefix", errorText);
                createTerminalLine("the character with !. Example: !w", errorText);
                createEditableTerminalLine(config.path);
                break;
            }
            if(args.join(" ").length > 63){
                createTerminalLine("The argument is too long.", errorText);
                createEditableTerminalLine(config.path);
                break;
            }
            config.timeFormat = args.join(" ");
            createEditableTerminalLine(config.path);
            break;

        case "hello":
            createTerminalLine("Hello, I'm Froggy! ^v^", ">");
            createEditableTerminalLine(config.path);
            break;

        case "help":
            createTerminalLine("* A few basic froggyOS commands *", "");
            createTerminalLine("clear - Clears the terminal output.", ">");
            createTerminalLine("ribbit [text] - Displays the text.", ">");
            createTerminalLine("formattime [time format] - Changes the time format.", ">");
            createTerminalLine("hello - Displays a greeting message.", ">");
            createTerminalLine("help - Displays this message.", ">");
            createTerminalLine("swimto - Start a program.", ">");
            createEditableTerminalLine(config.path);
            break;

        case "swimto":
            if(!config.programList.includes(args[0])){
                createTerminalLine("Please provide a valid program.", errorText);
                createTerminalLine("* Available programs *", "");
                createTerminalLine(config.programList.join(), ">");
                createEditableTerminalLine(config.path);
                break;
            }

            if(args[0] == "cli"){
                createEditableTerminalLine(config.path);

            } else if(args[0] == "lilypad"){
                createTerminalLine("* press ESC to exit program *", "");
                createLilypadLine(">");
            }
        break;

        case "[[FROGGY]]changepath":
            if(args.length == 0){
                createTerminalLine("Please provide a path.", errorText);
                createEditableTerminalLine(config.path);
                break;
            }
            config.path = args.join(" ");
            createEditableTerminalLine(config.path);
            break;

        case '[[FROGGY]]greeting':
            createTerminalLine("Type ‘help’ to receive support with commands, and possibly navigation.", "");
            createTerminalLine("* Welcome to froggyOS, version 1.1 *" , "");
            createEditableTerminalLine(config.path);
            break;

        case '[[FROGGY]]help':
            createTerminalLine("* A few frog commands *", "");
            createTerminalLine("[[FROGGY]]changepath [path] - Changes the path of the terminal", ">");
            createTerminalLine("[[FROGGY]]greeting - Displays the greeting message", ">");
            createTerminalLine("[[FROGGY]]help - Displays this message", ">");
            createTerminalLine("[[FROGGY]]setstatbar [text] - Changes the text in the status bar", ">");
            createTerminalLine("[[FROGGY]]statbarlock [0/1] - Locks the status bar from updating", ">");
            createEditableTerminalLine(config.path);
            break;

        case '[[FROGGY]]setstatbar':
            if(args.length > 80){
                createTerminalLine("The argument is too long.", errorText);
                createEditableTerminalLine(config.path);
                break;
            }
            document.getElementById('bar').textContent = args.join(" ");
            createEditableTerminalLine(config.path);
            break;

        case '[[FROGGY]]statbarlock':
            let bool = args[0];
            if(bool == "1"){
                config.updateStatBar = false;
            } else if(bool == "0"){
                config.updateStatBar = true;
            } else {
                createTerminalLine("Invalid argument. Please provide '1' or '0'.", errorText);
            }
            createEditableTerminalLine(config.path);
            break;

        default:
            createTerminalLine(`Froggy doesn't know "${command}", sorry.`, ">");
            createEditableTerminalLine(config.path);
            break;
    }
}

/*
create a line for user input
path - the path

PROGRAM SPECIFIC: for program CLI
*/
function createEditableTerminalLine(path){
    let terminalLine = document.createElement('div');

    terminalLine.classList.add('term-line');

    terminalLine.setAttribute('contenteditable', 'true');
    terminalLine.setAttribute('data-path', `${path} `);
    terminalLine.setAttribute('spellcheck', 'false');

    terminalLine.textContent = "​";

    terminalLine.addEventListener('keydown', function(e){
        if(e.key == "Enter"){
            e.preventDefault();
            terminalLine.setAttribute('contenteditable', 'false');
            let userInput = terminalLine.textContent.replace("​", "");
            let args = userInput.split(" ");

            terminalLine.innerHTML = terminalLine.innerHTML.replaceAll("<div>&ZeroWidthSpace;</div>", "");
            terminalLine.innerHTML = terminalLine.innerHTML.replaceAll("<div><br></div>", "");

            let command = args[0].trim();
            args = args.slice(1);

            if(userInput.trim() == ""){
                createTerminalLine("Froggy doesn't like that. >:(", path);
                createEditableTerminalLine(path);
            } else {
                config.commandHistory.reverse();
                config.commandHistory.push(userInput);
                config.commandHistory.reverse();
                config.commandHistoryIndex = -1;

                sendCommand(command, args);
            }
        }

        if(e.key == "Backspace"){
            if(terminalLine.textContent.length == 0) terminalLine.textContent = "​";
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

    terminal.appendChild(terminalLine);
    terminal.scrollTop = terminal.scrollHeight;
    terminalLine.focus();
}

/*
PROGRAM SPECIFIC: for program LILYPAD
*/
function createLilypadLine(path){
    let terminalLine = document.createElement('div');

    terminalLine.classList.add('term-line');

    terminalLine.setAttribute('contenteditable', 'true');
    terminalLine.setAttribute('data-path', `${path} `);
    terminalLine.setAttribute('data-program', `lilypad-session-${config.programSession}`);
    terminalLine.setAttribute('spellcheck', 'false');

    terminalLine.textContent = "​";

    terminalLine.addEventListener('keyup', function(e){
        if(terminalLine.textContent.length == 0) terminalLine.textContent = "​";
    });

    terminalLine.addEventListener('keydown', function(e){
        if(e.key == "Enter"){
            e.preventDefault();
            createLilypadLine(">");
        }
        if(e.key == "Backspace"){
            if(terminalLine.textContent == "​") {
                let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
                let focusedLine = document.activeElement;
                let focusedLineIndex = Array.from(lines).indexOf(focusedLine);
                if(focusedLineIndex > 0){
                    lines[focusedLineIndex - 1].focus();
                    moveCaretToEnd(lines[focusedLineIndex - 1]);
                    focusedLine.remove();
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

            createTerminalLine("What would you like to call this file?", ">");
            let submit = document.createElement('div');
            submit.classList.add('term-line');
            submit.setAttribute('contenteditable', 'true');
            submit.setAttribute('data-path', `${path} `);
            submit.setAttribute('data-program', `lilypad-session-${config.programSession}`);
            submit.setAttribute('spellcheck', 'false');
            submit.textContent = "​";

            submit.addEventListener('keydown', function(e){
                if(e.key == "Enter"){
                    e.preventDefault();
                    if(submit.textContent.trim() == "​"){
                        createTerminalLine("Please provide a file name.", errorText);
                        terminal.appendChild(submit);
                        moveCaretToEnd(submit);
                        return;
                    } else {
                        file.name = submit.textContent;
                        createTerminalLine("File saved.", ">");
                        console.log(file);
                        createEditableTerminalLine(config.path);
                    }
                }
            });

            terminal.appendChild(submit);
            terminal.scrollTop = terminal.scrollHeight;
            submit.focus();

            config.programSession++;
        }
    });

    terminal.appendChild(terminalLine);
    terminal.scrollTop = terminal.scrollHeight;
    terminalLine.focus();
}

sendCommand('[[FROGGY]]greeting', []);