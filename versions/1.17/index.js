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

document.body.onkeyup = function(event) {
    if(event.key == "Enter" && event.shiftKey == true && config.currentProgram == "cli") {
        event.preventDefault();
        console.log(configInterval)
        createEditableTerminalLine(`${config.currentPath}>`);
    }
}

function setSetting(setting, value) {
    set_fSDS("Config:", "user", setting, value);
}

function getSetting(setting) {
    let fsds = parse_fSDS(getFileWithName("Config:", "user").data);
    return fsds[setting]?.value;
}

function addToCommandHistory(string){
    if(config.commandHistory[config.commandHistory.length - 1] != string) config.commandHistory = [string].concat(config.commandHistory);
}

function setUserConfigFromFile(){
    let fsds = parse_fSDS(getFileWithName("Config:", "user").data);
    if(fsds.error) {
        clearInterval(configInterval);
        terminal.innerHTML = "";
        createTerminalLine("T_error_reading_config_file", config.fatalErrorText);
        return;
    }
    
    config.version = getSetting("version");
    config.colorPalette = getSetting("colorPalette");
    config.showSpinner = getSetting("showSpinner");
    config.currentSpinner = getSetting("currentSpinner");
    config.defaultSpinner = getSetting("defaultSpinner");
    config.timeFormat = getSetting("timeFormat")?.slice(0, 78);
    config.updateStatBar = getSetting("updateStatBar")
    config.allowedProgramDirectories = getSetting("allowedProgramDirectories");
    // add other settings for macros, palettes, etc.
    config.dissallowSubdirectoriesIn = getSetting("dissallowSubdirectoriesIn");
    config.language = getSetting("language");
    config.validateLanguageOnStartup = getSetting("validateLanguageOnStartup");
}

const filePropertyDefaults = {
    read: true,
    write: true,
    hidden: false,
    transparent: false,
}

function set_fSDS(path, filename, key, value){
    let file = FroggyFileSystem.getFile(`${path}/${filename}`);
    if(file == undefined) return false;

    let fsds = parse_fSDS(file.getData());
    if(fsds.error) return false;

    let newData = file.getData();

    if(fsds[key] == undefined) {
        let isArray = Array.isArray(value);

        if(isArray){
            let array_fsds = [];

            for(let i = 0; i < value.length; i++){
                let type = (typeof value[i])[0].toUpperCase() + (typeof value[i]).slice(1);
                // index number needs to go here
                array_fsds.push(`${i} TYPE ${type} VALUE ${value[i]}`);
            }
            newData.push(`KEY ${key} TYPE Array START`);
            newData.push(...array_fsds);
            newData.push(`KEY ${key} TYPE Array END`);
            
        } else {
            let type = ((typeof value)[0].toUpperCase() + (typeof value).slice(1));
            type = type[0] + type.slice(1);

            newData.push(`KEY ${key} TYPE ${type} VALUE ${value} END`);
        }
    } else {
        let isArray = Array.isArray(value);

        if(isArray){
            let keyStart = newData.findIndex(line => line.includes(`KEY ${key} TYPE Array START`));
            let keyEnd = newData.findIndex(line => line.includes(`KEY ${key} TYPE Array END`));

            let array_fsds = [];

            for(let i = 0; i < value.length; i++){
                let type = (typeof value[i])[0].toUpperCase() + (typeof value[i]).slice(1);
                // index number needs to go here
                array_fsds.push(`${i} TYPE ${type} VALUE ${value[i]}`);
            }
            newData.splice(keyStart + 1, keyEnd - keyStart - 1);
            newData.splice(keyStart + 1, 0, ...array_fsds);
        } else {
            let type = (typeof value)[0].toUpperCase() + (typeof value).slice(1);
            
            let keyRegex = new RegExp(`KEY ${key} TYPE ${type} VALUE (.+?) END`);
            let keyIndex = newData.findIndex(line => line.match(keyRegex));

            newData[keyIndex] = newData[keyIndex].replace(keyRegex, `KEY ${key} TYPE ${type} VALUE ${value} END`);
        }
    }

    file.write(newData);
}

/**
 * 
 * @param {Array} inputFile - array of lines from a file to parse as fSDS
 * @returns {Object} parsed fSDS object
 */
function parse_fSDS(inputFile){
    let output = {};

    let error = '';

    let dataError = 0;

    for(let i = 0; i < inputFile.length; i++){
        let line = inputFile[i].trim();
        let match = line.match(/^KEY (.+?) TYPE (String|Number|Boolean) VALUE (.+?) END$/);
        if(match != null){
            let key = match[1];
            let type = match[2];
            let value = match[3];
            if(type == "String") value = `"${value}"`;
            output[key] = {type, value}
        } else {
            let arrayMatchStart = line.match(/^KEY (.+?) TYPE Array START$/);

            if(arrayMatchStart != null){
                let endingKey = arrayMatchStart[1];
                let arrayMatchEnd = null;
    
                for(let j = i + 1; j < inputFile.length; j++){
                    let arrayLine = inputFile[j].trim();
                    if(arrayLine.includes(`KEY ${endingKey} TYPE Array END`)){
                        arrayMatchEnd = arrayLine.match(/^KEY (.+?) TYPE Array END$/);
                        break;
                    }
                }

                if(inputFile.length != 0 && (arrayMatchEnd == null)){
                    dataError++;
                }

                let key = arrayMatchStart[1];
                let type = "Array";
                let value = [];

                if(arrayMatchStart == null) {
                    dataError++;
                    error = `missing config key start: ${key}`;
                }
                if(arrayMatchEnd == null) {
                    dataError++;
                    error = `missing config key end: ${key}`;
                }

                if(dataError > 0) break;

                let searchStart = inputFile.indexOf(arrayMatchStart[0]) + 1;
                let searchEnd = inputFile.indexOf(arrayMatchEnd[0]);

                for(let j = searchStart; j < searchEnd; j++){
                    let arrayDataLine = inputFile[j].trim();
                    let regex = new RegExp(`${value.length} TYPE (String|Number|Boolean) VALUE (.+?)$`);
                    let arrayDataMatch = arrayDataLine.match(regex);
                    if(arrayDataMatch != null){
                        let arrayType = arrayDataMatch[1];
                        let arrayValue = arrayDataMatch[2];
                        if(arrayType == "String") arrayValue = `"${arrayValue}"`;
                        value.push(arrayValue)
                    }
                }

                output[key] = {type, value}
            }
        }
    }

    if(dataError > 0){
        return {error: true, message: error}
    }

    for(let key in output){
        smallParse(output[key]);
    }

    return output;
}

function smallParse(input){
    if(input.type == "Boolean") {
        input.value = input.value.toLowerCase() == "true" ? true : false;
    } else if(input.type == "Number") {
        input.value = parseFloat(input.value);
    } else if(input.type == "String") {
        input.value = input.value.slice(1, -1);
    } else if(input.type == "Array") {
        let array = input.value;

        array.forEach((item, i) => {
            // if item is surrounded by quotes, remove them
            if(item.includes('"')) item = item.slice(1, -1);
            array[i] = item
        })
        input = {type: "Array", value: array };
    }

    return input;
}

/**
 * 
 * @param {String} descriptor - the string to be localized
 * @param {Boolean} TRANSLATE_TEXT - whether to translate the text or not
 * @returns {String|null} the localized string, or null if the translation is missing
 */
function localize(descriptor, TRANSLATE_TEXT=true){
    let replacementData = [];

    if (TRANSLATE_TEXT == undefined) TRANSLATE_TEXT = true;

    if(TRANSLATE_TEXT == false) return descriptor;

    if(descriptor.match(/\{\{(.*?)\}\}/)){
        let match = descriptor.match(/\{\{(.*?)\}\}/g).map(m => m.replace(/\{\{|\}\}/g, "").trim());
        match.forEach(m => {
            replacementData.push(m);
            descriptor = descriptor.replace(`{{${m}}}`, "{{}}");
        })
    }

    let translationMap = FroggyFileSystem.getFile("Config:/langs/ldm").getData();
    let languageMap = FroggyFileSystem.getFile(`Config:/langs/${config.language}`).getData();

    let englishData = translationMap.indexOf(descriptor);
    let translation = languageMap[englishData];

    if(translation == undefined) return null;
    else {
        if(translation.includes("{{}}")) {
            for(let i = 0; i < replacementData.length; i++){
                translation = translation.replace("{{}}", replacementData[i]);
            }
        }
        if(config.language == "nmt") translation = translation.replaceAll("ə", "ә")

        let spaceMatches = translation.match(/:sp\d+:/g);
        let newlineMatches = translation.match(/:nl:/g);
        
        if(spaceMatches != null){
            spaceMatches.forEach(match => {
                let num = +match.replaceAll(/\D/g, "");
                translation = translation.replaceAll(match, " ".repeat(num))
            })
        }

        if(newlineMatches != null){
            newlineMatches.forEach(match => {
                translation = translation.replaceAll(match, "\n")
            })
        }

        return translation;
    }
}

// function notPermittedCaller(){
//     FileSystem.get("Config:/program_data/test")
// }

// notPermittedCaller()

function updateProgramList(){
    let files = [];
    for(let directory of config.allowedProgramDirectories) {
        let dir = FroggyFileSystem.getDirectory(directory);
        if(dir == undefined) continue;
        if(dir.length == files.length && dir.every((file, index) => file.getName() == files[index])) continue;

        files = files.concat(dir);
    }

    files = files.map(file => file.getName());
    config.programList = files;

    // for all the programs, if there is not a corresponding file in the D:Program-Data directory, create one
    for(let program of config.programList){
        if(getFileWithName("Config:/program_data", program) == undefined){
            let newFile = new FroggyFile(program);
            FroggyFileSystem.addFileToDirectory("Config:/program_data", newFile);
        }
    }
}

/**
 * 
 * @param {String} text - the time format string
 * @param {Number} timestamp - optional timestamp to use instead of current time
 * @returns 
 */
