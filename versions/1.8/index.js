// new AllSniffer({timerOptions: {intervalIDsToExclude: [1,2,3,4]}});

let screen = document.getElementById('screen');
let terminal = document.getElementById('terminal');

document.body.onclick = function() {
    try {
        terminal.lastChild.lastChild.focus();
    } catch (err) { };
}

function setSetting(setting, value) {
    if(typeof value === 'object') config.fileSystem["Settings:"].find(file => file.name == setting).data = value;
    else config.fileSystem["Settings:"].find(file => file.name == setting).data[0] = value;
}

function getSetting(setting, isArray) {
    let data = config.fileSystem["Settings:"].find(file => file.name == setting).data;
    if(isArray) return data;
    return data[0];
}

function setConfigFromSettings(){
    if(config.savingFile) return;
    config.debugMode = (getSetting("debugMode") === "true");
    config.version = getSetting("version");
    config.colorPalette = getSetting("colorPalette");
    config.showSpinner = (getSetting("showSpinner") === "true");
    config.currentSpinner = getSetting("currentSpinner");
    config.timeFormat = getSetting("timeFormat");
    config.updateStatBar = (getSetting("updateStatBar") === "true");
    config.allowedProgramDirectories = getSetting("allowedProgramDirectories", true);
    config.dissallowSubdirectoriesIn = getSetting("dissallowSubdirectoriesIn", true);
}

function programList(){
    // here, eventually sync the configs changed to files with their config object counterparts, to avoid refactoring literally everything
    let files = [];
    for(let directory of config.allowedProgramDirectories){
        if(config.fileSystem[directory] == undefined) continue;
        if(config.fileSystem[directory].length == files.length && config.fileSystem[directory].every((file, index) => file.name == files[index])) continue;

        files = files.concat(config.fileSystem[directory]);
    }
    files = files.map(file => file.name);
    config.programList = files;

    // for all the programs, if there is not a corresponding file in the D:Program-Data directory, create one
    for(let program of config.programList){
        if(getFileWithName("D:/Program-Data", program) == undefined){
            config.fileSystem["D:/Program-Data"].push({
                name: program,
                properties: {
                    read: false,
                    write: false,
                    hidden: false
                },
                data: [""]
            });
        }
    }

    if(config.debugMode) {
        document.body.style.cursor = "pointer";
        document.getElementById('froggyscript-debug-button').style.display = 'block';
        document.getElementById('debug-program-memory').style.display = 'block';
        document.getElementById('debug-os').style.display = 'block';

        document.getElementById('debug-os').textContent = "os memory:\n"+JSON.stringify(config, null, 1);
    } else {
        document.body.style.cursor = "false";
        document.getElementById('froggyscript-debug-button').style.display = 'none';
        document.getElementById('debug-program-memory').style.display = 'none';
        document.getElementById('debug-os').style.display = 'none';
    }
}

