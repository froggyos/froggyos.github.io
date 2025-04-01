// new AllSniffer({timerOptions: {intervalIDsToExclude: [1,2,3,4]}});

const screen = document.getElementById('screen');
const terminal = document.getElementById('terminal');
const bar = document.getElementById('bar');

const barText = document.getElementById('bar-text');
const spinnerText = document.getElementById('spinner-text');

// if the last character is japanese, switch the font
let isJp = (text) => /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF「」]/g.test(text);

document.body.onclick = function() {
    try {
        terminal.lastChild.lastChild.focus();
    } catch (err) { };
}

function setSetting(setting, value) {
    if(typeof value === 'object') config.fileSystem["Config:"].find(file => file.name == setting).data = value;
    else config.fileSystem["Config:"].find(file => file.name == setting).data[0] = value;
}

function getSetting(setting, isArray) {
    let data = config.fileSystem["Config:"].find(file => file.name == setting).data;
    if(isArray) return data;
    return data[0];
}

function setConfigFromSettings(){
    // if(config.savingFile) return;
    config.debugMode = (getSetting("debugMode") === "true");
    config.version = getSetting("version");
    config.colorPalette = getSetting("colorPalette");
    config.showSpinner = (getSetting("showSpinner") === "true");
    config.currentSpinner = getSetting("currentSpinner");
    config.timeFormat = getSetting("timeFormat");
    config.updateStatBar = (getSetting("updateStatBar") === "true");
    config.allowedProgramDirectories = getSetting("allowedProgramDirectories", true);
    config.dissallowSubdirectoriesIn = getSetting("dissallowSubdirectoriesIn", true);
    config.language = getSetting("language");
    config.validateLanguageOnStartup = (getSetting("validateLanguageOnStartup") === "true");
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!============================================================
// todo: get rid of the fuckass bitchass shit and make it fix properly (ykwim)
function localize(descriptor, TRANSLATE_TEXT){
    let replacementData;

    if (TRANSLATE_TEXT == undefined) TRANSLATE_TEXT = true;

    if(descriptor.includes("|||[")){
        replacementData = descriptor.split("|||[")[1].split("]|||")[0];
        descriptor = descriptor.replaceAll(`|||[${replacementData}]|||`, "|||[]|||");
    }

    if(TRANSLATE_TEXT == false) return descriptor;

    let translationMap = config.fileSystem["Config:/lang_files"].find(translation => translation.name == "lbh").data;
    let languageMap = config.fileSystem["Config:/lang_files"].find(translation => translation.name == config.language).data;

    let englishData = translationMap.indexOf(descriptor);
    let translation = languageMap[englishData];

    if(translation == undefined) return null;
    else {
        translation = translation.replaceAll("|||[]|||", replacementData)
        if(config.language == "nmt") translation = translation.replaceAll("ə", "ә")

        let spaceMatches = translation.match(/:sp\d+:/g);
        
        if(spaceMatches != null){
            spaceMatches.forEach(match => {
                let num = +match.replaceAll(/\D/g, "");
                translation = translation.replaceAll(match, " ".repeat(num))
            })
        }

        return translation;
    }
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

function parseTimeFormat(text){
    const now = new Date();

    let dowListShort = ['T_date_short_sunday', 'T_date_short_monday', 'T_date_short_tuesday', 'T_date_short_wednesday', 'T_date_short_thursday', 'T_date_short_friday', 'T_date_short_saturday'];
    let dowListLong = ['T_date_long_sunday', 'T_date_long_monday', 'T_date_long_tuesday', 'T_date_long_wednesday', 'T_date_long_thursday', 'T_date_long_friday', 'T_date_long_saturday'];
    let monthListShort = ['T_date_short_january', 'T_date_short_february', 'T_date_short_march', 'T_date_short_april', 'T_date_short_may', 'T_date_short_june', 'T_date_short_july', 'T_date_short_august', 'T_date_short_september', 'T_date_short_october', 'T_date_short_november', 'T_date_short_december'];
    let monthListLong = ['T_date_long_january', 'T_date_long_february', 'T_date_long_march', 'T_date_long_april', 'T_date_long_may', 'T_date_long_june', 'T_date_long_july', 'T_date_long_august', 'T_date_long_september', 'T_date_long_october', 'T_date_long_november', 'T_date_long_december'];

    dowListShort = dowListShort.map(dow => localize(dow));
    dowListLong = dowListLong.map(dow => localize(dow));
    monthListShort = monthListShort.map(month => localize(month));
    monthListLong = monthListLong.map(month => localize(month));

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

    return dateString;
}

function updateDateTime() {
    if(!config.updateStatBar) return;

    let dateString = parseTimeFormat(config.timeFormat);

    barText.textContent = dateString;
    if(config.showSpinner == true) {
        let spinnerFrames = config.fileSystem["D:/Spinners"].find(spinner => spinner.name == config.currentSpinner).data;
        spinnerText.textContent = spinnerFrames[config.spinnerIndex % spinnerFrames.length];
        config.spinnerIndex++;
    } else {
        spinnerText.textContent = "";
    }

    if(isJp(barText.textContent)) {
        let text = barText.textContent;
        barText.textContent = '';
        text.split("").forEach((char) => {
            let span = document.createElement('span');
            if(isJp(char)) {
                span.classList.add('bar-text-jp');
            }
            span.textContent = char;
            barText.appendChild(span);
        })
    }
}

setInterval(() => {
    setConfigFromSettings()
    programList()
    if(config.savingFile) setSetting("showSpinner", "true");
    else setSetting("showSpinner", "false");
}, 1);

setInterval(() => {
    updateDateTime()
}, 100);

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
    --translation-error-backgroud: var(--c05);
    --translation-warning-backgroud: var(--c06);
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
            createTerminalLine(`T_pattete_error_invalid_hex |||[]|||`, config.errorText);
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
            if(palette.properties.hidden == true) continue;
            palettes[palette.name] = {};
            for(let i = 0; i < palette.data.length; i++){
                palettes[palette.name][colorArray[i]] = "#"+palette.data[i];
            }
        }
    } catch (err) {
        createTerminalLine("T_could_not_create_palette", config.errorText)
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

function createTerminalLine(text, path, other){
    let lineContainer = document.createElement('div');
    let terminalPath = document.createElement('span');
    let terminalLine = document.createElement('div');

    lineContainer.classList.add('line-container');

    terminalPath.innerHTML = path;

    if(other == undefined) other = {};

    let formatting = other.formatting ?? undefined;
    let translateText = other.translate ?? true;

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
                            createTerminalLine("T_invalid_format_object_inter_rule_delimiter", `${config.errorText}`);
                            createTerminalLine("T_error_data_unavailable", `${config.errorText}`);
                            return;
                        }
                        properties.push(`color: var(--${format.t})`)
                    }
                    if(format?.b) {
                        if(format.b.length != 3) {
                            createTerminalLine("T_invalid_format_object_inter_rule_delimiter", `${config.errorText}`);
                            createTerminalLine("T_error_data_unavailable", `${config.errorText}`);
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
        let localizedText = localize(text, translateText);
        if(localizedText == null) {
            terminalLine.textContent = `Index Missing! -> "${text}"`;
            terminalPath.innerHTML = config.translationErrorText;
        }
        else terminalLine.textContent = localizedText; 
    }

    if(isJp(terminalLine.textContent) && config.language == "jpn") {
        let text = terminalLine.textContent;
        terminalLine.textContent = '';
        // terminalLine.classList.add('text-jp');
        terminalPath.classList.add("path-jp");
        text.split("").forEach((char) => {
            if(isJp(char)) {
                let span = document.createElement('span');
                span.classList.add('text-jp');
                span.textContent = char;
                terminalLine.appendChild(span);
            } else {
                let span = document.createElement('span');  
                span.textContent = char;
                terminalLine.appendChild(span);
            }
        })
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

function validateLanguageFile(code){
    let langFile = config.fileSystem["Config:/lang_files"].find(file => file.name == code)
    let langData = langFile.data;
    let translation_map = config.fileSystem["Config:/lang_files"].find(file => file.name == "lbh").data;
    
    if(langData.length != translation_map.length) return false;
    if(langFile.properties.hidden == true) return false;
    

    let identifierLine = langData[0];
    return /\{\{\{LANGNAME_!!!_.*?\}\}\}/g.test(identifierLine);
}

function sendCommand(command, args, createEditableLineAfter){
    if(createEditableLineAfter == undefined) createEditableLineAfter = true;
    command = command.trim();
    args = args.filter(arg => arg.trim() != "");
    let directory;
    let file;

    switch(command){
        case "":
            createTerminalLine("T_froggy_doesnt_like", "");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // commands =========================================================================================================================================================
        // change language
        case "lang":
        case "changelanguage": {
            let langCodes = config.fileSystem["Config:/lang_files"].map(file => file.name);

            function getDisplayCodes(){
                let arr = [];
                let displayCodes = config.fileSystem["Config:/lang_files"]
                    .filter(file => {
                        if(file.properties.hidden == true) return false;
                        if(file.properties.transparent == true) return false;
                        if(file.name.length != 3) return false;
                        else return true;
                    }).map(file => file.name);
                
                for(let i = 0; i < displayCodes.length; i++){
                    let code = displayCodes[i];
                    let langName = config.fileSystem["Config:/lang_files"].find(file => file.name == displayCodes[i]).data[0].replace("}}}", "").split("_")[2];

                    arr.push(`${displayCodes[i]} (${validateLanguageFile(code) ? langName : localize("T_invalid_lang")})`);
                }
                return arr.join(", ");
            } 

            if(args.length == 0){
                createTerminalLine("T_provide_lang_code", config.errorText);
                createTerminalLine(`T_available_langs`, "");
                createTerminalLine(getDisplayCodes(), ">", {translate: false});
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            } else {
                if(!langCodes.includes(args[0])){
                    createTerminalLine(`T_lang_does_not_exist |||[${args[0]}]|||`, config.errorText);
                    createTerminalLine(`T_available_langs`, "");
                    createTerminalLine(getDisplayCodes(), ">", {translate: false});
                    if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                    break;
                }
            }

            let code = args[0];
            if(validateLanguageFile(code) == false){
                createTerminalLine(`T_invalid_lang_file |||[${code}]|||`, config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            
            setSetting("language", code);

            setTimeout(() => {
                createTerminalLine("T_lang_changed", ">")
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
            }, 10)
        } break;
        // change color palette
        case "changepalette": {
            let colorPalettes = createPalettesObject();
            function getDisplayPalettes(){
                let arr = [];
                let palettes = config.fileSystem["D:/Palettes"];
                let displayPalettes = palettes.filter(palette => {
                    if(palette.properties.hidden == true) return false;
                    if(palette.properties.transparent == true) return false;
                    else return true;
                })
                return displayPalettes.map(palette => palette.name).join(", ");
            }

            if(args.length == 0){
                createTerminalLine("T_provide_palette_name", config.errorText);
                createTerminalLine(`T_available_color_palettes`, "");
                createTerminalLine(getDisplayPalettes(), ">", {translate: false});
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(colorPalettes[args[0]] == undefined){
                createTerminalLine("T_color_palette_does_not_exist", config.errorText);
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
            createTerminalLine("T_state_cleared", ">")
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // copy files
        case "clone":
            if(args.length == 0){
                createTerminalLine("T_provide_file_name", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            
            let fileToClone = config.fileSystem[config.currentPath].find(file => file.name == args[0] && file.properties.hidden == false);

            if(fileToClone == undefined){
                createTerminalLine("T_file_does_not_exist", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            if(fileToClone.properties.read == false){
                createTerminalLine("T_no_permission_to_clone", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            let cloned = JSON.parse(JSON.stringify(fileToClone));

            cloned.name = "clone_of_" + cloned.name;
            cloned.properties.read = true;
            cloned.properties.write = true;
            cloned.properties.transparent = false;

            config.fileSystem[config.currentPath].push(cloned);

            createTerminalLine(`T_file_cloned |||[${fileToClone.name}]|||`, ">")
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // delete files
        case "c":
        case "croak":
            if(args.length == 0){
                createTerminalLine("T_provide_file_name", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file = config.fileSystem[config.currentPath];
            if(file == undefined){
                createTerminalLine("T_file_does_not_exist", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file = file.find(file => file.name == args[0]);
            if(file == undefined){
                createTerminalLine("T_file_does_not_exist", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(file.properties.write == false){
                createTerminalLine("T_no_permission_to_delete_file", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            // if we are in the Config: directory, do not allow the user to delete the file
            if(config.currentPath.split(":")[0] == "Settings"){
                createTerminalLine("T_cannot_delete_file", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            let fileIndex = config.fileSystem[config.currentPath].findIndex(file => file.name == args[0]);
            delete config.fileSystem[config.currentPath][fileIndex];
            config.fileSystem[config.currentPath] = config.fileSystem[config.currentPath].filter(file => file != undefined);

            createTerminalLine("T_file_deleted", ">")
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "ft":
        case "formattime": {
            if(args.length == 0){
                createTerminalLine("T_provide_time_format", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            let text = args.join(" ");
            if(parseTimeFormat(text).length > 78){
                createTerminalLine("T_arg_too_long", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            setSetting("timeFormat", args.join(" "));
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        // make files
        case "ch":
        case "hatch":
            if(args.length == 0){
                createTerminalLine("T_provide_file_name", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(config.fileSystem[config.currentPath] == undefined){
                createTerminalLine("T_directory_does_not_exist", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
            }
            if(config.fileSystem[config.currentPath].find(file => file.name == args[0]) != undefined){
                createTerminalLine("T_file_already_exists", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            // if the current path is settings and the name isnt exactly 3 character long, throw an error
            if(config.currentPath == "Config:/lang_files" && args[0].length != 3){
                createTerminalLine("T_file_name_not_3_char", config.errorText);
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
            createTerminalLine("T_file_created", ">")
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "hello":
            createTerminalLine("T_hello_froggy", ">");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "?":
        case "help":
            createTerminalLine("T_basic_commands_intro", "");
            createTerminalLine("T_basic_commands_lang", ">");
            createTerminalLine("T_basic_commands_palette", ">");
            createTerminalLine("T_basic_commands_clear", ">");
            createTerminalLine("T_basic_commands_clone", ">");
            createTerminalLine("T_basic_commands_clearstate", ">");
            createTerminalLine("T_basic_commands_croak", ">");
            createTerminalLine("T_basic_commands_formattime", ">");
            createTerminalLine("T_basic_commands_hatch", ">");
            createTerminalLine("T_basic_commands_hello", ">");
            createTerminalLine("T_basic_commands_help", ">");
            createTerminalLine("T_basic_commands_hop", ">");
            createTerminalLine("T_basic_commands_list", ">");
            createTerminalLine("T_basic_commands_listdrives", ">");
            createTerminalLine("T_basic_commands_loadstate", ">");
            createTerminalLine("T_basic_commands_meta", ">");
            createTerminalLine("T_basic_commands_metaprop", ">");
            createTerminalLine("T_basic_commands_opendoc", ">");
            createTerminalLine("T_basic_commands_rename", ">");
            createTerminalLine("T_basic_commands_ribbit", ">");
            createTerminalLine("T_basic_commands_savestate", ">");
            createTerminalLine("T_basic_commands_spawn", ">");
            createTerminalLine("T_basic_commands_spy", ">");
            createTerminalLine("T_basic_commands_swimto", ">");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;


        // move directories
        case "h":
        case "hop":
            directory = args[0];

            if(directory == undefined){
                createTerminalLine("T_provide_directory_name", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            directory = directory.replace(".", config.currentPath);
            if(directory == "~") directory = config.currentPath.split("/")[0];
            if(directory == "-") directory = config.currentPath.split("/").slice(0, -1).join("/");

            if(config.fileSystem[directory] == undefined){
                createTerminalLine("T_directory_does_not_exist", config.errorText);
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
            files = files.filter(file => {
                if(file.properties.hidden == true) return false;
                if(file.properties.transparent == true) return false;
                else return true;
            });

            if(files.length == 0 && subdirectoryNames.length == 0){
                createTerminalLine("T_directory_empty", ">")
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            subdirectoryNames.forEach(subdirectory => {
                createTerminalLine(` [DIR] ${subdirectory}`, ">", {translate: false})
            });
            files.forEach(file => {
                createTerminalLine(`       ${file.name}`, ">", {translate: false})
            });
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "ld":
        case "listdrives": {
            let drives = Object.keys(config.fileSystem).map(drive => drive.split(":"))
            drives = [...new Set(drives.filter(drive => drive.length == 2).map(drive => drive[0]))].map(drive => drive + ":");

            drives.forEach(drive => {
                createTerminalLine(`${drive}`, ">", {translate: false});
            });
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        // load state
        case "lds":
        case "loadstate":
            let state = localStorage.getItem(`froggyOS-state-${config.version}`);
            if(state == null){
                createTerminalLine("T_no_state_found.", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            for(let key in JSON.parse(state)){
                config[key] = JSON.parse(state)[key];
            }

            changeColorPalette(config.colorPalette);

            createTerminalLine("T_state_loaded", ">")
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "/":
        case "macro": {
            if(args.length == 0){
                createTerminalLine("T_provide_macro_name", config.errorText);
                createTerminalLine(`T_available_macros`, "");
                let macros = config.fileSystem["D:/Macros"]
                if(macros == undefined){
                    createTerminalLine("T_no_macros_found", config.errorText);
                } else {
                    let macroList = macros.filter(macro => macro.properties.hidden == false && macro.properties.transparent == false);
                    createTerminalLine(macroList.map(macro => macro.name).join(", "), ">", {translate: false})
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
            
            if(macro == undefined || macro.properties.hidden == true){
                createTerminalLine("T_macro_does_not_exist", config.errorText);
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
                createTerminalLine(`T_missing_file_args`, config.errorText);
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
                createTerminalLine("T_provide_file_name", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file = config.fileSystem[config.currentPath];
            if(file == undefined){
                createTerminalLine("T_file_does_not_exist", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file = file.find(file => file.name == args[0]);
            if(file == undefined){
                createTerminalLine("T_file_does_not_exist", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(file.properties.write == false){
                createTerminalLine("T_no_permission_to_edit_file", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            createTerminalLine("T_lilypad_save_exit", "");
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
                createTerminalLine("T_file_does_not_exist", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            let propertyTypes = Object.keys(file.properties);

            if(property == undefined || propertyTypes.includes(property) == false){
                createTerminalLine("T_provide_valid_property_type", config.errorText);
                createTerminalLine("T_available_properties", "");
                createTerminalLine(propertyTypes.join(", "), ">", {translate: false});
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            if(value == undefined || (value != "0" && value != "1")){
                createTerminalLine("T_invalid_args_provide_1_0", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break
            }

            if(file.properties.write == false){
                createTerminalLine("T_no_permission_to_edit_file", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            file.properties[property] = value == "1" ? true : false;
            createTerminalLine("T_properties_updated", ">")

            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "docs":
        case "opendocumentation": {

            new MarkdownParser("url", `https://froggyos.github.io/versions/${config.version}/README.md`)
            .newWindowArgs("height=850,width=1100")
            .toc(true)
            .title(`froggyOS v. ${config.version} Documentation`)
            .generate()
            .open("newWindow");

            createTerminalLine("T_documentation_opened", ">");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        case "rename":
            if(args.length < 2){
                createTerminalLine("T_provide_file_name_and_new", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            let fileName = args[0];
            let newName = args[1];

            file = config.fileSystem[config.currentPath].find(file => file.name == fileName && file.properties.hidden == false);

            if(file == undefined){
                createTerminalLine("T_file_does_not_exist", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            if(file.properties.write == false || file.properties.read == false){
                createTerminalLine("T_no_permission_to_rename_file", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(config.fileSystem[config.currentPath].find(file => file.name == newName) != undefined){
                createTerminalLine("T_file_name_already_exists", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(fileName.length != 3 && config.currentPath == "Config:/lang_files"){
                createTerminalLine("T_file_name_not_3_char", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            file.name = newName;
            createTerminalLine(`T_file_renamed`, ">");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;
        case "ribbit":
            if(args.length == 0){
                createTerminalLine("T_provide_text_to_display", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            createTerminalLine(args.join(" "), ">", {translate: false})
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // save state
        case "svs":
        case "savestate":
            localStorage.setItem(`froggyOS-state-${config.version}`, JSON.stringify(config));
            createTerminalLine("T_state_saved", ">")
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        // make directories
        case "s":
        case "spawn":
            directory = config.currentPath + "/" + args[0];

            if(config.dissallowSubdirectoriesIn.includes(config.currentPath)){
                createTerminalLine("T_cannot_create_directories", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(args[0] == undefined){
                createTerminalLine("T_provide_directory_name", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(config.fileSystem[directory] != undefined){
                createTerminalLine("T_directory_already_exists", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            config.fileSystem[directory] = [];
            createTerminalLine("T_directory_created", ">");
            sendCommand("[[BULLFROG]]changepath", [directory], createEditableLineAfter);
        break;

        // read file contents
        case "spy":
            if(args.length == 0){
                createTerminalLine("T_provide_file_name", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file = config.fileSystem[config.currentPath]?.find(file => file.name == args[0]);
            if(file == undefined){
                createTerminalLine("T_file_does_not_exist", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            if(file.properties.read == false){
                createTerminalLine("T_no_permission_to_read_file", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            file.data.forEach(line => {
                createTerminalLine(line, ">", {translate: false})
            });
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case "st":
        case "swimto":
            function getProgramList(){
                let programList = [];
                for(let directory of config.allowedProgramDirectories){
                    programList = programList.concat(config.fileSystem[directory].filter(file => {
                        if(file.properties.hidden == true) return false
                        if(file.properties.transparent == true) return false;
                        else return true;
                    }).map(file => file.name));
                }
                return programList;
            }
            if(!config.programList.includes(args[0])){
                createTerminalLine("T_provide_valid_program", config.errorText);
                createTerminalLine("T_available_programs", "");
                createTerminalLine(getProgramList().join(", "), ">", {translate: false});
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            config.programSession++
            if(args[0] == "cli"){
                config.currentProgram = "cli";
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
            } else if(args[0] == "lilypad"){
                config.currentProgram = "lilypad";
                createTerminalLine("T_lilypad_exit", "");
                createLilypadLine(">", undefined, undefined);
            } else {
                let file;
                for(let directory of config.allowedProgramDirectories){
                    file = getFileWithName(directory, args[0]);
                    if(file != undefined) break;
                }
                if(file.properties.read == false){
                    createTerminalLine("T_no_permission_to_run_program", config.errorText);
                    if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                    break;
                }
                if(file.properties.hidden == true){
                    createTerminalLine("T_provide_valid_program", config.errorText);
                    createTerminalLine("T_available_programs", "");
                    createTerminalLine(getProgramList().join(", "), ">", {translate: false});
                    if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                    break;
                }

                let formatted = format(file.data);
                if(formatted.errors.length > 0){
                    createTerminalLine(formatted.errors[0], config.errorText, {translate: false});
                    if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                } else {
                    config.currentProgram = args[0];
                    interpreter(formatted);
                }
            }
        break;

        // hidden commands =======================================================================================================================================
        case "[[BULLFROG]]changepath":
            if(args.length == 0){
                createTerminalLine("T_provide_path", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            config.currentPath = args.join(" ");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case '[[BULLFROG]]greeting': {
            createTerminalLine("T_nmt_greeting_1", "");
            createTerminalLine(`T_nmt_greeting_2 |||[${config.version}]|||` , "");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        case '[[BULLFROG]]help':
            createTerminalLine("T_bullfrog_commands_intro", "");
            createTerminalLine("T_bullfrog_commands_changepath", ">");
            createTerminalLine("T_bullfrog_commands_greeting", ">");
            createTerminalLine("T_bullfrog_commands_help", ">");
            createTerminalLine("T_bullfrog_commands_setstatbar", ">");
            createTerminalLine("T_bullfrog_commands_statbarlock", ">");
            createTerminalLine("T_bullfrog_commands_showspinner", ">");
            createTerminalLine("T_bullfrog_commands_debugmode", ">");
            createTerminalLine("T_bullfrog_commands_setspinner", ">");
            createTerminalLine("T_bullfrog_commands_usavestate", ">");
            createTerminalLine("T_bullfrog_commands_uloadstate", ">");
            createTerminalLine("T_bullfrog_commands_uclearstate", ">");
            createTerminalLine("T_bullfrog_commands_autoloadstate", ">");
            createTerminalLine("T_bullfrog_commands_vlang", ">");
            createTerminalLine("T_bullfrog_commands_trans", ">");
            createTerminalLine("T_bullfrog_commands_trigdiag", ">");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case '[[BULLFROG]]setstatbar':
            let text = args.join(" ");
            if(text > 78){
                createTerminalLine("T_arg_too_long", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
            barText.textContent = args.join(" ");
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case '[[BULLFROG]]showspinner':
            let bool = args[0];
            if(bool == "1") setSetting("showSpinner", "true");
            else if(bool == "0") setSetting("showSpinner", "false");
            else createTerminalLine("T_invalid_args_provide_1_0", config.errorText);
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        break;

        case '[[BULLFROG]]statbarlock': {
            let bool = args[0];
            if(bool == "1") setSetting("updateStatBar", "false");
            else if(bool == "0") setSetting("updateStatBar", "true");
            else createTerminalLine("T_invalid_args_provide_1_0", config.errorText);
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
            else createTerminalLine("T_invalid_args_provide_1_0", config.errorText);
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        case "[[BULLFROG]]setspinner": {
            let spinner = args[0];
            // check if spinner is a valid spinner
            if(config.fileSystem["D:/Spinners"].find(spinner_ => spinner_.name == spinner) == undefined){
                createTerminalLine("T_spinner_does_not_exist", config.errorText);
                createTerminalLine(`T_available_spinners`, "");
                createTerminalLine(config.fileSystem["D:/Spinners"].map(spinner_ => spinner_.name).join(", "), ">", {translate: false});
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            } else {
                setSetting("currentSpinner", spinner);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }
        } break;

        case "[[BULLFROG]]urgentsavestate": {
            localStorage.setItem("froggyOS-urgent-state", JSON.stringify(config));
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        case "[[BULLFROG]]urgentloadstate": {
            let state = localStorage.getItem("froggyOS-urgent-state");
            if(state == null){
                createTerminalLine("T_no_urgent_state_found", config.errorText);
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

        case "[[BULLFROG]]validatelanguage": {
            if(!config.validateLanguageOnStartup) {
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                return;
            }
            // get every language file except for TRANSLATION_MAP and the current language
            let languageFiles = config.fileSystem["Config:/lang_files"].map(file => file.name).filter(name => name != "lbh" && name != config.language);

            languageFiles.forEach(name => {
                if(validateLanguageFile(name) == false){
                    createTerminalLine(`T_invalid_lang_file |||[${name}]|||`, config.translationWarningText);
                }
            })

            if(validateLanguageFile(config.language) == false){
                createTerminalLine(`T_current_lang_invalid`, config.translationErrorText);
                setSetting("language", "lbh");
            }
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        case "[[BULLFROG]]translations": {
            let translationFiles = config.fileSystem["Config:/lang_files"].filter(file => file.name != "lbh");

            let lbh = config.fileSystem["Config:/lang_files"].find(file => file.name == "lbh").data;

            translationFiles.forEach((file, i) => {
                let linesTranslated = 0;
                for(let i = 1; i < file.data.length; i++){
                    if(file.data[i] != lbh[i]) linesTranslated++;
                }
                let percent = linesTranslated / (lbh.length-1) * 100;
                createTerminalLine(`${file.name}: ${percent.toFixed(2)}%`, ">", {translate: false});
            })
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        case "[[BULLFROG]]triggerdialogue": {
            let dialogue = args[0];
            if(dialogue == undefined){
                createTerminalLine("T_provide_valid_t_desc", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            let localized = localize(dialogue);

            if(localized == undefined){
                createTerminalLine("T_provide_valid_t_desc", config.errorText);
                if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
                break;
            }

            createTerminalLine(localized, ">", {translate: false});
            if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
            

        } break;

        default:
            createTerminalLine(`T_doesnt_know |||[${command}]|||`, ">");
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

        // if the last character is japanese, switch the font
        let isJp = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g.test(userInput);

        if(isJp && config.language == "jpn") {
            terminalLine.classList.add('text-jp');
        } else {
            terminalLine.classList.remove('text-jp');
        }
        
        
        e.stopImmediatePropagation();

        // if the inputted character is japanese, change the font of the terminal line

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
                let newLine = lines[focusedLineIndex - 1]
                moveCaretToEnd(newLine);

                if(newLine.getBoundingClientRect().y < terminal.getBoundingClientRect().y){
                    terminal.scrollTop = terminal.scrollTop - (terminal.getBoundingClientRect().y - newLine.getBoundingClientRect().y);
                }
            };
        };
        if(e.key == "ArrowDown"){
            e.preventDefault();
            let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
            let focusedLine = document.activeElement;

            let focusedLineIndex = Array.from(lines).indexOf(focusedLine);
            if(focusedLineIndex < lines.length - 1){
                let newLine = lines[focusedLineIndex + 1];
                moveCaretToEnd(newLine);

                if(newLine.getBoundingClientRect().bottom > terminal.getBoundingClientRect().bottom) {
                    terminal.scrollTop += newLine.getBoundingClientRect().bottom - terminal.getBoundingClientRect().bottom;
                }
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
                createTerminalLine(`T_saving_file`, ">");

                let dataLength = 0;

                file.name = filename;
                let fileIndex = config.fileSystem[config.currentPath].findIndex(file => file.name == filename);
                config.fileSystem[config.currentPath][fileIndex].data = file.data;

                file.data.forEach(line => {
                    dataLength += line.length;
                });
                
                config.savingFile = true;
                setTimeout(function(){
                    config.savingFile = false;
                    createTerminalLine(`T_saving_done`, ">");
                    createEditableTerminalLine(`${config.currentPath}>`);
                    config.programSession++;
                }, dataLength);
                
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

document.title = `froggyOS v. ${config.version}`;
changeColorPalette(config.colorPalette);
createColorTestBar();
sendCommand('[[BULLFROG]]autoloadstate', [], false);
sendCommand('[[BULLFROG]]validatelanguage', [], false);

let randomNumbers = [
    Math.floor(Math.random() * 60) + 20,
    Math.floor(Math.random() * 60) + 20,
    Math.floor(Math.random() * 60) + 20,
    Math.floor(Math.random() * 60) + 20
].sort((a, b) => a - b);

let timings = [
    ["0%", randomNumbers[0] + "%"],
    [randomNumbers[0] + "%", randomNumbers[1] + "%"],
    [randomNumbers[1] + "%", randomNumbers[2] + "%"],
    [randomNumbers[2] + "%", randomNumbers[3] + "%"],
    [randomNumbers[3] + "%", "100%"]
]

let getTimings = (i) => {
    return [[
        { width: timings[i][0] },
        { width: timings[i][1] },
        { width: timings[i][1] }    
    ], {
        duration: Math.floor(Math.random() * 3000) + 500,
        easing: "ease-in-out",
        fill: "forwards"
    }]
}

const DISABLE_ANIM = false;

let innerBar = document.getElementById("inner-bar");

if(!DISABLE_ANIM) innerBar.animate(...getTimings(0)).onfinish = () => {
    innerBar.animate(...getTimings(1)).onfinish = () => {
        innerBar.animate(...getTimings(2)).onfinish = () => {
            innerBar.animate(...getTimings(3)).onfinish = () => {
                innerBar.animate(...getTimings(4)).onfinish = () => {
                    let chance = Math.random() > 0.001;//0.001;
                    if(chance == false) {
                        console.error("whoa..... this is rare lol! uhhh email froggyos.royal.screw.up@gmail.com if u get this")
                    }
                    setTimeout(() => {
                        document.getElementById("blackout").remove()
                        sendCommand('[[BULLFROG]]greeting', []);
                    }, chance ? 100 : 1000000000000000)
                }
            }
        }
    }
}
else {
    setTimeout(() => {
        document.getElementById("blackout").remove()
        sendCommand('[[BULLFROG]]greeting', []);
    }, 100)
}