function parseTimeFormat(text, timestamp){
    const now = timestamp != null ? new Date(Number(timestamp)) : new Date();

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
    const yearShort = now.getFullYear().toString().slice(-2);

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

    const millisecond = String(now.getMilliseconds()).padStart(3, '0');
    const millisecondUnpadded = String(now.getMilliseconds());

    const ampm = now.getHours() >= 12 ? 'PM' : 'AM';

    const timezone = new Date().toLocaleString(["en-US"], {timeZoneName: "short"}).split(" ").pop();

    function getOrdinalSuffix(num) {
        if (typeof num !== "number" || isNaN(num)) return "";
        if(config.language != "eng") return "";
    
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

    // totally not ai
    const replacements = [
        { char: 'w', value: dayOfWeekShort },
        { char: 'W', value: dayOfWeekLong },

        { char: 'Y', value: year },
        { char: 'y', value: yearShort },

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

        { char: 'l', value: millisecond },
        { char: 'lu', value: millisecondUnpadded },

        { char: 'a', value: ampm },

        { char: 'z', value: timezone },
    ];

    let replacementMap = Object.fromEntries(replacements.map(({ char, value }) => [char, value]));

    // fix escaping
    let dateString = text.replace(/\b(?<!\!)([a-zA-Z]+)\b/g, (match) => replacementMap[match] ?? match); // Replace only whole words

    return dateString;
}

function limit(string, maxLength) {
    return string.slice(0, maxLength);
}

function updateDateTime() {
    if(!config.updateStatBar) return;

    let dateString = parseTimeFormat(config.timeFormat);

    barText.textContent = dateString;
    if(config.showSpinner == true) {
        let spinnerFrames = FroggyFileSystem.getFile(`D:/Spinners/${config.currentSpinner}`).getData();
        spinnerText.textContent = limit(spinnerFrames[config.spinnerIndex % spinnerFrames.length], 1);
        config.spinnerIndex++;
    } else {
        spinnerText.textContent = "";
    }

    if(isJp(barText.textContent)) {
        let text = limit(barText.textContent, 78);
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

// CSS STYLING ==============================================================================================
function changeColorPalette(name){
    const colorPalettes = createPalettesObject();
    let palette = colorPalettes[name];

    let variableDefinitions = structuredClone(getFileWithName("D:/Palettes", name)).data.splice(16);

    let root = document.querySelector(':root');

    root.style = "";

    for(let i = 0; i < Object.keys(palette).length; i++){
        let color = Object.keys(palette)[i];
        let hex = palette[color];
        root.style.setProperty(`--${color}`, hex);
    }

    for(let i = 0; i < variableDefinitions.length; i++){
        let variable = variableDefinitions[i].split(" ")[0];
        let color = variableDefinitions[i].split(" ")[1];

        root.style.setProperty(`--${variable}`, `var(--c${color})`);
    }

    setSetting("colorPalette", name);
    config.colorPalette = name;
    createColorTestBar();
}

function changeColorPaletteFromArray(array){
    const root = document.querySelector(':root');
    root.style = "";
    for(let i = 0; i < array.length; i++){
        if(i < 16){
            const color = `c${i.toString().padStart(2, '0')}`;
            const hex = `#${array[i]}`;
            root.style.setProperty(`--${color}`, `#${array[i]}`);
        } else {
            let variable = array[i].split(" ")[0];
            let color = array[i].split(" ")[1];
            root.style.setProperty(`--${variable}`, `var(--c${color})`);
        }
    }
}

/*
    to do: make it so you can swap the colors to specific css variables

    after the 15 colors, the prefix switches to "def" and then the css is listed as follows
    void-space c00
    bar-background c01
    bar-text c15
    etc.

    can get rid of reset styling because the css will be built on line ~304
    make sure to switch from defining colors to the def lines in the loop
    can also get rid of lines 312-325
*/

function createColorTestBar(){
    const colorPalettes = createPalettesObject();

    // remove all the children of the color test bar
    document.getElementById('color-test-bar').innerHTML = "";
    function getContrastYIQ(hexColor) {
        if (!/^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(hexColor)) {
            createTerminalLine(`T_palette_error_invalid_hex {{${hexColor}}}`, config.errorText);
            return 
        }
        
        if (hexColor.length === 4) {
            hexColor = `#${hexColor[1]}${hexColor[1]}${hexColor[2]}${hexColor[2]}${hexColor[3]}${hexColor[3]}`;
        }
        
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        const yiq = (r * 299 + g * 587 + b * 114) / 1000;
        
        return yiq >= 128 ? "BLACK" : "WHITE";
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
    let paletteDir = FroggyFileSystem.getDirectory("D:/Palettes");
    let palettes = {};

    const colorArray = ["c00", "c01", "c02", "c03", "c04", "c05", "c06", "c07", "c08", "c09", "c10", "c11", "c12", "c13", "c14", "c15"];

    try {
        for(let palette of paletteDir){
            if(palette.getProperty('hidden')) continue;
            palettes[palette.getName()] = {};
            for(let i = 0; i < colorArray.length; i++){
                palettes[palette.getName()][colorArray[i]] = "#"+palette.getData()[i];
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

function scrollTo(line){
    if(line.getBoundingClientRect().y < terminal.getBoundingClientRect().y){
        terminal.scrollTop = terminal.scrollTop - (terminal.getBoundingClientRect().y - line.getBoundingClientRect().y);
    }

    if(line.getBoundingClientRect().bottom > terminal.getBoundingClientRect().bottom) {
        terminal.scrollTop += line.getBoundingClientRect().bottom - terminal.getBoundingClientRect().bottom;
    }
}

function moveCaretToPosition(element, pos) {
    let textNode = element.firstChild;
    
    if (!textNode) {
        textNode = document.createTextNode("");
        element.appendChild(textNode);
    }

    const range = document.createRange();
    const selection = window.getSelection();
    const maxPos = textNode.length;

    try {
        range.setStart(textNode, Math.min(pos, maxPos));
        range.collapse(true);
    } catch (e) { }


    selection.removeAllRanges();
    selection.addRange(range);

    scrollTo(element);

    // const rect = element.getBoundingClientRect();
    // if (rect.bottom > window.innerHeight) element.scrollIntoView(false);
    // if (rect.top < 0) element.scrollIntoView(true);
}

function getCaretPosition(element) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return 0;
  
    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.startContainer, range.startOffset);
  
    return preCaretRange.toString().length;
}

/**
 * @param {string} text - the main text of the line
 * @param {string} path - also called prefix, a line of text before the main text, separated by a whitespace character 
 * @param {Object} other - other options
 * @param {Array} other.formatting - an array of formatting objects
 * @param {boolean} other.translate - whether to translate the text or not (default: true)
 * @param {number} other.expire - time in milliseconds before the line is removed from the terminal (if undefined, will not expire)
 */
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
                        properties.push(`color: var(--${format.t})`)
                    }
                    if(format?.b) {
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
            terminalLine.textContent = `Index Missing! -> ${text.replace(/{{.*?}}/g, "{{}}")}`;
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

    if(other?.expire != undefined){
        setTimeout(() => {
            if(terminal.contains(lineContainer)) terminal.removeChild(lineContainer);
        }, other.expire);
    }
    terminal.scrollTop = terminal.scrollHeight;
}

/**
 * @description You should use FroggyFileSystem.getFile() instead
 * @param {*} path 
 * @param {*} name 
 * @returns 
 */
function getFileWithName(path, name){
    let file = FroggyFileSystem.getFile(`${path}/${name}`);
    if(file == undefined) return undefined;
    return { name: file.getName(), properties: file.getProperties(), data: file.getData() };
}

function validateLanguageFile(code){
    let langFile = FroggyFileSystem.getFile(`Config:/langs/${code}`);
    if(langFile == undefined) return false;

    let langData = langFile.getData();
    let translation_map = FroggyFileSystem.getFile("Config:/langs/ldm").getData();
    
    if(langData.length != translation_map.length) return false;
    if(langFile.getProperty('hidden')) return false;

    let identifierLine = langData[0];
    return /^!LANGNAME: (.*?)$/g.test(identifierLine);
}

/**
 * @param {string} command - the command to execute
 * @param {Array} args - an array of arguments for the command
 * @param {Boolean} createEditableLineAfter - whether to create a new editable terminal line after executing the command (default: true)
 * @returns 
 */
async function sendCommand(command, args, createEditableLineAfter = true){
    if(createEditableLineAfter == undefined) createEditableLineAfter = true;
    command = command.trim();
    args = args.filter(arg => arg.trim() != "");
    let directory;
    let file;

    let hadError = false;

    function printLn() {
        if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
    }

    switch(command){
        case "":
            createTerminalLine("T_froggy_doesnt_like", "");
            printLn();
        break;

        // commands =========================================================================================================================================================
        // change language
        case "lang":
        case "changelanguage": {
            let langCodes = FroggyFileSystem.getDirectory("Config:/langs").map(file => file.getName())

            function getDisplayCodes(){ 
                let arr = [];
                let displayCodes = FroggyFileSystem.getDirectory("Config:/langs")
                    .filter(file => {
                        if(file.getProperty('hidden') == true) return false;
                        if(file.getProperty('transparent') == true) return false;
                        if(file.getName().length != 3) return false;
                        else return true;
                    }
                ).map(file => file.getName());
                
                for(let i = 0; i < displayCodes.length; i++){
                    let code = displayCodes[i];
                    let langName = FroggyFileSystem.getFile(`Config:/langs/${code}`).getData()[0].match(/^!LANGNAME: (.*?)$/)[1];
                    arr.push(`${displayCodes[i]} (${validateLanguageFile(code) ? langName : localize("T_invalid_lang")})`);
                }
                return arr.join(", ");
            } 

            if(args.length == 0){
                createTerminalLine("T_provide_lang_code", config.errorText);
                createTerminalLine(`T_available_langs`, "");
                createTerminalLine(getDisplayCodes(), ">", {translate: false});
                hadError = true;
                printLn();
                break;
            } else {
                if(!langCodes.includes(args[0])){
                    createTerminalLine(`T_lang_does_not_exist {{${args[0]}}}`, config.errorText);
                    createTerminalLine(`T_available_langs`, "");
                    createTerminalLine(getDisplayCodes(), ">", {translate: false});
                    hadError = true;
                    printLn();
                    break;
                }
            }

            let code = args[0];
            if(validateLanguageFile(code) == false){
                createTerminalLine(`T_invalid_lang_file {{${code}}}`, config.errorText);
                hadError = true;
                printLn();
                break;
            }
            
            setSetting("language", code);
            setSetting("showSpinner", true);

            setTimeout(() => {
                setSetting("showSpinner", false);
                createTerminalLine("T_lang_changed", ">")
                printLn();
            }, 500)
        } break;
        
        // change color palette
        case "changepalette": {
            let colorPalettes = createPalettesObject();
            function getDisplayPalettes(){
                let palettes = FroggyFileSystem.getDirectory("D:/Palettes")
                    .filter(palette => {
                        if(palette.getProperty('hidden') == true) return false;
                        if(palette.getProperty('transparent') == true) return false;
                        else return true;
                    }
                    ).map(palette => palette.getName());
                return palettes.join(", ");
            }

            if(args.length == 0){
                createTerminalLine("T_provide_palette_name", config.errorText);
                createTerminalLine(`T_available_color_palettes`, "");
                createTerminalLine(getDisplayPalettes(), ">", {translate: false});
                hadError = true;
                printLn();
                break;
            }
            if(colorPalettes[args[0]] == undefined){
                createTerminalLine("T_color_palette_does_not_exist", config.errorText);
                createTerminalLine(`T_available_color_palettes`, "");
                createTerminalLine(getDisplayPalettes(), ">", {translate: false});
                hadError = true;
                printLn();
                break;
            }
            changeColorPalette(args[0]);
            printLn();
        } break;

        case "cl":
        case "clear":
            document.getElementById('terminal').innerHTML = "";
            printLn();
        break;

        // clear froggyOS state
        case "cls":
        case "clearstate":
            localStorage.removeItem(`froggyOS-state-${config.version}-config`);
            localStorage.removeItem(`froggyOS-state-${config.version}-fs`);
            createTerminalLine("T_state_cleared", ">")
            printLn();
        break;

        // copy files
        case "clone": {
            if(args.length == 0){
                createTerminalLine("T_provide_file_name", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            
            let fileToClone = FroggyFileSystem.getFile(`${config.currentPath}/${args[0]}`);
            if(fileToClone == undefined || fileToClone.getProperty('hidden') == true){
                createTerminalLine("T_file_does_not_exist", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            if(fileToClone == undefined){
                createTerminalLine("T_file_does_not_exist", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            if(fileToClone.getProperty('read') == false){
                createTerminalLine("T_no_permission_to_clone", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            let cloned = new FroggyFile(`clone_of_`+fileToClone.getName(), fileToClone.getProperties(), fileToClone.getData());

            cloned.setProperty('read', true);
            cloned.setProperty('write', true);
            cloned.setProperty('transparent', false);
            cloned.setProperty('hidden', false);

            FroggyFileSystem.addFileToDirectory(config.currentPath, cloned);

            createTerminalLine(`T_file_cloned {{${fileToClone.getName()}}}`, ">")
            printLn();
        } break;

        // delete files
        case "c":
        case "croak": {
            if(args.length == 0){
                createTerminalLine("T_provide_file_name", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            let file = FroggyFileSystem.getFile(`${config.currentPath}/${args[0]}`);
            if(file == undefined || file.getProperty('hidden') == true){
                createTerminalLine("T_file_does_not_exist", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            if(file.getProperty('write') == false){
                createTerminalLine("T_no_permission_to_delete_file", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            // // if we are in the Config: directory, do not allow the user to delete the file
            // if(config.currentPath.split(":")[0] == "Config"){
            //     createTerminalLine("T_cannot_delete_file", config.errorText);
            //     hadError = true;
            //     printLn();
            //     break;
            // }

            FroggyFileSystem.deleteFile(`${config.currentPath}/${file.getName()}`);

            createTerminalLine("T_file_deleted", ">")
            printLn();
        } break;

        case "export":
        case "exportfile": {
            if(args.length == 0) {
                hadError = true;
                createTerminalLine("T_provide_file_name", config.errorText);
                printLn();
                break;
            }

            let file = FroggyFileSystem.getFile(`${config.currentPath}/${args[0]}`);
            if(file == undefined) {
                hadError = true;
                createTerminalLine("T_file_does_not_exist", config.errorText);
                printLn();
                break;
            }

            if(file.getProperty('read') == false){
                hadError = true;
                createTerminalLine("T_no_permission_to_export_file", config.errorText);
                printLn();
                break;
            }

            function download(text, filename) {
                const blob = new Blob([text], { type: "text/plain" });

                // Create a temporary download link
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename + ".txt";

                // Trigger download
                a.click();

                // Cleanup
                URL.revokeObjectURL(url);
            }

            download(file.getData().join("\n"), file.getName());
            createTerminalLine("T_file_exported", ">")
            printLn();
        } break;

        case "ft":
        case "formattime": {
            if(args.length == 0){
                createTerminalLine("T_provide_time_format", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            let text = args.join(" ");
            if(parseTimeFormat(text).length > 78){
                createTerminalLine("T_arg_too_long", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            setSetting("timeFormat", args.join(" "));
            printLn();
        } break;

        // make files
        case "ch":
        case "hatch": {
            if(args.length == 0){
                createTerminalLine("T_provide_file_name", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            if(FroggyFileSystem.getDirectory(`${config.currentPath}`) == undefined){
                createTerminalLine("T_directory_does_not_exist", config.errorText);
                hadError = true;
                printLn();
            }
            if(FroggyFileSystem.getFile(`${config.currentPath}/${args[0]}`) != undefined){
                createTerminalLine("T_file_already_exists", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            // if the current path is settings and the name isnt exactly 3 character long, throw an error
            if(config.currentPath == "Config:/langs" && args[0].length != 3){
                createTerminalLine("T_file_name_not_3_char", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            FroggyFileSystem.addFileToDirectory(config.currentPath, new FroggyFile(args[0]));
            createTerminalLine("T_file_created", ">")
            printLn();
        } break;

        case "hello":
            createTerminalLine("T_hello_froggy", ">");
            printLn();
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
            createTerminalLine("T_basic_commands_exportfile", ">");
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
            createTerminalLine("T_basic_commands_pond", ">");
            createTerminalLine("T_basic_commands_opendoc", ">");
            createTerminalLine("T_basic_commands_rename", ">");
            createTerminalLine("T_basic_commands_ribbit", ">");
            createTerminalLine("T_basic_commands_savestate", ">");
            createTerminalLine("T_basic_commands_spawn", ">");
            createTerminalLine("T_basic_commands_spy", ">");
            createTerminalLine("T_basic_commands_swimto", ">");
            printLn();
        break;


        // move directories
        case "h":
        case "hop":
            directory = args[0];

            if(directory == undefined){
                createTerminalLine("T_provide_directory_name", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            directory = directory.replace(".", config.currentPath);
            if(directory == "~") directory = config.currentPath.split("/")[0];
            if(directory == "-") directory = config.currentPath.split("/").slice(0, -1).join("/");

            if(FroggyFileSystem.getDirectory(directory) == undefined){
                createTerminalLine("T_directory_does_not_exist", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            sendCommand("[[BULLFROG]]changepath", [directory], createEditableLineAfter);
        break;

        // list files
        case "ls":
        case "list":
            let currentPathWithSlash = config.currentPath.endsWith('/') ? config.currentPath : config.currentPath + '/';

            // Get subdirectory names under the currentPath
            let subdirectoryNames = Object.keys(FroggyFileSystem.getRoot())
                .filter(path => path.startsWith(currentPathWithSlash) && path !== config.currentPath && !path.slice(currentPathWithSlash.length).includes('/'))
                .map(path => path.slice(currentPathWithSlash.length)); // Extract only the subdirectory name

            let files = FroggyFileSystem.getDirectory(config.currentPath)
            if(files == undefined) files = [];
            files = files.filter(file => {
                if(file.getProperty('hidden') == true) return false;
                if(file.getProperty('transparent') == true) return false;
                else return true;
            });

            if(files.length == 0 && subdirectoryNames.length == 0){
                createTerminalLine("T_directory_empty", ">")
                printLn();
                break;
            }
            subdirectoryNames.forEach(subdirectory => {
                createTerminalLine(` [DIR] ${subdirectory}`, ">", {translate: false})
            });
            files.forEach(file => {
                createTerminalLine(`       ${file.getName()}`, ">", {translate: false})
            });
            printLn();
        break;

        case "ld":
        case "listdrives": {
            let drives = Object.keys(FroggyFileSystem.getRoot()).map(drive => drive.split(":"))
            drives = [...new Set(drives.filter(drive => drive.length == 2).map(drive => drive[0]))].map(drive => drive + ":");

            drives.forEach(drive => {
                createTerminalLine(`${drive}`, ">", {translate: false});
            });
            printLn();
        } break;

        // load state
        case "lds":
        case "loadstate":
            let foundConfig = localStorage.getItem(`froggyOS-state-${config.version}-config`);
            let foundFs = localStorage.getItem(`froggyOS-state-${config.version}-fs`);

            if(foundConfig == null || foundFs == null){
                createTerminalLine("T_no_state_found", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            for(let key in JSON.parse(foundConfig)){
                config[key] = JSON.parse(foundConfig)[key];
            }

            FroggyFileSystem.loadFromString(foundFs);

            changeColorPalette(config.colorPalette);

            createTerminalLine("T_state_loaded", ">")
            printLn();
        break;

        case "/":
        case "macro": {
            if(args.length == 0){
                createTerminalLine("T_provide_macro_name", config.errorText);
                createTerminalLine(`T_available_macros`, "");
                let macros = FroggyFileSystem.getDirectory("D:/Macros")
                if(macros == undefined){
                    createTerminalLine("T_no_macros_found", config.errorText);
                } else {
                    let macroList = macros.filter(macro => macro.getProperty('transparent') == false);
                    let macroAliases = macros.filter(macro => macro.getProperty('transparent') == false).map(macro => macro.getData()[0].startsWith("!") ? macro.getData()[0].slice(1) : "no alias");
                    createTerminalLine(macroList.map((macro, i) => `${macro.getName()} (${macroAliases[i]})`).join(", "), ">", {translate: false});
                    hadError = true;
                    printLn();
                    break;
                }
            }

            let macro = getFileWithName("D:/Macros", args[0]);

            FroggyFileSystem.getDirectory("D:/Macros").forEach(_macro => {
                if(_macro.getData()[0].startsWith("!") && _macro.getData()[0].slice(1).trim() == args[0]){
                    macro = _macro;
                }
            });
            
            if(macro == undefined){
                createTerminalLine("T_macro_does_not_exist", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            let macroData = structuredClone(FroggyFileSystem.getFile("D:/Macros/" + macro.getName()).getData());
            let totalFileArguments = 0;

            macroData.forEach(line => {
                if(line.includes("$")){
                    // if the number behind $ is greater than the totalFileArguments, set totalFileArguments to that number
                    let fileArgument = parseInt(line.split("$")[1].split(" ")[0]);
                    if(fileArgument > totalFileArguments) totalFileArguments = fileArgument;
                }
            });

            if(args.length - 1 < totalFileArguments){
                createTerminalLine(`T_missing_file_args`, config.errorText);
                hadError = true;
                printLn();
                break;
            }

            let fileArguments = {};

            for(let i = 1; i < args.length; i++){
                fileArguments["$" + i] = args[i];
            }

            // go through each line, replace the file arguments
            macroData = macroData.map(line => {
                for(let fileArgument in fileArguments){
                    line = line.replaceAll(fileArgument, fileArguments[fileArgument]);
                }
                return line;
            });

            if(macroData[0].startsWith("!")) macroData.shift();

            macroData.forEach(async (line) => {
                let cmd = line.split(" ")[0];
                let args = line.split(" ").slice(1);

                await sendCommand(cmd, args, false);
            });

            if(createEditableLineAfter && config.currentProgram == "cli") createEditableTerminalLine(`${config.currentPath}>`);
        } break;

        // edit file
        case "m":
        case "meta": {
            if(args.length == 0){
                createTerminalLine("T_provide_file_name", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            let directory = FroggyFileSystem.getDirectory(config.currentPath);
            if(directory == undefined){
                createTerminalLine("T_file_does_not_exist", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            const regex = /[^a-zA-Z0-9_.-]/g;

            if(regex.test(args[0])){
                createTerminalLine("T_invalid_file_name_chars", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            let file = FroggyFileSystem.getFile(`${config.currentPath}/${args[0]}`);

            openLilypad(file, createEditableLineAfter);
        } break;

        // edit file properties
        case "mp":
        case "metaprop":
            file = getFileWithName(config.currentPath, args[0]);

            let property = args[1];
            let value = args[2];
            if(file == undefined){
                createTerminalLine("T_file_does_not_exist", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            let propertyTypes = Object.keys(file.properties);

            if(property == undefined || propertyTypes.includes(property) == false){
                createTerminalLine("T_provide_valid_property_type", config.errorText);
                createTerminalLine("T_available_properties", "");
                createTerminalLine(propertyTypes.join(", "), ">", {translate: false});
                hadError = true;
                printLn();
                break;
            }

            if(value == undefined || (value != "0" && value != "1")){
                createTerminalLine("T_invalid_args_provide_1_0", config.errorText);
                hadError = true;
                printLn();
                break
            }

            if(file.properties.write == false){
                createTerminalLine("T_no_permission_to_edit_file", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            file.properties[property] = value == "1" ? true : false;
            createTerminalLine("T_properties_updated", ">")

            printLn();
        break;

        case "docs":
        case "opendocumentation": {

            new MarkdownParser("url", `https://froggyos.xyz/versions/${config.version.replace("-indev", "")}/README.md`)
            .newWindowArgs("height=850,width=1100")
            .toc(true)
            .title(`froggyOS v. ${config.version} Documentation`)
            .generate()
            .open("newWindow");

            createTerminalLine("T_documentation_opened", ">");
            printLn();
        } break;

        case "pond": {
            async function ping(){
                let returnObj;
                const startTime = performance.now();
                await handleRequest("/ping", {
                    method: "GET",
                }, {
                    "500": async (response, data) => {
                        returnObj = {
                            ok: false,
                            code: 500,
                            text: "Server Unreachable",
                            responseTime: Math.round(performance.now() - startTime)
                        }
                    },
                    "200": async (response, data) => {
                        returnObj = {
                            ok: true,
                            code: 200,
                            text: response.statusText,
                            responseTime: Math.round(performance.now() - startTime)
                        }
                    },
                    "40x": async (response, data) => {
                        // setSetting("showSpinner", false)
                        // createTerminalLine("T_pond_server_error", config.errorText);
                        // createTerminalLine(`${response.status} ${response.statusText}`, config.errorText);
                        returnObj = {
                            ok: false,
                            code: response.status,
                            text: response.statusText,
                            responseTime: Math.round(performance.now() - startTime)
                        }
                    }
                })
                return returnObj;
            }

            function login(username, password){
                if(username == undefined || password == undefined){
                    createTerminalLine("T_pond_provide_username_password", config.errorText);
                    printLn();
                    return;
                }

                setSetting("showSpinner", true)

                handleRequest("/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                    })
                }, {
                    "40x": async (response, data) => {
                        setSetting("showSpinner", false)
                        if(response.status == 403){
                            const bannedMenu = {
                                [config.errorText + " " + localize("T_pond_user_banned")]: "text",
                                [localize(`T_pond_banned_on {{${parseTimeFormat(config.timeFormat, data.bannedOn)}}}`)]: "text",
                                [localize(`T_pond_banned_until {{${data.bannedUntil == -1 ? localize("T_pond_ban_permanent") : parseTimeFormat(config.timeFormat, data.bannedUntil)}}}`)]: "text",
                                [localize(`T_pond_ban_reason {{${data.bannedReason}}}`)]: "text",
                                "Appeal": () => {
                                    const appealMenu = {
                                        "Please write your appeal message below. Make sure to include any relevant information.": "text",
                                        "id:appeal-title prefix:Appeal Title:": "input",
                                        "id:appeal-text prefix:Type here:": "input",
                                        "Submit Appeal": async () => {

                                            let appealText = document.getElementById("pond-input-appeal-text").innerText;
                                            let appealTitle = document.getElementById("pond-input-appeal-title").innerText;

                                            handleRequest("/appeal-ban", {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    "Session-Token": data.sessionToken,
                                                },
                                                body: JSON.stringify({
                                                    username: username,
                                                    appealTitle: appealTitle,
                                                    appealText: appealText,
                                                    bannedOn: data.bannedOn,
                                                })
                                            }, {
                                                400: async (response, data) => {
                                                    if(data.error == "not_banned"){
                                                        terminal.innerHTML = "";
                                                        createTerminalLine("T_pond_invalid_session", config.errorText);
                                                        createEditableTerminalLine(`${config.currentPath}>`);
                                                    } else {
                                                        createTerminalLine(data.details, config.errorText, {translate: false, expire: 5000});
                                                    }
                                                },
                                                403: (response, data) => {
                                                    terminal.innerHTML = "";
                                                    createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                                                    createEditableTerminalLine(`${config.currentPath}>`);
                                                },
                                                200: async (response, data) => {
                                                    createTerminalLine("T_pond_appeal_submitted", ">", {expire: 5000});
                                                },
                                            });
 
                                        },
                                        "<< Back": () => {
                                            createPondMenu(bannedMenu);
                                        }
                                    }

                                    createPondMenu(appealMenu);
                                }
                            }

                            bannedMenu["Log Out"] = () => {
                                let sessionTokenStore = FroggyFileSystem.getFile(`D:/Pond/secret/${sessionTokenFile}`);
                                sessionTokenStore.write([]);
                                createTerminalLine("T_pond_logged_out", ">");
                                printLn();
                            }

                            createPondMenu(bannedMenu);
                        } else if(response.status == 404){
                            createTerminalLine("T_pond_invalid_name_password", config.errorText);
                            printLn();
                        } else {
                            createTerminalLine(response.status + " " + response.statusText, config.errorText, {translate: false});
                            printLn();
                        }
                    },
                    "200": async (response, data) => {
                        setSetting("showSpinner", false)
                        if(data.type == "unread_warn"){
                            const warningDisplay = {
                                [`<span style='background-color: var(--c12); color: var(--c15);'>${localize("T_pond_attention")}</span>`]: "text",
                                [`${localize("T_pond_user_warned")}<br>${'-'.repeat(78)}<br>`]: "text",
                            };

                            data.warns.forEach((warn) => {
                                let warnText = '';
                                warnText += localize(`T_pond_warned_by {{${warn.warnedBy}}}`) + '<br>';
                                warnText += localize(`T_pond_warned_at {{${parseTimeFormat(config.timeFormat, warn.timestamp)}}}`) + '<br>';
                                warnText += localize(`T_pond_warn_reason {{${warn.reason}}}`) + '<br>';
                                warnText += `Warning ID: ${warn.id}` + `<br>${'-'.repeat(78)}<br>`;
                                warningDisplay[warnText] = "text";
                            });
                            
                            warningDisplay[localize("T_pond_warn_info_text") + "<br>" + '-'.repeat(78)] = "text";

                            warningDisplay[`Acknowledge Warning${data.warns.length == 1 ? "" : "s"}`] = () => {
                                navigator.clipboard.writeText(data.warns.map(warn => warn.id).join(", "));
                                let sessionTokenStore = FroggyFileSystem.getFile(`D:/Pond/secret/${sessionTokenFile}`);
                                sessionTokenStore.write([data.sessionToken, username]);
                                handleRequest("/mark-warn", {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "Session-Token": data.sessionToken,
                                    },
                                    body: JSON.stringify({
                                        markCount: data.warns.length,
                                    })
                                }, {
                                    "200": async (response, data) => {
                                        openPond(data.roles);
                                    },
                                    "40x": async (response, data) => {
                                        createTerminalLine(response.status + " " + response.statusText, config.errorText, {translate: false});
                                        createEditableTerminalLine(`${config.currentPath}>`);
                                    },
                                    "500": async (response, data) => {
                                        createTerminalLine("T_pond_server_unreachable", config.errorText);
                                        createEditableTerminalLine(`${config.currentPath}>`);
                                    }
                                });
                            };

                            warningDisplay[`Log Out`] = () => {
                                let sessionTokenStore = FroggyFileSystem.getFile(`D:/Pond/secret/${sessionTokenFile}`);
                                sessionTokenStore.write([]);
                                createTerminalLine("T_pond_logged_out", ">");
                                printLn();
                            }

                            createPondMenu(warningDisplay);
                        } else {
                            createTerminalLine(`T_pond_login_successful {{${username}}}`, ">");

                            let sessionTokenStore = FroggyFileSystem.getFile(`D:/Pond/secret/${sessionTokenFile}`);
                            let credStore = FroggyFileSystem.getFile(`D:/Pond/secret/${credentialFile}`);

                            sessionTokenStore.write([data.sessionToken, username]);
                            credStore.write([username, password]);

                            openPond(data.roles);
                        }
                    },
                    "500": async (response, data) => {
                        setSetting("showSpinner", false)
                        createTerminalLine("T_pond_server_unreachable", config.errorText);
                        printLn();
                    }
                })
            }

            if(args.length == 0){
                createTerminalLine("T_pond_command_intro_do_h", "");
                createTerminalLine("~~~", "", {translate: false});
                createTerminalLine("T_pond_checking", ">");
                setSetting("showSpinner", true)
                await ping().then((data) => {
                    setSetting("showSpinner", false)
                    if(data.ok){
                        createTerminalLine("T_pond_server_ok", ">");
                        createTerminalLine(`T_pond_server_response_time {{${data.responseTime}}}`, ">")
                    } else {
                        if(data.code == 500){
                            createTerminalLine("T_pond_server_unreachable", config.errorText);
                        } else {
                            createTerminalLine("T_pond_server_error", config.errorText);
                            createTerminalLine(`${data.code} ${data.text}`, config.errorText);
                            createTerminalLine(`T_pond_server_response_time {{${data.responseTime}}}`, ">")
                        }
                    }
                    printLn();
                });
            } else if(args[0] == "--login" || args[0] == "-l") {
                const username = args[1];
                const password = args[2];

                login(username, password);

            } else if(args[0] == "--register" || args[0] == "-r") {
                const username = args[1];
                const password = args[2];

                if(username == undefined || password == undefined){
                    createTerminalLine("T_pond_provide_username_password", config.errorText);
                    printLn();
                    break;
                }
                
                createTerminalLine("T_pond_registration_statement_1", config.alertText);
                createTerminalLine("T_pond_registration_statement_2", config.alertText);
                sendCommand("st", ["terminal_confirm", localize("T_pond_registration_question"), localize("T_yes"), localize("T_no"), localize("T_pond_registration_cancelled")], false);

                new Promise((resolve) => {
                    const interval = setInterval(() => {
                        if(config.currentProgram != "terminal_confirm"){
                            const fsds = parse_fSDS(FroggyFileSystem.getFile("Config:/program_data/terminal_confirm").getData());
                            clearInterval(interval);
                            resolve(fsds.confirmed.value == 1);
                        }
                    }, 100);
                }).then((confirmation) => {
                    if(confirmation){
                        setSetting("showSpinner", true)
                        handleRequest("/register", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                username: username,
                                password: password,
                            })
                        }, {
                            200: async (response, data) => {
                                setSetting("showSpinner", false)
                                createTerminalLine("T_pond_registration_successful", ">");
                                printLn();
                            },
                            400: async (response, data) => {
                                setSetting("showSpinner", false)
                                createTerminalLine("T_pond_registration_failed", config.errorText);
                                createTerminalLine(data.details, "", {translate: false});
                                printLn();
                            },
                            409: async (response, data) => {
                                setSetting("showSpinner", false)
                                createTerminalLine("T_pond_registration_failed", config.errorText);
                                createTerminalLine("T_pond_username_taken", config.errorText);
                                printLn();
                            },
                            500: async (response, data) => {
                                setSetting("showSpinner", false)
                                createTerminalLine("T_pond_server_error", config.errorText);
                                printLn();
                            },
                        });
                    } else {
                        setTimeout(() => {
                            createEditableTerminalLine(`${config.currentPath}>`);
                        }, 100)
                    }
                });

                FroggyFileSystem.getFile("Config:/program_data/terminal_confirm").write([]);

            } else if(args[0] == "-u") {
                let credStore = FroggyFileSystem.getFile(`D:/Pond/secret/${credentialFile}`);

                const username = credStore.getData()[0];
                const password = credStore.getData()[1];

                login(username, password);

            } else if(args[0] == "--help" || args[0] == "-h") {
                createTerminalLine("T_pond_command_help_intro", "");
                createTerminalLine("T_pond_command_help_ping", ">");
                createTerminalLine("T_pond_command_help_login", ">");
                createTerminalLine("T_pond_command_help_register", ">");
                createTerminalLine("T_pond_command_help_u", ">");
                printLn();
            } else if (args[0] == "--test" || args[0] == "-t"){
                // send 10 ping requests and average the response time
                createTerminalLine("T_pond_checking", ">");
                setSetting("showSpinner", true)
                let totalResponseTime = 0;
                let successfulPings = 0;
                for(let i = 0; i < 10; i++){
                    // eslint-disable-next-line no-await-in-loop
                    await ping().then((data) => {
                        if(data.ok){
                            totalResponseTime += data.responseTime;
                            successfulPings += 1;
                            createTerminalLine(`T_pond_successful_response_time {{${data.responseTime}}}`, ">");
                        } else {
                            createTerminalLine(`T_pond_request_failed {{${data.code}}} {{${data.text}}}`, config.errorText);
                        } 
                    });
                }
                setSetting("showSpinner", false)

                if(successfulPings == 0){
                    createTerminalLine("T_pond_all_requests_failed", config.errorText);
                } else {
                    let averageResponseTime = (totalResponseTime / successfulPings).toFixed(3);
                    let percentSuccessful = Math.round((successfulPings / 10) * 100);
                    createTerminalLine(`T_pond_average_response_time {{${averageResponseTime}}} {{${percentSuccessful}}}`, ">");
                }
                printLn();
            } else {
                createTerminalLine(`T_invalid_command_argument {{${args[0]}}}`, config.errorText);
                sendCommand("pond", ["--help"], createEditableLineAfter);
            }

        } break;
        
        case "rename": {
            if(args.length < 2){
                createTerminalLine("T_provide_file_name_and_new", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            let fileName = args[0];
            let newName = args[1];

            const regex = /[^a-zA-Z0-9_.-]/g;

            if(regex.test(newName)){
                createTerminalLine("T_invalid_file_name_chars", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            let file = FroggyFileSystem.getFile(`${config.currentPath}/${fileName}`);

            if(file == undefined){
                createTerminalLine("T_file_does_not_exist", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            if(file.getProperty('write') == false){
                createTerminalLine("T_no_permission_to_rename_file", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            if(FroggyFileSystem.getFile(`${config.currentPath}/${newName}`) != undefined){
                createTerminalLine("T_file_name_already_exists", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            if(newName.length != 3 && config.currentPath == "Config:/langs"){
                createTerminalLine("T_file_name_not_3_char", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            file.rename(newName);
            createTerminalLine(`T_file_renamed`, ">");
            printLn();
        } break;
        case "ribbit":
            if(args.length == 0){
                createTerminalLine("T_provide_text_to_display", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            createTerminalLine(args.join(" "), ">", {translate: false})
            printLn();
        break;

        // save state
        // BUG:  files dont save?
        case "svs":
        case "savestate":
            localStorage.setItem(`froggyOS-state-${config.version}-config`, JSON.stringify(config));
            localStorage.setItem(`froggyOS-state-${config.version}-fs`, FroggyFileSystem.stringify());

            createTerminalLine("T_state_saved", ">")
            printLn();
        break;

        // make directories
        case "s":
        case "spawn":
            directory = config.currentPath + "/" + args[0];

            if(config.dissallowSubdirectoriesIn.includes(config.currentPath)){
                createTerminalLine("T_cannot_create_directories_here", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            if(args[0] == undefined){
                createTerminalLine("T_provide_directory_name", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            if(FroggyFileSystem.getDirectory(directory) != undefined){
                createTerminalLine("T_directory_already_exists", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            FroggyFileSystem.createDirectory(directory);
            createTerminalLine("T_directory_created", ">");
            sendCommand("[[BULLFROG]]changepath", [directory], createEditableLineAfter);
        break;

        // read file contents
        case "spy":
            if(args.length == 0){
                createTerminalLine("T_provide_file_name", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            file = FroggyFileSystem.getFile(`${config.currentPath}/${args[0]}`);
            if(file == undefined){
                createTerminalLine("T_file_does_not_exist", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            if(file.getProperty('hidden') == true || file.getProperty('read') == false){
                createTerminalLine("T_no_permission_to_read_file", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            createTerminalLine("T_file_info_intro", "");
            let fileType = "T_file_info_type_text";
            config.allowedProgramDirectories.forEach(dir => {
                let programFile = FroggyFileSystem.getFile(`${dir}/${file.getName()}`);
                if(programFile != undefined && programFile.getProperty('hidden') == false){
                    fileType = "T_file_info_type_program";
                }
            });
            if(config.currentPath == "D:/Palettes") fileType = "T_file_info_type_palette";
            if(config.currentPath == "Config:/langs") fileType = "T_file_info_type_language";
            if(config.currentPath == "D:/Macros") fileType = "T_file_info_type_macro";
            if(config.currentPath == "D:/Spinners") fileType = "T_file_info_type_spinner";
            if(config.currentPath == "Config:/program_data") fileType = "T_file_info_type_program_data";
            createTerminalLine(fileType, "");
            createTerminalLine("T_file_info_size {{"+file.getSize()+"}}", "");
            createTerminalLine("~".repeat(77), "~", {translate: false});
            file.getData().forEach(line => {
                createTerminalLine(line, ">", {translate: false})
            });
            printLn();
        break;

        case "st":
        case "swimto":
            function getProgramList(){
                let programList = [];
                for(let directory of config.allowedProgramDirectories){
                    let dir = FroggyFileSystem.getDirectory(directory);
                    dir.forEach(file => {
                        if(file.getProperty("hidden") || file.getProperty("transparent")) return;
                        programList.push(file.getName());
                    })
                }
                return programList;
            }

            if(!config.programList.includes(args[0])){
                createTerminalLine("T_provide_valid_program", config.errorText);
                createTerminalLine("T_available_programs", "");
                createTerminalLine(getProgramList().join(", "), ">", {translate: false});
                hadError = true;
                printLn();
                break;
            }

            const previousProgram = structuredClone(config.currentProgram);

            config.programSession++
            if(args[0] == "cli"){
                printLn();
            } else if(args[0] == "lilypad"){
                createTerminalLine("T_lilypad_exit", "");
                createLilypadLine(">", undefined, undefined);
            } else {
                let file;
                for(let directory of config.allowedProgramDirectories){
                    file = FroggyFileSystem.getFile(`${directory}/${args[0]}`);
                    if(file != undefined) break;
                }
                if(file.getProperty('hidden') == true){
                    createTerminalLine("T_provide_valid_program", config.errorText);
                    createTerminalLine("T_available_programs", "");
                    createTerminalLine(getProgramList().join(", "), ">", {translate: false});
                    hadError = true;
                    printLn();
                    break;
                }
                if(file.getProperty('read') == false){
                    createTerminalLine("T_no_permission_to_run_program", config.errorText);
                    hadError = true;
                    printLn();
                    break;
                }

                // get all file arguments besides the first one
                let fileArguments = args.slice(1).map(arg => arg.trim());

                config.currentProgram = args[0];

                setSetting("currentSpinner", getSetting("defaultSpinner"));
                setSetting("showSpinner", false)

                const options = {
                    out: (token) => {
                        let formatting = {
                            type: 'blanket',
                            t: function(){
                                if(token.type == "string") {
                                    return "froggyscript-string-color";
                                } else if(token.type == "number") {
                                    return "froggyscript-number-color";
                                } else {
                                    return "terminal-line-text"
                                }
                            }()
                        };

                        token.value = String(token.value).replaceAll(/(?<!\\)`n/g, '\n');

                        createTerminalLine(String(token.value), ">", {translate: false, formatting: [formatting]});
                        
                    },
                    errout: (err) => {
                        console.log(previousProgram)
                        createTerminalLine("\u00A0", config.programErrorText.replace("{{}}", err.type), {translate: false});
                        createTerminalLine("\u00A0", "", {translate: false});
                        createTerminalLine(err.message, "", {translate: false});
                        createTerminalLine(`\u00A0in line: ${err.line+1}`, "", {translate: false})
                        createTerminalLine(`\u00A0at position: ${err.col+1}`, "", {translate: false})

                        if(err.type == "InternalJavaScriptError"){
                            printLn();
                        }
                    },

                    smallerrout: (text) => {
                        createTerminalLine(text, config.errorText, {translate: false});
                    },

                    smallwarnout: (text) => {
                        createTerminalLine(text, createErrorText(3, "Warning"), {translate: false});
                    },

                    warnout: (warn) => {
                        createTerminalLine(warn.message, createErrorText(3, "Warning"), {translate: false});
                        createTerminalLine(`\u00A0in line: ${warn.line}`, "", {translate: false})
                        createTerminalLine(`\u00A0at position: ${warn.col}`, "", {translate: false});
                    },

                    onComplete: () => {
                        config.currentProgram = previousProgram;
                        printLn();
                    },

                    onError: (error) => {
                        config.currentProgram = previousProgram;
                        let command = `[[BULLFROG]]gotoprogramline ${args[0]} ${error.line} ${error.col}`;
                        if(error.type != "quietKill" && error.type != "kill") addToCommandHistory(command);
                        printLn();
                    }
                }

                const fs3 = new FroggyScript3(options)

                fs3.interpret(file.getData(), file.getName(), fileArguments);
            }
        break;

        // hidden commands =======================================================================================================================================
        case "[[BULLFROG]]changepath":
            if(args.length == 0){
                createTerminalLine("T_provide_path", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            config.currentPath = args.join("");
            printLn();
        break;

        // arg 1: file in the program directory
        // arg 2: line #
        // opens that file up in lilypad and highlights the line
        // only if it is not hidden and you have write permission
        case "[[BULLFROG]]gotoprogramline": {
            if(args.length < 3 || isNaN(parseInt(args[1])) || isNaN(parseInt(args[1]))){
                createTerminalLine("T_provide_program_name_line_col", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            let error1 = sendCommand("[[BULLFROG]]changepath", ["D:/Programs"], false)
            let programFile = FroggyFileSystem.getFile(`D:/Programs/${args[0]}`);
            if(programFile == undefined){
                createTerminalLine("T_program_does_not_exist", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            if(programFile.getProperty('write') == false){
                createTerminalLine("T_no_permission_to_edit_program", config.errorText);
                hadError = true;
                printLn();
                break;
            }


            if(hadError == false){
                openLilypad(programFile, createEditableLineAfter);
                const lines = document.querySelectorAll("[data-program='lilypad-session-3']");
            }
            
            
        } break;


        case '[[BULLFROG]]greeting': {
            createTerminalLine("T_greeting_1", "");
            createTerminalLine(`T_greeting_2 {{${config.version}}}` , "");
            printLn();
        } break;

        case '[[BULLFROG]]help':
            createTerminalLine("T_bullfrog_commands_intro", "");
            createTerminalLine("T_bullfrog_commands_changepath", ">");
            createTerminalLine("T_bullfrog_commands_greeting", ">");
            createTerminalLine("T_bullfrog_commands_help", ">");
            createTerminalLine("T_bullfrog_commands_setstatbar", ">");
            createTerminalLine("T_bullfrog_commands_statbarlock", ">");
            createTerminalLine("T_bullfrog_commands_showspinner", ">");
            createTerminalLine("T_bullfrog_commands_setspinner", ">");
            createTerminalLine("T_bullfrog_commands_usavestate", ">");
            createTerminalLine("T_bullfrog_commands_uloadstate", ">");
            createTerminalLine("T_bullfrog_commands_uclearstate", ">");
            createTerminalLine("T_bullfrog_commands_autoloadstate", ">");
            createTerminalLine("T_bullfrog_commands_vlang", ">");
            createTerminalLine("T_bullfrog_commands_translations", ">");
            createTerminalLine("T_bullfrog_commands_trigdiag", ">");
            printLn();
        break;

        case '[[BULLFROG]]setstatbar':
            let text = args.join(" ");
            if(text > 78){
                createTerminalLine("T_arg_too_long", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            barText.textContent = args.join(" ");
            printLn();
        break;

        case '[[BULLFROG]]showspinner':
            let bool = args[0];
            if(bool == "1") setSetting("showSpinner", true);
            else if(bool == "0") setSetting("showSpinner", false);
            else {
                createTerminalLine("T_invalid_args_provide_1_0", config.errorText);
                hadError = true;
            }
            printLn();
        break;

        case '[[BULLFROG]]statbarlock': {
            let bool = args[0];
            if(bool == "1") setSetting("updateStatBar", false);
            else if(bool == "0") setSetting("updateStatBar", true);
            else {
                createTerminalLine("T_invalid_args_provide_1_0", config.errorText);
                hadError = true;
            }
            printLn();
        } break;

        case "[[BULLFROG]]setspinner": {
            let spinner = args[0];
            let validSpinners = FroggyFileSystem.getDirectory("D:/Spinners");
            if(validSpinners.find(s => s.getName() == spinner) == undefined){
                createTerminalLine("T_spinner_does_not_exist", config.errorText);
                createTerminalLine(`T_available_spinners`, "");

                createTerminalLine(validSpinners.filter(s => s.getProperty('transparent') !== true).map(s => s.getName()).join(", "), ">", {translate: false});

                hadError = true;
                printLn();
                break;
            } else {
                setSetting("currentSpinner", spinner);
                printLn();
                break;
            }
        } break;

        case "[[BULLFROG]]urgentsavestate": {
            localStorage.setItem("froggyOS-urgent-state-config", JSON.stringify(config));
            localStorage.setItem("froggyOS-urgent-state-fs", FroggyFileSystem.stringify());
            printLn();
        } break;

        case "[[BULLFROG]]urgentloadstate": {
            let configState = localStorage.getItem("froggyOS-urgent-state");
            let fsState = localStorage.getItem("froggyOS-urgent-state-fs");

            if(configState == null || fsState == null){
                createTerminalLine("T_no_urgent_state_found", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            for(let key in JSON.parse(configState)){
                config[key] = JSON.parse(configState)[key];
            }

            FroggyFileSystem.loadFromString(fsState);
            changeColorPalette(config.colorPalette);

            printLn();
        } break;

        case "[[BULLFROG]]urgentclearstate": {
            localStorage.removeItem("froggyOS-urgent-state-config");
            localStorage.removeItem("froggyOS-urgent-state-fs");
            printLn();
        } break;

        case "[[BULLFROG]]autoloadstate": {
            let state = localStorage.getItem(`froggyOS-state-${config.version}-config`);
            let fsState = localStorage.getItem(`froggyOS-state-${config.version}-fs`);

            if(state != null && fsState != null){
                for(let key in JSON.parse(state)){
                    config[key] = JSON.parse(state)[key];
                }
                FroggyFileSystem.loadFromString(fsState);
                changeColorPalette(config.colorPalette);
                createTerminalLine("Loaded froggyOS from memory.", config.alertText, {translate: false});
            }

            printLn();
        } break;

        case "[[BULLFROG]]validatelanguage": {
            if(!config.validateLanguageOnStartup) {
                printLn();
                return;
            }
            // get every language file except for TRANSLATION_MAP and the current language
            let languageFiles = FroggyFileSystem.getDirectory("Config:/langs").filter(file => file.getName() != "ldm" && file.getName() != config.language)

            languageFiles.forEach(file => {
                let name = file.getName();
                if(validateLanguageFile(name) == false){
                    createTerminalLine(`T_invalid_lang_file {{${name}}}`, config.translationWarningText);
                }
            })

            if(validateLanguageFile(config.language) == false){
                createTerminalLine(`T_current_lang_invalid`, config.translationErrorText);
                setSetting("language", "ldm");
            }
            printLn();
        } break;

        case "[[BULLFROG]]translations": {
            let translationFiles = FroggyFileSystem.getDirectory("Config:/langs").filter(file => file.getName() != "ldm");

            let ldm = FroggyFileSystem.getFile("Config:/langs/ldm").getData();

            let linesNotTranslated = {};

            translationFiles.forEach((file, i) => {
                let linesTranslated = 0;
                let fileName = file.getName();
                let fileData = file.getData();
                linesNotTranslated[fileName] = [];
                for(let i = 1; i < fileData.length; i++){
                    if(fileData[i] != ldm[i]) linesTranslated++;
                    if(fileData[i] == ldm[i]) linesNotTranslated[fileName].push(fileData[i]);
                }
                let percent = linesTranslated / (ldm.length-1) * 100;
                createTerminalLine(`${fileName}: ${percent.toFixed(2)}%`, ">", {translate: false});
            })
            createTerminalLine("* descriptors not translated *", "", {translate: false});
            for(let i in linesNotTranslated){
                if(linesNotTranslated[i].length != 0) {
                    createTerminalLine("\u00A0", "", {translate: false});
                    createTerminalLine(`${i}:`, " ", {translate: false});
                }
                linesNotTranslated[i].forEach((line, index) => {
                    if(linesNotTranslated[i][index] == undefined) return; // skip undefined lines
                    createTerminalLine(`${line}`, ">", {translate: false});
                })
            }

            printLn();
        } break;

        case "[[BULLFROG]]triggerdialogue": {
            let dialogue = args.join(" ");
            if(dialogue == undefined){
                createTerminalLine("T_provide_valid_t_desc", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            let localized = localize(dialogue);

            if(localized == undefined){
                createTerminalLine("T_provide_valid_t_desc", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            createTerminalLine(localized, ">", {translate: false});
            printLn();
            

        } break;

        default:
            createTerminalLine(`T_doesnt_know {{${command}}}`, ">");
            hadError = true;
            printLn();
        break;
    }

    return hadError;
}

/*
create a line for user input
path - the path

PROGRAM SPECIFIC: for program CLI ===============================================================================================
*/
function createEditableTerminalLine(path){
    config.programSession++;
    let lineContainer = document.createElement('div');
    let terminalPath = document.createElement('span');
    let terminalLine = document.createElement('div');

    lineContainer.classList.add('line-container');
    terminalLine.setAttribute('contenteditable', 'plaintext-only');
    terminalLine.setAttribute('spellcheck', 'false');
    terminalLine.classList.add('terminal-line');

    terminalPath.textContent = path;
    terminalLine.textContent = "";

    terminalLine.addEventListener('keydown', function(e){
        if(e.key == "Enter" || e.key == "ArrowUp" || e.key == "ArrowDown"){
            e.preventDefault();
        }
    });

    terminalLine.addEventListener('keyup', async function(e){
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

        if(e.key == "Enter" && e.shiftKey == false){
            e.preventDefault();
            terminalLine.setAttribute('contenteditable', 'false');
            let args = userInput.split(" ");

            terminalLine.innerHTML = terminalLine.innerHTML.replaceAll("<div><br></div>", "");

            let command = args[0].trim();
            args = args.slice(1);

            if(config.commandHistory[0] != userInput && userInput.trim() != "") config.commandHistory = [userInput].concat(config.commandHistory)
            config.commandHistoryIndex = -1;

            await sendCommand(command, args);
        }

        if(e.key == "ArrowUp"){
            e.preventDefault();
            if(config.commandHistoryIndex < config.commandHistory.length - 1) config.commandHistoryIndex++;
            terminalLine.textContent = config.commandHistory[config.commandHistoryIndex];
            moveCaretToEnd(terminalLine);
        }

        if(e.key == "ArrowDown"){
            e.preventDefault();
            if(config.commandHistoryIndex > 0) config.commandHistoryIndex--;
            terminalLine.textContent = config.commandHistory[config.commandHistoryIndex];
            moveCaretToEnd(terminalLine);
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
    terminalLine.setAttribute('contenteditable', 'plaintext-only');
    terminalLine.setAttribute('data-program', `lilypad-session-${config.programSession}`);
    terminalLine.setAttribute('data-filename', filename);
    terminalLine.setAttribute('spellcheck', 'false');
    terminalLine.style.wordBreak = "break-all";

    terminalPath.textContent = path;
    terminalLine.textContent = "";

    function highlight(e){
        let highlightedLines = document.querySelectorAll('.highlighted-line');
        highlightedLines.forEach(line => {
            unhilight(line);
        });
        e.classList.add('highlighted-line');
    }

    function unhilight(e){
        e.classList.remove('highlighted-line');
    }

    function updateLinePrefixes(linetype){
        let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
        lines.forEach((line, index) => {
            if(linetype == "code"){
                let prefix = String(index + 1).padStart(3, "0");
                line.previousElementSibling.textContent = prefix;
            } else if(linetype == "palette"){
                let prefix = String(index).padStart(2, "0");
                if(index > 15) prefix = "--"
                line.previousElementSibling.textContent = prefix;
            } else {
                line.previousElementSibling.textContent = ">";
            }
        })
    }

    window.terminalLineKeydownHandler = (e) => {
        function keybindCondition(key, meta = { shiftKey: false, ctrlKey: false, altKey: false }){
            meta.shiftKey = meta.shiftKey || false;
            meta.ctrlKey = meta.ctrlKey || false;
            meta.altKey = meta.altKey || false;

            return e.key == key && e.shiftKey == meta.shiftKey && e.ctrlKey == meta.ctrlKey && e.altKey == meta.altKey;
        }

        function swapElements(a, b) {
            const aParent = a.parentNode;
            const bParent = b.parentNode;

            const aNext = a.nextSibling;
            const bNext = b.nextSibling;

            // Move a to b's place
            if (bNext) {
                bParent.insertBefore(a, bNext);
            } else {
                bParent.appendChild(a);
            }

            // Move b to a's place
            if (aNext) {
                aParent.insertBefore(b, aNext);
            } else {
                aParent.appendChild(b);
            }
        }
        let line = document.activeElement;
        let cursorPosition = getCaretPosition(line);
        let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
        let currentLineIndex = Array.from(lines).indexOf(line);

        if(keybindCondition("Enter")){
            e.preventDefault();
            let textAfterCursor = line.textContent.slice(cursorPosition);

            line.textContent = line.textContent.slice(0, cursorPosition);

            createLilypadLine("", linetype, filename);
            let newFocus = document.activeElement;
            newFocus.textContent = textAfterCursor;
            updateLinePrefixes(linetype);
            highlight(newFocus);
        }

        if(keybindCondition("Enter", { shiftKey: true })){
            e.preventDefault();
            createLilypadLine("", linetype, filename);
            updateLinePrefixes(linetype);
            highlight(document.activeElement);
        }

        if(keybindCondition("Backspace")){
            let selection = window.getSelection();

            if(selection.rangeCount > 0 && selection.getRangeAt(0).startOffset != selection.getRangeAt(0).endOffset){
                e.preventDefault();
                let range = selection.getRangeAt(0);
                range.deleteContents();
            } else if(currentLineIndex > 0 && cursorPosition == 0){
                e.preventDefault();

                let currentLine = lines[currentLineIndex];
                let previousLine = lines[currentLineIndex - 1];
                let parent = lines[currentLineIndex].parentElement;

                let previousLineLength = previousLine.textContent.length;
                let textToAdd = currentLine.textContent;
                previousLine.textContent += textToAdd;

                moveCaretToPosition(previousLine, previousLineLength);
                parent.remove();
                highlight(previousLine);
                updateLinePrefixes(linetype);
            }
        };

        // either add sublines for multiline or add ctrl + shift + up/down
        
        if(keybindCondition("ArrowUp")){
            e.preventDefault();

            // max characters per line = element.clientWidth / 8 - 0.5
            if(currentLineIndex > 0){
                let newLine = lines[currentLineIndex - 1]

                let caretPosition = (line.textContent.trim().length === 0)
                ? newLine.textContent.length
                : getCaretPosition(line);

                moveCaretToPosition(newLine, caretPosition);
                highlight(newLine);
            };
        };

        if(keybindCondition("ArrowDown")){
            e.preventDefault();

            if(currentLineIndex < lines.length - 1){
                let newLine = lines[currentLineIndex + 1];

                let caretPosition = (line.textContent.trim().length === 0)
                    ? newLine.textContent.length
                    : getCaretPosition(line);

                moveCaretToPosition(newLine, caretPosition);
                highlight(newLine);
            };
        };
        
        if(keybindCondition("ArrowUp", { shiftKey: true })){
            e.preventDefault();

            let previousLine = lines[currentLineIndex - 1];
            if(previousLine != undefined){
                moveCaretToPosition(previousLine, previousLine.textContent.length);
                highlight(previousLine);
            }
        }

        if(keybindCondition("ArrowDown", { shiftKey: true })){
            e.preventDefault();

            let nextLine = lines[currentLineIndex + 1];
            if(nextLine != undefined){
                moveCaretToPosition(nextLine, nextLine.textContent.length);
                highlight(nextLine);
            }
        }

        if(keybindCondition("ArrowUp", { ctrlKey: true })){
            e.preventDefault();

            let firstLine = lines[0];
            let caretPosition = firstLine.textContent.length > line.textContent.length
                ? line.textContent.length
                : firstLine.textContent.length

            moveCaretToPosition(firstLine, caretPosition);
            highlight(firstLine);
        };

        if(keybindCondition("ArrowDown", { ctrlKey: true })){
            e.preventDefault();

            let lastLine = lines[lines.length - 1];

            let caretPosition = lastLine.textContent.length > line.textContent.length
                ? line.textContent.length
                : lastLine.textContent.length;

            moveCaretToPosition(lastLine, caretPosition);
            highlight(lastLine);
        };

        if(keybindCondition("ArrowUp", { altKey: true })){
            e.preventDefault();
            let previousLine = lines[currentLineIndex - 1];
            let currentLine = lines[currentLineIndex];

            let cursorPosition = getCaretPosition(currentLine);

            if(previousLine != undefined){
                swapElements(previousLine, currentLine);
                moveCaretToPosition(currentLine, cursorPosition);
                highlight(currentLine);
                updateLinePrefixes(linetype);
            }
        }

        if(keybindCondition("ArrowDown", { altKey: true })){
            e.preventDefault();
            let nextLine = lines[currentLineIndex + 1];
            let currentLine = lines[currentLineIndex];

            let cursorPosition = getCaretPosition(currentLine);

            if(nextLine != undefined){
                swapElements(currentLine, nextLine);
                moveCaretToPosition(currentLine, cursorPosition);
                highlight(currentLine);
                updateLinePrefixes(linetype);
            }
        }

        if(keybindCondition("ArrowLeft", { ctrlKey: true })){
            e.preventDefault();
            moveCaretToPosition(line, 0);
        };

        if(keybindCondition("ArrowRight", { ctrlKey: true })){
            e.preventDefault();
            moveCaretToPosition(line, line.textContent.length);
        }

        if(keybindCondition("Delete")){
            e.preventDefault();
            if(currentLineIndex != 0){
                let previousLine = lines[currentLineIndex - 1];

                moveCaretToPosition(previousLine, getCaretPosition(line));

                line.parentElement.remove();

                highlight(previousLine);
                updateLinePrefixes(linetype);
            }   
        }



        if(e.key == "Escape"){
            e.preventDefault();
            config.currentProgram = "cli";
            //clearInterval(highlightedLineUpdater);

            let currentFile = FroggyFileSystem.getFile(`${config.currentPath}/${filename}`);

            let dataToWrite = [];

            for(let i = 0; i < lines.length; i++){
                dataToWrite.push(lines[i].textContent);
                lines[i].setAttribute('contenteditable', 'false');
                lines[i].classList.remove("highlighted-line");
                lines[i].removeEventListener('keydown', terminalLineKeydownHandler);
            };

            if(filename == undefined){
                createEditableTerminalLine(`${config.currentPath}>`);
            } else {
                terminalLine.removeEventListener('keydown', terminalLineKeydownHandler);
                if(e.shiftKey == false){
                    createTerminalLine(`T_saving_file`, ">");

                    let dataLength = 0;
    
                    dataToWrite.forEach(line => {
                        dataLength += line.length;
                    });
                    
                    setSetting("showSpinner", true)
                    setTimeout(function(){
                        setSetting("showSpinner", false)

                        try {
                            currentFile.write(dataToWrite);
                        } catch (error) {
                            createTerminalLine(`T_file_does_not_exist`, config.errorText);
                            createEditableTerminalLine(`${config.currentPath}>`);
                            return;
                        }
    
                        createTerminalLine(`T_saving_done`, ">");
                        
                        createEditableTerminalLine(`${config.currentPath}>`);
                    }, dataLength);
                } else {
                    createTerminalLine(`T_lilypad_exit_without_saving`, ">");
                    createEditableTerminalLine(`${config.currentPath}>`);
                }
            }
        }
    };

    terminalLine.addEventListener('keydown', terminalLineKeydownHandler);

    lineContainer.appendChild(terminalPath);
    lineContainer.appendChild(terminalLine);
    
    let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);

    if(lines.length == 0) terminal.appendChild(lineContainer);
    else terminal.insertBefore(lineContainer, document.activeElement.parentElement.nextSibling);

    terminal.scrollTop = terminal.scrollHeight;
    terminalLine.focus();
    updateLinePrefixes(linetype);
}


async function createLilypadLinePondDerivative(path, filename, options){
    let exitMenu = options.exitMenu || null;

    config.currentProgram = "lilypad";
    let lineContainer = document.createElement('div');
    let terminalPath = document.createElement('span');
    let terminalLine = document.createElement('div');

    lineContainer.classList.add('line-container');
    terminalLine.setAttribute('contenteditable', 'plaintext-only');
    terminalLine.setAttribute('data-program', `lilypad-pond-session-${config.programSession}`);
    terminalLine.setAttribute('data-filename', filename);
    terminalLine.setAttribute('spellcheck', 'false');
    terminalLine.style.wordBreak = "break-all";

    terminalPath.textContent = path;
    terminalLine.textContent = "";

    function highlight(e){
        let highlightedLines = document.querySelectorAll('.highlighted-line');
        highlightedLines.forEach(line => {
            unhilight(line);
        });
        e.classList.add('highlighted-line');
    }

    function unhilight(e){
        e.classList.remove('highlighted-line');
    }

    function updateLinePrefixes(){
        let lines = document.querySelectorAll(`[data-program='lilypad-pond-session-${config.programSession}']`);
        lines.forEach((line, index) => {
            line.previousElementSibling.textContent = ">";
        })
    }

    const previousSpinner = structuredClone(config.currentSpinner);

    window.terminalLineKeydownHandler = async (e) => {
        if (["Backspace", "Delete", "Enter", "Tab"].includes(e.key) ||
            (e.key.length === 1 && !e.ctrlKey && !e.metaKey) 
        ) {
            setSetting("showSpinner", true);
            setSetting("currentSpinner", "unsaved");
        }

        function keybindCondition(key, meta = { shiftKey: false, ctrlKey: false, altKey: false }){
            meta.shiftKey = meta.shiftKey || false;
            meta.ctrlKey = meta.ctrlKey || false;
            meta.altKey = meta.altKey || false;

            return e.key == key && e.shiftKey == meta.shiftKey && e.ctrlKey == meta.ctrlKey && e.altKey == meta.altKey;
        }

        function swapElements(a, b) {
            const aParent = a.parentNode;
            const bParent = b.parentNode;

            const aNext = a.nextSibling;
            const bNext = b.nextSibling;

            // Move a to b's place
            if (bNext) {
                bParent.insertBefore(a, bNext);
            } else {
                bParent.appendChild(a);
            }

            // Move b to a's place
            if (aNext) {
                aParent.insertBefore(b, aNext);
            } else {
                aParent.appendChild(b);
            }
        }
        let line = document.activeElement;
        let cursorPosition = getCaretPosition(line);
        let lines = document.querySelectorAll(`[data-program='lilypad-pond-session-${config.programSession}']`);
        let currentLineIndex = Array.from(lines).indexOf(line);

        if(keybindCondition("Enter")){
            e.preventDefault();
            let textAfterCursor = line.textContent.slice(cursorPosition);

            line.textContent = line.textContent.slice(0, cursorPosition);

            createLilypadLinePondDerivative("", filename, { exitMenu: exitMenu });
            let newFocus = document.activeElement;
            newFocus.textContent = textAfterCursor;
            updateLinePrefixes();
            highlight(newFocus);
        }

        if(keybindCondition("Enter", { shiftKey: true })){
            e.preventDefault();
            createLilypadLinePondDerivative("", filename, { exitMenu: exitMenu });
            updateLinePrefixes();
            highlight(document.activeElement);
        }

        if(keybindCondition("Backspace")){
            let selection = window.getSelection();

            if(selection.rangeCount > 0 && selection.getRangeAt(0).startOffset != selection.getRangeAt(0).endOffset){
                e.preventDefault();
                let range = selection.getRangeAt(0);
                range.deleteContents();
            } else if(currentLineIndex > 0 && cursorPosition == 0){
                e.preventDefault();

                let currentLine = lines[currentLineIndex];
                let previousLine = lines[currentLineIndex - 1];
                let parent = lines[currentLineIndex].parentElement;

                let previousLineLength = previousLine.textContent.length;
                let textToAdd = currentLine.textContent;
                previousLine.textContent += textToAdd;

                moveCaretToPosition(previousLine, previousLineLength);
                parent.remove();
                highlight(previousLine);
                updateLinePrefixes();
            }
        };

        // either add sublines for multiline or add ctrl + shift + up/down
        
        if(keybindCondition("ArrowUp")){
            e.preventDefault();

            // max characters per line = element.clientWidth / 8 - 0.5
            if(currentLineIndex > 0){
                let newLine = lines[currentLineIndex - 1]

                let caretPosition = (line.textContent.trim().length === 0)
                ? newLine.textContent.length
                : getCaretPosition(line);

                moveCaretToPosition(newLine, caretPosition);
                highlight(newLine);
            };
        };

        if(keybindCondition("ArrowDown")){
            e.preventDefault();

            if(currentLineIndex < lines.length - 1){
                let newLine = lines[currentLineIndex + 1];

                let caretPosition = (line.textContent.trim().length === 0)
                    ? newLine.textContent.length
                    : getCaretPosition(line);

                moveCaretToPosition(newLine, caretPosition);
                highlight(newLine);
            };
        };
        
        if(keybindCondition("ArrowUp", { shiftKey: true })){
            e.preventDefault();

            let previousLine = lines[currentLineIndex - 1];
            if(previousLine != undefined){
                moveCaretToPosition(previousLine, previousLine.textContent.length);
                highlight(previousLine);
            }
        }

        if(keybindCondition("ArrowDown", { shiftKey: true })){
            e.preventDefault();

            let nextLine = lines[currentLineIndex + 1];
            if(nextLine != undefined){
                moveCaretToPosition(nextLine, nextLine.textContent.length);
                highlight(nextLine);
            }
        }

        if(keybindCondition("ArrowUp", { ctrlKey: true })){
            e.preventDefault();

            let firstLine = lines[0];
            let caretPosition = firstLine.textContent.length > line.textContent.length
                ? line.textContent.length
                : firstLine.textContent.length

            moveCaretToPosition(firstLine, caretPosition);
            highlight(firstLine);
        };

        if(keybindCondition("ArrowDown", { ctrlKey: true })){
            e.preventDefault();

            let lastLine = lines[lines.length - 1];

            let caretPosition = lastLine.textContent.length > line.textContent.length
                ? line.textContent.length
                : lastLine.textContent.length;

            moveCaretToPosition(lastLine, caretPosition);
            highlight(lastLine);
        };

        if(keybindCondition("ArrowUp", { altKey: true })){
            e.preventDefault();
            let previousLine = lines[currentLineIndex - 1];
            let currentLine = lines[currentLineIndex];

            let cursorPosition = getCaretPosition(currentLine);

            if(previousLine != undefined){
                swapElements(previousLine, currentLine);
                moveCaretToPosition(currentLine, cursorPosition);
                highlight(currentLine);
                updateLinePrefixes();
            }
        }

        if(keybindCondition("ArrowDown", { altKey: true })){
            e.preventDefault();
            let nextLine = lines[currentLineIndex + 1];
            let currentLine = lines[currentLineIndex];

            let cursorPosition = getCaretPosition(currentLine);

            if(nextLine != undefined){
                swapElements(currentLine, nextLine);
                moveCaretToPosition(currentLine, cursorPosition);
                highlight(currentLine);
                updateLinePrefixes();
            }
        }

        if(keybindCondition("ArrowLeft", { ctrlKey: true })){
            e.preventDefault();
            moveCaretToPosition(line, 0);
        };

        if(keybindCondition("ArrowRight", { ctrlKey: true })){
            e.preventDefault();
            moveCaretToPosition(line, line.textContent.length);
        }

        if(keybindCondition("Delete")){
            e.preventDefault();
            if(currentLineIndex != 0){
                let previousLine = lines[currentLineIndex - 1];

                moveCaretToPosition(previousLine, getCaretPosition(line));

                line.parentElement.remove();

                highlight(previousLine);
                updateLinePrefixes();
            }   
        }

        if(keybindCondition("F1")){
            e.preventDefault();
            const file = FroggyFileSystem.getFile(`D:/Pond/drafts/${filename}`);

            let dataToWrite = [];

            for(let i = 0; i < lines.length; i++){
                dataToWrite.push(lines[i].textContent);
            }

            file.write(dataToWrite);
            setSetting("showSpinner", false)
            setSetting("currentSpinner", previousSpinner)
        }

        if(keybindCondition("F3")){
            e.preventDefault();
            const file = FroggyFileSystem.getFile(`D:/Pond/drafts/${filename}`);

            if(!file){
                createTerminalLine(`T_file_does_not_exist`, config.errorText);
                return;
            }

            const fileData = [];

            for(let i = 0; i < file.getData().length; i++){
                let line = file.getData()[i];
                if(line.trim().length == 0){
                    fileData.push("\u00a0");
                } else {
                    fileData.push(line);
                }
            }

            if(!messageValidationRegex.test(fileData.join(""))){
                createTerminalLine(`T_pond_draft_invalid_format`, config.errorText, {expire: 5000});
                return;
            } else {
                const match = file.getData().join("").trim().match(messageValidationRegex);
                const recipient = match[1].trim();
                const subject = match[2].trim();
                const body = getBody(fileData);

                function getBody(arr) {
                    for (let i = 0; i < arr.length - 1; i++) {
                        if (arr[i] === "-----" && arr[i + 1] === "Body:") {
                            return arr.slice(i + 2);
                        }
                    }
                    return []; // not found
                }

                const timestamp = Date.now();

                const sessionToken = FroggyFileSystem.getFile(`D:/Pond/secret/${sessionTokenFile}`).getData()[0].trim();

                handleRequest("/send", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Session-Token": sessionToken
                    },
                    body: JSON.stringify({
                        recipient: recipient,
                        subject: subject,
                        body: body,
                        timestamp: timestamp
                    })
                }, {
                    400: (req, data) => {
                        if(data.type == "message_too_long"){
                            createTerminalLine(`T_pond_message_too_long`, config.errorText, {expire: 5000});
                        }
                    },
                    401: (req, data) => {
                        terminal.innerHTML = "";
                        createTerminalLine(`T_pond_invalid_session`, config.errorText);
                        createEditableTerminalLine(`${config.currentPath}>`);
                    },
                    403: (req, data) => {
                        if(data.type == "recipient_banned"){
                            createTerminalLine(`T_pond_error_recipient_banned {{${recipient}}}`, config.errorText, {expire: 5000});
                            return;
                        }
                        terminal.innerHTML = "";
                        createTerminalLine(`T_session_forcefully_terminated`, config.errorText, {expire: 5000});
                        createEditableTerminalLine(`${config.currentPath}>`);
                    },
                    404: (req, data) => {
                        if(data.type == "recipient"){
                            createTerminalLine(`T_pond_user_not_found`, config.errorText, {expire: 5000});
                        } else {
                            createTerminalLine(`T_pond_error_sending_message {{${data.error}}}`, config.errorText, {expire: 5000});
                        }
                    },
                    200: (req, data) => {
                        const file = structuredClone(FroggyFileSystem.getFile(`D:/Pond/drafts/${filename}`).toJSON());

                        const newFile = FroggyFile.from(file);

                        const newName = "sent-" + (file.name.replace(/^draft-/, ""))

                        newFile.rename(newName);

                        newFile.setProperty("write", false);
                        newFile.setProperty("read", true);
                        newFile.setProperty("hidden", false);
                        newFile.setProperty("transparent", false);

                        FroggyFileSystem.deleteFile(`D:/Pond/drafts/${filename}`);
                        FroggyFileSystem.addFileToDirectory("D:/Pond/sent", newFile);

                        createPondMenu(mainMenu);
                    }
                })
            }
        }

        if(e.key == "Escape"){
            e.preventDefault();

            let currentFile = FroggyFileSystem.getFile(`D:/Pond/drafts/${filename}`);

            let dataToWrite = [];

            for(let i = 0; i < lines.length; i++){
                dataToWrite.push(lines[i].textContent);
                lines[i].setAttribute('contenteditable', 'false');
                lines[i].classList.remove("highlighted-line");
                lines[i].removeEventListener('keydown', terminalLineKeydownHandler);
            };

            if(filename == undefined){
                createEditableTerminalLine(`${config.currentPath}>`);
            } else {
                terminalLine.removeEventListener('keydown', terminalLineKeydownHandler);

                setSetting("showSpinner", false)
                setSetting("currentSpinner", previousSpinner)

                if(e.shiftKey == false){

                    let dataLength = 0;
    
                    dataToWrite.forEach(line => {
                        dataLength += line.length;
                    });
                    
                    setSetting("showSpinner", true)
                    setTimeout(function(){

                        setSetting("showSpinner", false)
                        if(messageValidationRegex.test(dataToWrite.join(""))){
                            const match = dataToWrite.join("").match(messageValidationRegex);
                            const recipient = match[1].trim().replaceAll(" ", "-");
                            const subject = match[2].trim().replaceAll(" ", "-");

                            const nameParts = currentFile.getName().split("-");

                            const timestamp = nameParts[nameParts.length - 1]; 

                            currentFile.rename(`${recipient}-${subject}-${timestamp}`);
                        }

                        try {
                            currentFile.write(dataToWrite);
                        } catch (error) {
                            createTerminalLine(`T_file_does_not_exist`, config.errorText);
                        }

                        createPondMenu(exitMenu);
                    }, dataLength);
                } else {
                    setSetting("showSpinner", false)
                    setSetting("currentSpinner", previousSpinner)
                    createPondMenu(exitMenu);
                }
            }
        }
    };

    terminalLine.addEventListener('keydown', terminalLineKeydownHandler);

    lineContainer.appendChild(terminalPath);
    lineContainer.appendChild(terminalLine);
    
    let lines = document.querySelectorAll(`[data-program='lilypad-pond-session-${config.programSession}']`);

    if(lines.length == 0) terminal.appendChild(lineContainer);
    else terminal.insertBefore(lineContainer, document.activeElement.parentElement.nextSibling);

    terminal.scrollTop = terminal.scrollHeight;
    terminalLine.focus();
    updateLinePrefixes();
}

function setTrustedPrograms(){
    setInterval(() => {
        config.trustedPrograms = FroggyFileSystem.getFile("Config:/trusted_programs").getData();
    }, 100);
}

setUserConfigFromFile()
sendCommand('[[BULLFROG]]autoloadstate', [], false);
document.title = `froggyOS v. ${config.version}`;
updateProgramList();
updateDateTime();
changeColorPalette(config.colorPalette);
createColorTestBar();
setTrustedPrograms();
sendCommand('[[BULLFROG]]validatelanguage', [], false);

let configInterval = setInterval(() => {
    setUserConfigFromFile()
    updateProgramList()

    let badConfig = false;
    let badKey = '';
    for (let key of user_config_keys) {
        if(getSetting(key) == undefined){
            badConfig = true;
            badKey = key;
            break;
        }
    }

    if(badConfig) {
        terminal.lastElementChild.lastElementChild.contentEditable = false;
        createTerminalLine(`T_missing_key_config_user {{${badKey}}}`, config.fatalErrorText);
        clearInterval(configInterval);
        clearInterval(dateTimeInterval);
        return;
    }
}, 250);

let dateTimeInterval = setInterval(() => {
    updateDateTime()
}, 100);

const onStart = () => {
    //sendCommand("pond", ["-l", "test", "test"])
    //sendCommand("st", ["test"])

}

function ready(){
    document.getElementById("blackout").remove()
    sendCommand('[[BULLFROG]]greeting', []);
    setTimeout(() => {
        onStart();
    }, 100)
}

// literally all of this is just for the animation
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

const SKIP_ANIMATION = true;

let animSkipped = false;
let innerBar = document.getElementById("inner-bar");

const devMode = false;
const pondLink = devMode ? "http://127.0.0.1:29329" : "https://roari.bpai.us/pond";

const messageValidationRegex = /^Recipient:(.+?)-----Subject:(.+?)-----Body:(.+?)$/;

function openLilypad(file, createEditableLineAfter){
    function printLn() {
        if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
    }
    if(file == undefined){
        createTerminalLine("T_file_does_not_exist", config.errorText);
        printLn();
        return;
    }
    if(file.getProperty('write') == false){
        createTerminalLine("T_no_permission_to_edit_file", config.errorText);
        printLn();
        return;
    }

    for(let i = 0; i < file.getData().length; i++){
        if(config.allowedProgramDirectories.includes(config.currentPath)){
            createLilypadLine(String(i+1).padStart(3, "0"), "code", file.getName());
        } else if (config.currentPath == "D:/Palettes") {
            createLilypadLine(String(i).padStart(2, "0"), "palette", file.getName());
        } else createLilypadLine(">", undefined, file.getName());
        let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`);
        lines[i].textContent = file.getData()[i];
        moveCaretToEnd(lines[i]);
    }

    // get the last lilypad line and highlight it
    let lines = document.querySelectorAll(`[data-program='lilypad-session-${config.programSession}']`)
    lines[lines.length - 1].classList.add("highlighted-line");
}

function openPondLilypad(file, options){
    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"));

    if(error) {
        throw new Error("Blocked attempt to open Pond from unauthorized context.");
    }

    for(let i = 0; i < file.getData().length; i++){

        createLilypadLinePondDerivative(">", file.getName(), options);

        let lines = document.querySelectorAll(`[data-program='lilypad-pond-session-${config.programSession}']`);
        lines[i].textContent = file.getData()[i];
        moveCaretToEnd(lines[i]);
    }

    // get the last lilypad line and highlight it
    let lines = document.querySelectorAll(`[data-program='lilypad-pond-session-${config.programSession}']`)
    lines[lines.length - 1].classList.add("highlighted-line");
}

if(!SKIP_ANIMATION) {
    innerBar.animate(...getTimings(0)).onfinish = () => {
        innerBar.animate(...getTimings(1)).onfinish = () => {
            innerBar.animate(...getTimings(2)).onfinish = () => {
                innerBar.animate(...getTimings(3)).onfinish = () => {
                    innerBar.animate(...getTimings(4)).onfinish = () => {
                        setTimeout(() => {
                            ready()
                        }, 100)
                    }
                }
            }
        }
    }

    document.addEventListener('keyup', function(e){
        animSkipped = true;
        ready()
    }, {once: true});

} else {
    ready();    
}