function updateDateTime() {
    if(!config.updateStatBar) return;
    const now = new Date();

    const dowListShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dowListLong = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthListShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthListLong = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const dayOfWeekShort = dowListShort[now.getDay()];
    const dayOfWeekLong = dowListLong[now.getDay()];

    const year = now.getFullYear();

    const monthNumber = String(now.getMonth() + 1).padStart(2, '0');
    const monthNumberUnpadded = String(now.getMonth() + 1);
    const monthShort = monthListShort[now.getMonth()];
    const monthLong = monthListLong[now.getMonth()]; 

    const day = String(now.getDate()).padStart(2, '0');
    const dayUnpadded = String(now.getDate());
    const ordinalDay = String(now.getDate()) + getOrdinalSuffix(+day);

    const hour24 = String(now.getHours()).padStart(2, '0');
    const hour12 = String((now.getHours() + 11) % 12 + 1).padStart(2, '0');
    const hour24Unpadded = String(now.getHours());
    const hour12Unpadded = String((now.getHours() + 11) % 12 + 1);

    const minute = String(now.getMinutes()).padStart(2, '0');
    const minuteUnpadded = String(now.getMinutes());

    const second = String(now.getSeconds()).padStart(2, '0');
    const secondUnpadded = String(now.getSeconds());

    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';

    const timezone = new Date().toLocaleString(["en-US"], {timeZoneName: "short"}).split(" ").pop();

    function getOrdinalSuffix(num) {
        if (typeof num !== "number" || isNaN(num)) return "";
    
        let lastDigit = num % 10;
        let lastTwoDigits = num % 100;
    
        if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return "th";
    
        switch (lastDigit) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    }


    let dateTemplate = config.timeFormat;

    // totally not ai
    const replacements = [
        { char: 'w', value: dayOfWeekShort },
        { char: 'W', value: dayOfWeekLong },

        { char: 'y', value: year },

        { char: 'mn', value: monthNumber },
        { char: 'mnu', value: monthNumberUnpadded },
        { char: "ms", value: monthShort },
        { char: "M", value: monthLong },

        { char: 'd', value: day },
        { char: 'du', value: dayUnpadded },
        { char: "D", value: ordinalDay },

        { char: 'h', value: hour24 },
        { char: 'hu', value: hour24Unpadded },
        { char: 'H', value: hour12 },
        { char: 'Hu', value: hour12Unpadded },

        { char: 'm', value: minute },
        { char: 'mu', value: minuteUnpadded },

        { char: 's', value: second },
        { char: 'su', value: secondUnpadded },

        { char: 'a', value: ampm },

        { char: 'z', value: timezone },
    ];

    let replacementMap = Object.fromEntries(replacements.map(({ char, value }) => [char, value]));

    let dateString = dateTemplate.replace(/!([a-zA-Z]+)/g, "!$1") // Preserve escaped characters
        .replace(/\b([a-zA-Z]+)\b/g, (match) => replacementMap[match] ?? match); // Replace only whole words


    if(!config.showSpinner) document.getElementById('bar').textContent = dateString.padEnd(79," ");
    else {
        let spinnerFrames = config.fileSystem["D:/Spinners"].find(spinner => spinner.name == config.currentSpinner).data;
        document.getElementById('bar').textContent = dateString.padEnd(79," ").slice(0, -1) + spinnerFrames[config.spinnerIndex % spinnerFrames.length];
        config.spinnerIndex++;
    }
}

setInterval(() => {
    setConfigFromSettings()
    programList()
    updateDateTime()
}, 1);

setInterval(() => {
    updateDateTime()
}, 1000);

setConfigFromSettings()
programList();
updateDateTime();

// CSS STYLING ==============================================================================================
const defaultStyling = `
    --void-space: var(--c00);

    --bar-background: var(--c01);
    --bar-text: var(--c15);

    --terminal-background: var(--c15);

    --terminal-line-background: var(--c15);
    --terminal-line-highlighted-background: var(--c14);
    --terminal-line-text: var(--c02);
    --terminal-line-selection-background: var(--c02);
    --terminal-line-selection-text: var(--c15);

    --error-background: var(--c12);
    --error-text: var(--c15);

    --prompt-selected-background: var(--c02);
    --prompt-selected-text: var(--c15);
`

let resetStyling = () => {
    let root = document.querySelector(':root');
    let defaultStylingArray = defaultStyling.split("\n");
    for(let line of defaultStylingArray){
        if(line == "") continue;
        let [property, value] = line.split(":");
        root.style.setProperty(property.trim(), value.trim().replace(";",""));
    }
}

function changeColorPalette(name){
    const colorPalettes = createPalettesObject();
    let palette = colorPalettes[name];
    let root = document.querySelector(':root');
    for(let color in palette){
        root.style.setProperty(`--${color}`, palette[color]);
    }

    setSetting("colorPalette", name);
    config.colorPalette = name;

    resetStyling();
    if(name == "standard"){
    }
    if(name == "revised"){
    }
    if(name == "cherry"){
        root.style.setProperty(`--terminal-line-highlighted-background`, "var(--c10)");
        root.style.setProperty(`--error-background`, "var(--c04)");
    }
    if(name == "swamp"){
        root.style.setProperty(`--error-background`, "var(--c04)");
    }
    if(name == "swamp-revised"){
        root.style.setProperty(`--error-background`, "var(--c04)");
    }
    createColorTestBar();
}

function createColorTestBar(){
    const colorPalettes = createPalettesObject();

    // remove all the children of the color test bar
    document.getElementById('color-test-bar').innerHTML = "";
    function getContrastYIQ(hexColor) {
        if (!/^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(hexColor)) {
            createTerminalLine(`PaletteError: ${hexColor} is an invalid hex color.`, config.errorText);
            return 
        }
        
        if (hexColor.length === 4) {
            hexColor = `#${hexColor[1]}${hexColor[1]}${hexColor[2]}${hexColor[2]}${hexColor[3]}${hexColor[3]}`;
        }
        
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;
        
        return yiq >= 128 ? "c00" : "c15";
    }
    let squareContainer = document.getElementById('color-test-bar');
    squareContainer.innerHTML = "";
    squareContainer.style.position = "absolute";
    squareContainer.style.top = "0px";
    squareContainer.style.left = "0px";

    for(let i = 0; i < Object.keys(colorPalettes[config.colorPalette]).length; i++){
        let color = Object.keys(colorPalettes[config.colorPalette])[i];
        let text = `<br><br><br><br><br><br>${color}<br>${colorPalettes[config.colorPalette][color].replace("#","")}`
        let square = document.createElement('div');

        square.innerHTML = text;
        square.style.backgroundColor = `var(--${color})`;
        square.style.color = `var(--${getContrastYIQ(colorPalettes[config.colorPalette][color])})`;
        square.style.width = "48px";
        square.style.height = "48px";
        square.style.position = "absolute";
        square.style.left = `${(i % 8) * 48}px`;
        square.style.top = `${Math.floor(i / 8) * 48}px`;
        square.style.fontSize = "6px";
        squareContainer.appendChild(square);
        if(i == Object.keys(colorPalettes[config.colorPalette]).length / 2){
            squareContainer.appendChild(document.createElement('br'));
        }
    }
    document.body.appendChild(squareContainer);
}

// helper functions
function createPalettesObject(){
    let paletteDir = config.fileSystem["D:/Palettes"];
    let palettes = {};

    const colorArray = ["c00", "c01", "c02", "c03", "c04", "c05", "c06", "c07", "c08", "c09", "c10", "c11", "c12", "c13", "c14", "c15"];

    try {
        for(let palette of paletteDir){
            palettes[palette.name] = {};
            for(let i = 0; i < palette.data.length; i++){
                palettes[palette.name][colorArray[i]] = "#"+palette.data[i];
            }
        }
    } catch (err) {
        createTerminalLine("Could not create palette.", config.errorText)
    }

    return palettes;
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

function createTerminalLine(text, path, formatting){
    let lineContainer = document.createElement('div');
    let terminalPath = document.createElement('span');
    let terminalLine = document.createElement('div');

    lineContainer.classList.add('line-container');

    terminalPath.innerHTML = path;

    if(formatting != undefined){
        let html = '';
        for(let i = 0; i < text.length; i++){
            let properties = [];
            let character = text[i];
            let span = "<span "

            for(let j = 0; j < formatting.length; j++){
                let format = formatting[j]

                if(format.type == "blanket"){
                    if(format?.t) {
                        if(format.t.length != 3) {
                            createTerminalLine("Invalid FormatObject (INTER-RULE DELIMITER) syntax.", `${config.errorText}`);
                            createTerminalLine("Error Data UNAVAILABLE", `${config.errorText}`);
                            return;
                        }
                        properties.push(`color: var(--${format.t})`)
                    }
                    if(format?.b) {
                        if(format.b.length != 3) {
                            createTerminalLine("Invalid FormatObject (INTER-RULE DELIMITER) syntax.", `${config.errorText}`);
                            createTerminalLine("Error Data UNAVAILABLE", `${config.errorText}`);
                            return;
                        }
                        properties.push(`background-color: var(--${format.b})`)
                    }
                    if(format?.i) if(format.i == "1") properties.push(`font-style: italic`)
                } else if (format.type == "range"){
                    if(format?.t){
                        let start = format.tr_start;
                        let end = format.tr_end;

                        if(i >= start && i <= end){
                            properties.push(`color: var(--${format.t})`)
                        }                        
                    } else if (format?.b){
                        let start = format.br_start;
                        let end = format.br_end;

                        if(i >= start && i <= end){
                            properties.push(`background-color: var(--${format.b})`)
                        }
                    } else if (format?.i){
                        let start = format.ir_start;
                        let end = format.ir_end;

                        if(i >= start && i <= end){
                            if(format.i == "1") properties.push(`font-style: italic`)
                        } 
                    }
                }
            }
            span += `style="${properties.join(";")}">${character}</span>`
            html += span;
        }
        terminalLine.innerHTML = html;
    } else {
        terminalLine.textContent = text;
    }

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

function cleanQuotes(input){
    return input.replaceAll(/["']/g, '');
}

function evaluate(string){
    try {
        if(/`([^`\\]*(\\.[^`\\]*)*)`/g.test(string)){
            throw new Error();
        }
        parsedString = new Function(`return (${string});`)();
        return parsedString;
    } catch (err) {
        return null;
    }
}

function updateLineHighlighting() {
    let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
    lines.forEach(line => {
        if (document.activeElement === line) {
            line.style.background = "var(--terminal-line-highlighted-background)";
        } else {
            line.style.background = "var(--terminal-line-background)";
        }
    });
}

function sendCommand(command, args, createEditableLineAfter){
    if(createEditableLineAfter == undefined) createEditableLineAfter = true;
    command = command.trim();
    args = args.filter(arg => arg.trim() != "");
    let directory;
    let file;

    switch(command){
        case "":
            createTerminalLine("Froggy doesn't like that. >:(", "");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // commands =========================================================================================================================================================
        // change color palette
        case "changepalette": {
            let colorPalettes = createPalettesObject();
            if(args.length == 0){
                createTerminalLine("Please provide a color palette name.", config.errorText);
                createTerminalLine(`* Available color palettes *`, "");
                createTerminalLine(Object.keys(colorPalettes).join(", "), ">");
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(colorPalettes[args[0]] == undefined){
                createTerminalLine("Color palette does not exist.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            changeColorPalette(args[0]);
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        case "cl":
        case "clear":
            document.getElementById('terminal').innerHTML = "";
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // clear froggyOS state
        case "cls":
        case "clearstate":
            localStorage.removeItem(`froggyOS-state-${config.version}`);
            createTerminalLine("State cleared.", ">")
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // delete files
        case "c":
        case "croak":
            if(args.length == 0){
                createTerminalLine("Please provide a file name.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file = config.fileSystem[config.currentPath];
            if(file == undefined){
                createTerminalLine("File does not exist.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file = file.find(file => file.name == args[0]);
            if(file == undefined){
                createTerminalLine("File does not exist.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(file.properties.write == false){
                createTerminalLine("You do not have permission to delete this file.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            // if we are in the Settings: directory, do not allow the user to delete the file
            if(config.currentPath.split(":")[0] == "Settings"){
                createTerminalLine("You cannot delete this file.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            let fileIndex = config.fileSystem[config.currentPath].findIndex(file => file.name == args[0]);
            delete config.fileSystem[config.currentPath][fileIndex];
            config.fileSystem[config.currentPath] = config.fileSystem[config.currentPath].filter(file => file != undefined);

            createTerminalLine("File deleted.", ">")
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "ft":
        case "formattime":
            if(args.length == 0){
                createTerminalLine("Please provide a time format.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(args.join(" ").length > 59){
                createTerminalLine("The argument is too long.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            setSetting("timeFormat", args.join(" "));
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // make files
        case "ch":
        case "hatch":
            if(args.length == 0){
                createTerminalLine("Please provide a file name.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(config.fileSystem[config.currentPath] == undefined){
                createTerminalLine("Directory does not exist.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
            }
            if(config.fileSystem[config.currentPath].find(file => file.name == args[0]) != undefined){
                createTerminalLine("File already exists.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            config.fileSystem[config.currentPath].push({
                name: args[0],
                properties: {
                    read: true,
                    write: true,
                    hidden: false
                }, 
                data: [""]
            });
            createTerminalLine("File created.", ">")
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "hello":
            createTerminalLine("Hello, I'm Froggy! ^v^", ">");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "?":
        case "help":
            createTerminalLine("* A few basic froggyOS commands *", "");
            createTerminalLine("changepalette [palette]. . . . Changes the color palette.", ">");
            createTerminalLine("clear. . . . . . . . . . . . . Clears the terminal output.", ">");
            createTerminalLine("clearstate . . . . . . . . . . Clears froggyOS state.", ">");
            createTerminalLine("croak [file] . . . . . . . . . Deletes the file.", ">");
            createTerminalLine("ribbit [text]. . . . . . . . . Displays the text.", ">");
            createTerminalLine("formattime [format]. . . . . . Changes the time format.", ">");
            createTerminalLine("hatch [file] . . . . . . . . . Creates a file.", ">");
            createTerminalLine("hello. . . . . . . . . . . . . Displays a greeting message.", ">");
            createTerminalLine("help . . . . . . . . . . . . . Displays this message.", ">");
            createTerminalLine("hop [directory]. . . . . . . . Moves to a directory.", ">");
            createTerminalLine("list . . . . . . . . . . . . . Lists files and subdirectories in the current                                directory.", ">");
            createTerminalLine("listdrives . . . . . . . . . . Lists all drives.", ">");
            createTerminalLine("loadstate. . . . . . . . . . . Load froggyOS state.", ">");
            createTerminalLine("meta [file]. . . . . . . . . . Edits a file.", ">");
            createTerminalLine("metaprop [file] [perm] [0/1] . Edits a file's properties.", ">");
            createTerminalLine("opendocumentation. . . . . . . Opens the froggyOS documentation.", ">");
            createTerminalLine("savestate. . . . . . . . . . . Save froggyOS state.", ">");
            createTerminalLine("spawn [directory]. . . . . . . Creates a directory.", ">");
            createTerminalLine("spy [file] . . . . . . . . . . Reads the file.", ">");
            createTerminalLine("swimto [program] . . . . . . . Start a program.", ">");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;


        // move directories
        case "h":
        case "hop":
            directory = args[0];

            if(directory == undefined){
                createTerminalLine("Please provide a directory name.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            directory = directory.replace(".", config.currentPath);
            if(directory == "~") directory = config.currentPath.split("/")[0];
            if(directory == "-") directory = config.currentPath.split("/").slice(0, -1).join("/");

            if(config.fileSystem[directory] == undefined){
                createTerminalLine("Directory does not exist.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            sendCommand("[[BULLFROG]]changepath", [directory], createEditableLineAfter);
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
            files = files.filter(file => file.properties.hidden == false);

            if(files.length == 0 && subdirectoryNames.length == 0){
                createTerminalLine("This directory is empty.", ">")
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            subdirectoryNames.forEach(subdirectory => {
                createTerminalLine(` [DIR] ${subdirectory}`, ">")
            });
            files.forEach(file => {
                createTerminalLine(`       ${file.name}`, ">")
            });
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "ld":
        case "listdrives": {
            let drives = Object.keys(config.fileSystem).map(drive => drive.split(":"))
            drives = [...new Set(drives.filter(drive => drive.length == 2).map(drive => drive[0]))].map(drive => drive + ":");

            drives.forEach(drive => {
                createTerminalLine(`${drive}`, ">");
            });
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        // load state
        case "lds":
        case "loadstate":
            let state = localStorage.getItem(`froggyOS-state-${config.version}`);
            if(state == null){
                createTerminalLine("No state found.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            for(let key in JSON.parse(state)){
                config[key] = JSON.parse(state)[key];
            }

            changeColorPalette(config.colorPalette);

            createTerminalLine("State loaded.", ">")
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "/":
        case "macro": {
            if(args.length == 0){
                createTerminalLine("Please provide a macro name.", config.errorText);
                createTerminalLine(`* Available macros *`, "");
                let macros = config.fileSystem["D:/Macros"];
                if(macros == undefined){
                    createTerminalLine("No macros found.", config.errorText);
                } else {
                    createTerminalLine(macros.map(macro => macro.name).join(", "), ">")
                }
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            let macro = getFileWithName("D:/Macros", args[0]);

            config.fileSystem["D:/Macros"].forEach(_macro => {
                if(_macro.data[0].startsWith("!") && _macro.data[0].slice(1).trim() == args[0]){
                    macro = _macro;
                }
            });
            
            if(macro == undefined){
                createTerminalLine("Macro does not exist.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            macro = JSON.parse(JSON.stringify(macro));
            let totalFileArguments = 0;

            macro.data.forEach(line => {
                if(line.includes("$")){
                    // if the number behind $ is greater than the totalFileArguments, set totalFileArguments to that number
                    let fileArgument = parseInt(line.split("$")[1].split(" ")[0]);
                    if(fileArgument > totalFileArguments) totalFileArguments = fileArgument;
                }
            });

            if(args.length - 1 < totalFileArguments){
                createTerminalLine(`Missing file argument(s).`, config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            let fileArguments = {};

            for(let i = 1; i < args.length; i++){
                fileArguments["$" + i] = args[i];
            }

            // go through each line, replace the file arguments
            macro.data = macro.data.map(line => {
                for(let fileArgument in fileArguments){
                    line = line.replaceAll(fileArgument, fileArguments[fileArgument]);
                }
                return line;
            });

            if(macro.data[0].startsWith("!")) macro.data.shift();

            macro.data.forEach(line => {
                let cmd = line.split(" ")[0];
                let args = line.split(" ").slice(1);

                sendCommand(cmd, args, false);
            });

            if(createEditableLineAfter && config.currentProgram == "cli") createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        // edit file
        case "m":
        case "meta":
            if(args.length == 0){
                createTerminalLine("Please provide a file name.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file = config.fileSystem[config.currentPath];
            if(file == undefined){
                createTerminalLine("File does not exist.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file = file.find(file => file.name == args[0]);
            if(file == undefined){
                createTerminalLine("File does not exist.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(file.properties.write == false){
                createTerminalLine("You do not have permission to edit this file.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            createTerminalLine("* press ESC to save and exit lilypad *", "");
            for(let i = 0; i < file.data.length; i++){
                if(config.allowedProgramDirectories.includes(config.currentPath)){
                    createLilypadLine(String(i+1).padStart(3, "0"), "code", file.name);
                } else if (config.currentPath == "D:/Palettes") {
                    createLilypadLine(String(i).padStart(2, "0"), "palette", file.name);
                } else createLilypadLine(">", undefined, file.name);
                let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
                lines[i].textContent = file.data[i];
                moveCaretToEnd(lines[i]);
            }
        break;

        // edit file properties
        case "mp":
        case "metaprop":
            file = getFileWithName(config.currentPath, args[0]);

            let property = args[1];
            let value = args[2];
            if(file == undefined){
                createTerminalLine("File does not exist.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            let propertyTypes = Object.keys(file.properties);

            if(property == undefined || propertyTypes.includes(property) == false){
                createTerminalLine("Please provide a valid property type.", config.errorText);
                createTerminalLine("* Available properties *", "");
                createTerminalLine(propertyTypes.join(", "), ">");
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            if(value == undefined || (value != "0" && value != "1")){
                createTerminalLine("Please provide a valid value. 0 or 1.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break
            }

            if(file.properties.write == false){
                createTerminalLine("You do not have permission to edit this file.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            file.properties[property] = value == "1" ? true : false;
            createTerminalLine("properties updated.", ">")

            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "docs":
        case "opendocumentation": {

            new MarkdownParser("url", `https://froggyos.xyz/versions/${config.version}/README.md`)
            .newWindowArgs("height=850,width=700")
            .toc(true)
            .title(`froggyOS v. ${config.version} Documentation`)
            .generate()
            .open("newWindow");

            createTerminalLine("Documentation opened in a new window.", ">");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        case "ribbit":
            if(args.length == 0){
                createTerminalLine("Please provide text to display.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            createTerminalLine(args.join(" "), ">")
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // save state
        case "svs":
        case "savestate":
            localStorage.setItem(`froggyOS-state-${config.version}`, JSON.stringify(config));
            createTerminalLine("State saved. May need to loadstate for some changes to take effect.", ">")
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // make directories
        case "s":
        case "spawn":
            directory = config.currentPath + "/" + args[0];

            if(config.dissallowSubdirectoriesIn.includes(config.currentPath)){
                createTerminalLine("You cannot create directories in this directory.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(args[0] == undefined){
                createTerminalLine("Please provide a directory name.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(config.fileSystem[directory] != undefined){
                createTerminalLine("Directory already exists.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            config.fileSystem[directory] = [];
            createTerminalLine("Directory created.", ">");
            sendCommand("[[BULLFROG]]changepath", [directory], createEditableLineAfter);
        break;

        // read file contents
        case "spy":
            if(args.length == 0){
                createTerminalLine("Please provide a file name.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file = config.fileSystem[config.currentPath];
            if(file == undefined){
                createTerminalLine("File does not exist.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file = file.find(file => file.name == args[0]);
            if(file == undefined){
                createTerminalLine("File does not exist.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(file.properties.read == false){
                createTerminalLine("You do not have permission to read this file.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file.data.forEach(line => {
                createTerminalLine(line, ">")
            });
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "st":
        case "swimto":
            if(!config.programList.includes(args[0])){

                let programList = [];

                // if the file is hidden, do not show it in the program list
                for(let directory of config.allowedProgramDirectories){
                    programList = programList.concat(config.fileSystem[directory].filter(file => file.properties.hidden == false).map(file => file.name));
                }

                createTerminalLine("Please provide a valid program.", config.errorText);
                createTerminalLine("* Available programs *", "");
                createTerminalLine(programList.join(", "), ">");
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            config.programSession++
            if(args[0] == "cli"){
                config.currentProgram = "cli";
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
            } else if(args[0] == "lilypad"){
                config.currentProgram = "lilypad";
                createTerminalLine("* press ESC to exit lilypad *", "");
                createLilypadLine(">", undefined, undefined);
            } else {
                let file;
                for(let directory of config.allowedProgramDirectories){
                    file = getFileWithName(directory, args[0]);
                    if(file != undefined) break;
                }
                if(file.properties.read == false){
                    createTerminalLine("You do not have permission to run this program.", config.errorText);
                    if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                    break;
                }

                let formatted = format(file.data);
                if(formatted.errors.length > 0){
                    createTerminalLine(formatted.errors[0], config.errorText);
                    if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                } else {
                    config.currentProgram = args[0];
                    // interpret the formatted code
                    interpreter(formatted);
                }
            }
        break;

        // hidden commands =======================================================================================================================================
        case "[[BULLFROG]]changepath":
            if(args.length == 0){
                createTerminalLine("Please provide a path.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            config.currentPath = args.join(" ");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case '[[BULLFROG]]greeting': {
            createTerminalLine("Type ‘help’ to receive support with commands, and possibly navigation.", "");
            createTerminalLine(`* Welcome to froggyOS, version ${config.version} *` , "");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        case '[[BULLFROG]]help':
            createTerminalLine("* A few bullfrog commands *", "");
            createTerminalLine("[[BULLFROG]]changepath [path] - Changes the path of the terminal", ">");
            createTerminalLine("[[BULLFROG]]greeting - Displays the greeting message", ">");
            createTerminalLine("[[BULLFROG]]help - Displays this message", ">");
            createTerminalLine("[[BULLFROG]]setstatbar [text] - Changes the text in the status bar", ">");
            createTerminalLine("[[BULLFROG]]statbarlock [0/1] - Locks the status bar from updating", ">");
            createTerminalLine("[[BULLFROG]]showspinner [0/1] - Toggles the loading spinner", ">");
            createTerminalLine("[[BULLFROG]]debugmode [0/1] - Toggles debug mode", ">");
            createTerminalLine("[[BULLFROG]]setspinner [spinner] - Changes the loading spinner", ">");
            createTerminalLine("[[BULLFROG]]urgentsavestate - saves state for reloading", ">");
            createTerminalLine("[[BULLFROG]]urgentloadstate - loads state for reloading", ">");
            createTerminalLine("[[BULLFROG]]urgentclearstate - clears reload state", ">");
            createTerminalLine("[[BULLFROG]]autoloadstate - loads state", ">");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case '[[BULLFROG]]setstatbar':
            if(args.length > 79){
                createTerminalLine("The argument is too long.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            document.getElementById('bar').textContent = args.join(" ");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case '[[BULLFROG]]showspinner':
            let bool = args[0];
            if(bool == "1") setSetting("showSpinner", "true");
            else if(bool == "0") setSetting("showSpinner", "false");
            else createTerminalLine("Invalid argument. Please provide '1' or '0'.", config.errorText);
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case '[[BULLFROG]]statbarlock': {
            let bool = args[0];
            if(bool == "1") setSetting("updateStatBar", "false");
            else if(bool == "0") setSetting("updateStatBar", "true");
            else createTerminalLine("Invalid argument. Please provide '1' or '0'.", config.errorText);
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;
        
        case "[[BULLFROG]]debugmode": {
            let bool = args[0];
            if(bool == "1") {
                setSetting("debugMode", "true");
            }
            else if(bool == "0") {
                setSetting("debugMode", "false");
            }
            else createTerminalLine("Invalid argument. Please provide '1' or '0'.", config.errorText);
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        case "[[BULLFROG]]setspinner": {
            let spinner = args[0];
            // check if spinner is a valid spinner
            if(config.fileSystem["D:/Spinners"].find(spinner_ => spinner_.name == spinner) == undefined){
                createTerminalLine("Spinner does not exist.", config.errorText);
                createTerminalLine(`* Available spinners *`, "");
                createTerminalLine(config.fileSystem["D:/Spinners"].map(spinner_ => spinner_.name).join(", "), ">");
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            } else {
                setSetting("currentSpinner", spinner);
            }
        } break;

        case "[[BULLFROG]]urgentsavestate": {
            localStorage.setItem("froggyOS-urgent-state", JSON.stringify(config));
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        case "[[BULLFROG]]urgentloadstate": {
            let state = localStorage.getItem("froggyOS-urgent-state");
            if(state == null){
                createTerminalLine("No urgent state found.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            for(let key in JSON.parse(state)){
                config[key] = JSON.parse(state)[key];
            }

            changeColorPalette(config.colorPalette);

            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        case "[[BULLFROG]]urgentclearstate": {
            localStorage.removeItem("froggyOS-urgent-state");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        case "[[BULLFROG]]autoloadstate": {
            let state = localStorage.getItem(`froggyOS-state-${config.version}`);
            if(state != null){
                for(let key in JSON.parse(state)){
                    config[key] = JSON.parse(state)[key];
                }
                changeColorPalette(config.colorPalette);
            }
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        default:
            createTerminalLine(`Froggy doesn't know "${command}", sorry.`, ">");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
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
        if(e.key == "Enter"){
            e.preventDefault();
        }
    });

    terminalLine.addEventListener('keyup', function(e){
        let userInput = terminalLine.textContent;
        
        e.stopImmediatePropagation();
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
function createLilypadLine(path, linetype, filename){
    config.currentProgram = "lilypad";
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

    let highlightedLineUpdater = setInterval(updateLineHighlighting, 1);

    terminalLine.addEventListener('keyup', function(e){
        if(linetype == "code"){
            let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
            for(let i = 0; i < lines.length; i++){
                let lineNumber = String(i+1).padStart(3, "0");
                lines[i].previousElementSibling.textContent = lineNumber;
            }
        } else if (linetype == "palette"){
            let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
            for(let i = 0; i < lines.length; i++){
                let lineNumber = String(i).padStart(2, "0");
                lines[i].previousElementSibling.textContent = lineNumber;
            }
        }
    });

    terminalLine.addEventListener('keydown', function(e){
        if(e.key == "Enter"){
            e.preventDefault();
            if(linetype == "code"){
                let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
                let lineNumber = String(+lines[lines.length - 1].previousElementSibling.textContent+1).padStart(3, '0');
                createLilypadLine(lineNumber, "code", filename);
            } else if (linetype == "palette") {
                let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
                let lineNumber = String(+lines[lines.length - 1].previousElementSibling.textContent).padStart(2, '0');
                if(+lineNumber < 15) createLilypadLine(lineNumber, "palette", filename);
            } else {
                createLilypadLine(">", undefined, filename);
            }
        }
        if(e.key == "Backspace"){
            if(terminalLine.textContent.length == 0) {
                let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
                let currentLineIndex = Array.from(lines).indexOf(document.activeElement);
                if(lines.length > 1 && currentLineIndex != 0){
                    if(currentLineIndex == 0){
                        let nextLine = lines[currentLineIndex + 1];
                        moveCaretToEnd(nextLine);
                    }

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
            config.currentProgram = "cli";
            clearInterval(highlightedLineUpdater);
            let file = {
                name: null,
                properties: {
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
                setSetting("showSpinner", "true");
                createTerminalLine(`Saving file...`, ">");

                let dataLength = 0;

                file.name = filename;
                let fileIndex = config.fileSystem[config.currentPath].findIndex(file => file.name == filename);
                config.fileSystem[config.currentPath][fileIndex].data = file.data;

                file.data.forEach(line => {
                    dataLength += line.length;
                });
                
                config.savingFile = true;
                setTimeout(function(){
                    setSetting("showSpinner", "false");
                    config.savingFile = false;
                    createTerminalLine(`Done! ^v^`, ">");
                    createEditableTerminalLine(`${config.currentPath}>`);
                    config.programSession++;
                }, dataLength * 2);
                
            }
        }
    });

    lineContainer.appendChild(terminalPath);
    lineContainer.appendChild(terminalLine);
    
    let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);

    if(lines.length == 0) terminal.appendChild(lineContainer);
    else terminal.insertBefore(lineContainer, document.activeElement.parentElement.nextSibling);

    terminal.scrollTop = terminal.scrollHeight;
    terminalLine.focus();
}

changeColorPalette(config.colorPalette);
createColorTestBar();
sendCommand('[[BULLFROG]]autoloadstate', [], false);
sendCommand('[[BULLFROG]]greeting', []);