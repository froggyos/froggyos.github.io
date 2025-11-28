const screen = document.getElementById('screen');
const terminal = document.getElementById('terminal');
const bar = document.getElementById('bar');

const barText = document.getElementById('bar-text');
const spinnerText = document.getElementById('spinner-text');

// if the last character is japanese, switch the font
let isJp = (text) => /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF「」]/g.test(text);

const trustedProgramsGovernor = new Governor('trusted-programs', 100, () => {
    let file = FroggyFileSystem.getFile("Config:/trusted_programs");
    if(file == undefined){
        terminal.innerHTML = "";
        createTerminalLine(`T_trusted_programs_file_missing`, config.fatalErrorText);
        trustedProgramsGovernor.addTrouble("tpfm"); // trusted programs file missing
        return;
    }
    config.trustedPrograms = file.getData();
});

function horizontal(char = "-"){
    let line = char.repeat(maxCharsPerLine());
    return line;
}

function maxCharsPerLine(){
    return Math.floor(document.querySelector(':root').style.getPropertyValue('--terminal-width').replace("px","") / 8) - 2;
}

const configGovernor = new Governor("config", 250, () => {
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

        configGovernor.addTrouble(`buc/mk-${badKey}`); // bad user config missing key
        dateTimeGovernor.addTrouble(`buc/mk-${badKey}`); // bad user config missing key
        return;
    }
});

const dateTimeGovernor = new Governor("date-time", 100, () => {
    updateDateTime()
});

document.body.onclick = function() {
    try {
        terminal.lastChild.lastChild.focus();
    } catch (err) { };
}

function spacer(text="\u00A0") {
    createTerminalLine(text, "", {translate: false});
}

document.body.onkeyup = function(event) {
    if(event.key == "Enter" && event.shiftKey == true && config.currentProgram == "cli") {
        event.preventDefault();
        createEditableTerminalLine(`${config.currentPath}>`);
    }
}

function setSetting(setting, value) {
    set_fSDS("Config:", "user", setting, value);
}

function getSetting(setting) {
    let fsds = parse_fSDS(FroggyFileSystem.getFile("Config:/user").getData());
    return fsds[setting]?.value;
}

function addToCommandHistory(string){
    if(config.commandHistory[config.commandHistory.length - 1] != string) config.commandHistory = [string].concat(config.commandHistory);
}

function setUserConfigFromFile(){
    const file = FroggyFileSystem.getFile("Config:/user");
    if(file == undefined) {
        configGovernor.addTrouble("buc/gone");
        dateTimeGovernor.addTrouble("buc/gone");
        terminal.lastChild.lastChild.contentEditable = false;
        createTerminalLine("T_user_config_does_not_exist", config.fatalErrorText);
        return;
    }
    let fsds = parse_fSDS(file.getData());
    if(fsds.error) {
        configGovernor.addTrouble("buc/fe"); // bad user config fsds error
        terminal.innerHTML = "";
        createTerminalLine("T_error_reading_config_file", config.fatalErrorText);
        return;
    }
    
    config.version = getSetting("version");
    config.colorPalette = getSetting("colorPalette");
    config.showSpinner = getSetting("showSpinner");
    config.currentSpinner = getSetting("currentSpinner");
    config.defaultSpinner = getSetting("defaultSpinner");
    config.timeFormat = getSetting("timeFormat")?.slice(0, maxCharsPerLine());
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

    file.write(newData, path);
}

/**
 * 
 * @param {Array} lines - array of lines from a file to parse as fSDS
 * @returns {Object} parsed fSDS object
 */
function parse_fSDS(lines){
    if(lines == undefined) return undefined;
    let output = {};

    let error = '';

    let dataError = 0;

    for(let i = 0; i < lines.length; i++){
        let line = lines[i].trim();
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
    
                for(let j = i + 1; j < lines.length; j++){
                    let arrayLine = lines[j].trim();
                    if(arrayLine.includes(`KEY ${endingKey} TYPE Array END`)){
                        arrayMatchEnd = arrayLine.match(/^KEY (.+?) TYPE Array END$/);
                        break;
                    }
                }

                if(lines.length != 0 && (arrayMatchEnd == null)){
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

                let searchStart = lines.indexOf(arrayMatchStart[0]) + 1;
                let searchEnd = lines.indexOf(arrayMatchEnd[0]);

                for(let j = searchStart; j < searchEnd; j++){
                    let arrayDataLine = lines[j].trim();
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

const languageCache = {
    ldm: null,
    lang: {
        current: null,
        map: null
    },
};

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

    if(config.language != languageCache.lang.current){
        languageCache.lang.current = config.language;

        const file = FroggyFileSystem.getFile(`D:/lang_data/${config.language}`);

        if(file != undefined){
            languageCache.lang.map = FroggyFileSystem.getFile(`Config:/langs/${config.language}`).getData();
        }
    }

    let translationMap = languageCache.ldm;

    if(translationMap == null){
        return;
    }

    let languageMap = languageCache.lang.map;
    if(languageMap == null) languageMap = languageCache.ldm;
    let translatedData = translationMap.indexOf(descriptor);
    let translation = languageMap[translatedData];

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
        if(!FroggyFileSystem.fileExists(`Config:/program_data/${program}`)){
            let newFile = new FroggyFile(program, undefined, undefined, "Config:/program_data");
            FroggyFileSystem.addFileToDirectory("Config:/program_data", newFile);
        }
    }
}

/**
 * Formats a duration (in milliseconds) into a human-readable string.
 * Supports "!" escaping to output literal characters.
 *
 * Supported tokens:
 *   d   - total days (unpadded)
 *   dd  - total days (2-digit padded)
 *   h   - total hours
 *   hh  - total hours (2-digit padded)
 *   m   - minutes (mod 60)
 *   mm  - minutes (2-digit padded)
 *   s   - seconds (mod 60)
 *   ss  - seconds (2-digit padded)
 *   ms  - milliseconds (3-digit padded)
 *
 * Escape rules:
 *   !x  → literal x
 *   !!  → literal !
 *
 * @param {string} text
 * @param {number} durationMs
 * @returns {string}
 */
function formatDuration(text, durationMs) {
    // break down duration
    const ms = durationMs % 1000;
    const totalSeconds = Math.floor(durationMs / 1000);

    const s = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);

    const m = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);

    const d = Math.floor(totalHours / 24);

    const map = {
        "dd": String(d).padStart(2, "0"),
        "d": d,

        "hh": String(totalHours).padStart(2, "0"),
        "h": totalHours,

        "mm": String(m).padStart(2, "0"),
        "m": m,

        "ss": String(s).padStart(2, "0"),
        "s": s,

        "ms": String(ms).padStart(3, "0")
    };

    // REGEX RULE:
    // - optional leading "!" to mark escape
    // - then one of our tokens
    // - use capturing groups to decide behavior
    return text.replace(/(!)?(dd|hh|mm|ss|ms|d|h|m|s)/g, (match, escape, token) => {
        if (escape) {
            // escaped → output literal token
            return token;
        }
        // normal token → replace
        return map[token];
    });
}

/**
 * @param {String} text - the time format string
 * @param {Number} timestamp - optional timestamp to use instead of current time
 * @returns 
 */
function timestamp(text, timestamp){
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

    function getISOOffset(date = new Date()) {
        const offset = date.getTimezoneOffset(); // minutes * behind UTC *
        const sign = offset > 0 ? "-" : "+";     // positive = behind UTC so use "-"
        const abs = Math.abs(offset);
        const hours = String(Math.floor(abs / 60)).padStart(2, "0");
        const mins  = String(abs % 60).padStart(2, "0");
        return `${sign}${hours}:${mins}`;
    }

    const isoOffset = getISOOffset(now);

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
        { char: 'Z', value: isoOffset },
    ];

    let replacementMap = Object.fromEntries(replacements.map(({ char, value }) => [char, value]));

    let dateString = text.replace(/(?<!!)([a-zA-Z]+)/g, (match) => {
        return replacementMap[match] ?? match
    });

    dateString = dateString.replace(/!([a-zA-Z])/g, (_, p1) => {
        return p1;
    });

    return dateString;
}

function limit(string, maxLength) {
    return string.slice(0, maxLength);
}

function updateDateTime() {
    if(!config.updateStatBar) return;

    let dateString = timestamp(config.timeFormat);

    barText.textContent = dateString;
    if(config.showSpinner == true) {
        if(!FroggyFileSystem.fileExists(`D:/Spinners/${config.currentSpinner}`)) {
            terminal.lastChild.lastChild.contentEditable = false;
            createTerminalLine(`T_spinner_not_found {{${config.currentSpinner}}}`, config.fatalErrorText);
            dateTimeGovernor.addTrouble("snf");
            return;
        }
        let spinnerFrames = FroggyFileSystem.getFile(`D:/Spinners/${config.currentSpinner}`).getData();
        spinnerText.textContent = limit(spinnerFrames[config.spinnerIndex % spinnerFrames.length], 1);
        config.spinnerIndex++;
    } else {
        spinnerText.textContent = "";
    }

    if(isJp(barText.textContent)) {
        let text = limit(barText.textContent, maxCharsPerLine());
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
    const file = FroggyFileSystem.getFile(`D:/Palettes/${name}`)?.getData();

    setSetting("colorPalette", name);

    if(file == undefined) {
        const availablePalette = FroggyFileSystem.getFirstFileInDirectory("D:/Palettes");

        if(availablePalette) {
            const paletteName = availablePalette.getName();
            setSetting("colorPalette", paletteName);
            createTerminalLine(`T_palette_not_found {{${name}}} {{${paletteName}}}`, config.alertText);            
            setTimeout(() => {
                changeColorPalette(paletteName);
            }, 300);
            return;
        } else {
            createTerminalLine(`T_palette_none_found`, config.fatalErrorText);
            integrityGovernor.addTrouble("npf");
            return;
        }
    }

    const root = document.querySelector(':root');
    root.style = "";
    for(let i = 0; i < file.length; i++){
        if(i < 16){
            const color = `c${i.toString().padStart(2, '0')}`;
            const hex = `#${file[i]}`;

            root.style.setProperty(`--${color}`, hex);
        } else {
            let variable = file[i].split(" ")[0];
            let color = file[i].split(" ")[1];

            root.style.setProperty(`--${variable}`, `var(--c${color})`);
        }
    }

    createColorTestBar();
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

    if(colorPalettes[config.colorPalette] == undefined) return;

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
            terminalLine.textContent = `Descriptor Missing! -> ${text.replace(/{{.*?}}/g, "{{}}")}`;
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

/**
 * 
 * @param {String} command 
 * @param {String[]} args 
 * @param {Boolean} createEditableLineAfter 
 * @returns 
 */
async function sendCommand(command, args = [], createEditableLineAfter = true){
    if(createEditableLineAfter == undefined) createEditableLineAfter = true;
    command = command.trim();
    args = args.filter(arg => arg.trim() != "");
    let directory;
    let file;

    let hadError = false;

    function printLn() {
        if(createEditableLineAfter) createEditableTerminalLine(`${config.currentPath}>`);
    }

    const requireGovernor = (governor) => {
        if(governor.troubled()) {
            createTerminalLine(`T_cannot_execute_command {{${command}}} {{${governor.name}}}`, config.errorText);
            hadError = true;
            printLn();
            return false;
        }
        return true;
    }

    // guard
    // if(!requireGovernor(integrityGovernor)) return;

    switch(command){
        case "":
            createTerminalLine("T_froggy_doesnt_like", "");
            printLn();
        break;

        // commands =========================================================================================================================================================
        // change language
        case "lang":
        case "changelanguage": {
            if(!requireGovernor(integrityGovernor)) return;
            if(!requireGovernor(configGovernor)) return;
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


            languageCache.lang.map = FroggyFileSystem.getFile(`Config:/langs/${code}`).getData();
            
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
            if(!requireGovernor(configGovernor)) return;
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
            setTerminalSize();
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
            if(!requireGovernor(integrityGovernor)) return;
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

            let cloned = new FroggyFile(`clone_of_`+fileToClone.getName(), fileToClone.getProperties(), fileToClone.getData(), config.currentPath);

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
            if(!requireGovernor(integrityGovernor)) return;
            if(args.length == 0){
                createTerminalLine("T_provide_file_name", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            let file = FroggyFileSystem.getFile(`${config.currentPath}/${args[0]}`);

            if(file == undefined){
                createTerminalLine("T_file_does_not_exist", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            FroggyFileSystem.deleteFile(`${config.currentPath}/${file.getName()}`);

            createTerminalLine("T_file_deleted", ">")
            printLn();
        } break;

        case "cdir":
        case "croakdir": {
            if(!requireGovernor(integrityGovernor)) return;
            if(args.length == 0){
                createTerminalLine("T_provide_directory_name", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            let directory = FroggyFileSystem.getDirectory(`${args[0]}`);

            if(directory == undefined){
                createTerminalLine(`T_directory_does_not_exist {{${args[0]}}}`, config.errorText);
                hadError = true;
                printLn();
                break;
            }

            FroggyFileSystem.deleteDirectory(`${args[0]}`);

            if (config.currentPath.startsWith(args[0])) {

                // If the deleted directory *was* Config:
                if (args[0] === config.currentPath) {
                    config.currentPath = "invalid directory";
                } else {
                    // Fallback to Config: if it exists
                    if (FroggyFileSystem.directoryExists("Config:")) {
                        config.currentPath = "Config:";
                    } else {
                        createTerminalLine("No config drive. Entering recovery mode...", config.fatalErrorText, {translate: false});
                        setTimeout(() => {
                            enterRecoveryMode();
                        }, 5000);
                        return;
                    }
                }
            }

            createTerminalLine("T_directory_deleted", ">")
            printLn();
        } break;
        
        case "xf":
        case "exportfile": {
            if(!requireGovernor(integrityGovernor)) return;
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
            if(!requireGovernor(dateTimeGovernor)) return;
            if(!requireGovernor(configGovernor)) return;
            if(args.length == 0){
                createTerminalLine("T_provide_time_format", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            let text = args.join(" ");
            if(timestamp(text).length > maxCharsPerLine()){
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
            if(!requireGovernor(integrityGovernor)) return;
            if(args.length == 0){
                createTerminalLine("T_provide_file_name", config.errorText);
                hadError = true;
                printLn();
                break;
            }
            if(FroggyFileSystem.getDirectory(`${config.currentPath}`) == undefined){
                createTerminalLine(`T_directory_does_not_exist {{${config.currentPath}}}`, config.errorText);
                hadError = true;
                printLn();
                break;
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

        case "hello": {
            createTerminalLine("T_hello_froggy", ">");
            printLn();
        } break;

        case "?":
        case "help": {
            if(!requireGovernor(integrityGovernor)) return;
            createTerminalLine("T_basic_commands_intro", "");
            const filter = args[0] ?? null;

            const descriptors = languageCache.ldm.filter(line => line.startsWith("T_basic_commands_"));

            descriptors.shift()

            if(filter == null){
                descriptors.forEach(descriptor => {
                    createTerminalLine(descriptor, ">");
                })
            } else {
                const filtered = descriptors.map(x => x.replace("T_basic_commands_", "")).filter(descriptor => descriptor.toLowerCase().startsWith(filter.toLowerCase())).map(descriptor => "T_basic_commands_" + descriptor);
                
                if(filtered.length > 0){
                    filtered.forEach(descriptor => {
                        createTerminalLine(descriptor, ">");
                    })
                } else {
                    createTerminalLine(`T_no_commands_with_filter {{${filter}}}`, config.errorText);
                }

            }
            printLn();
        } break;


        // move directories
        case "h":
        case "hop": {
            if(!requireGovernor(integrityGovernor)) return;
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
                createTerminalLine(`T_directory_does_not_exist {{${directory}}}`, config.errorText);
                hadError = true;
                printLn();
                break;
            }

            sendCommand("[[BULLFROG]]changepath", [directory], createEditableLineAfter);
        } break;

        // list files
        case "ls":
        case "list":
            if(!requireGovernor(integrityGovernor)) return;
            if(!requireGovernor(configGovernor)) return;
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
            if(!requireGovernor(integrityGovernor)) return;
            if(!requireGovernor(configGovernor)) return;
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
            let foundDiagnostics = localStorage.getItem(`froggyOS-state-${config.version}-diagnostics`);

            if(foundConfig == null || foundFs == null || foundDiagnostics == null){
                createTerminalLine("T_no_state_found", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            for(let key in JSON.parse(foundConfig)){
                config[key] = JSON.parse(foundConfig)[key];
            }

            FroggyFileSystem.loadFromString(foundFs);

            diagnostics = JSON.parse(foundDiagnostics);

            changeColorPalette(config.colorPalette);

            createTerminalLine("T_state_loaded", ">")
            printLn();
        break;

        case "/":
        case "macro": {
            if(!requireGovernor(integrityGovernor)) return;
            if(args.length == 0){
                createTerminalLine("T_provide_macro_name", config.errorText);
                createTerminalLine(`T_available_macros`, "");
                let macros = FroggyFileSystem.getDirectory("D:/Macros")
                if(macros == undefined){
                    createTerminalLine("T_no_macros_found", config.errorText);
                } else {
                    let macroList = macros.filter(macro => macro.getProperty('transparent') == false);
                    let macroAliases = macros.filter(macro => macro.getProperty('transparent') == false).map(macro => macro.getData()[0].startsWith("!") ? macro.getData()[0].slice(1) : "no alias");
                    createTerminalLine(macroList.map((macro, i) => `${macro.getName()} (${macroAliases[i]})`).join("\n"), ">", {translate: false});
                    hadError = true;
                    printLn();
                    break;
                }
            }

            let macroFile = FroggyFileSystem.getFile(`D:/Macros/${args[0]}`)

            FroggyFileSystem.getDirectory("D:/Macros").forEach(macro => {
                if(macro.getData()[0].startsWith("!") && macro.getData()[0].slice(1).trim() == args[0]){
                    macroFile = macro;
                }
            });
            
            if(macroFile == undefined){
                createTerminalLine("T_macro_does_not_exist", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            let macroData = macroFile.getData();
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
            if(!requireGovernor(integrityGovernor)) return;
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

            const file = FroggyFileSystem.getFile(`${config.currentPath}/${args[0]}`);

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
            if(file.getProperty('read') == false){
                createTerminalLine("T_no_permission_to_read_file", config.errorText);
                printLn();
                return;
            }

            openLilypad(file.getName(), file.getData(), createEditableLineAfter);
        } break;

        // edit file properties
        case "mp":
        case "metaprop":
            if(!requireGovernor(integrityGovernor)) return;
            file = FroggyFileSystem.getFile(`${config.currentPath}/${args[0]}`);

            let property = args[1];
            let value = args[2];
            if(file == undefined){
                createTerminalLine("T_file_does_not_exist", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            let propertyTypes = Object.keys(file.getProperties());

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

            if(file.getProperties().write == false){
                createTerminalLine("T_no_permission_to_edit_file", config.errorText);
                hadError = true;
                printLn();
                break;
            }

            file.getProperties()[property] = value == "1" ? true : false;
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
            if(!requireGovernor(configGovernor)) return;
            if(!requireGovernor(dateTimeGovernor)) return;
            if(!requireGovernor(integrityGovernor)) return;
            if(!requireGovernor(diagnosticsGovernor)) return;
            if(!requireGovernor(trustedProgramsGovernor)) return;
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
                                [localize(`T_pond_banned_on {{${timestamp(config.timeFormat, data.bannedOn)}}}`)]: "text",
                                [localize(`T_pond_banned_until {{${data.bannedUntil == -1 ? localize("T_pond_ban_permanent") : timestamp(config.timeFormat, data.bannedUntil)}}}`)]: "text",
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
                                [`${localize("T_pond_user_warned")}<br>${horizontal("-")}<br>`]: "text",
                            };

                            data.warns.forEach((warn) => {
                                let warnText = '';
                                warnText += localize(`T_pond_warned_by {{${warn.warnedBy}}}`) + '<br>';
                                warnText += localize(`T_pond_warned_at {{${timestamp(config.timeFormat, warn.timestamp)}}}`) + '<br>';
                                warnText += localize(`T_pond_warn_reason {{${warn.reason}}}`) + '<br>';
                                warnText += `Warning ID: ${warn.id}` + `<br>${horizontal("-")}<br>`;
                                warningDisplay[warnText] = "text";
                            });
                            
                            warningDisplay[localize("T_pond_warn_info_text") + "<br>" + horizontal("-")] = "text";

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
                spacer("~~~")
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
                sendCommand("st", ["terminal_confirm", localize("T_pond_registration_question"), localize("T_intj_yes"), localize("T_intj_no"), localize("T_pond_registration_cancelled")], false);

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

                FroggyFileSystem.getFile("Config:/program_data/terminal_confirm").write([], "Config:/program_data");

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

        case "pulse": {
            let displayStacks = false;

            if(args[0] == "-s") displayStacks = true;

            createTerminalLine("T_pulse_info_intro", "");
            spacer("~~~");
            createTerminalLine("T_pulse_system_info", pad(1));
            createTerminalLine(`T_pulse_system_uptime {{${formatDuration("ss.ms!s mm!m hh!h dd!d", diagnostics.runtime)}}}`, pad(2));
            createTerminalLine(`T_pulse_version {{${config.version}}}`, pad(2));
            createTerminalLine(`T_pulse_fs_size {{${FroggyFileSystem.size()}}}`, pad(2));
            createTerminalLine(`T_pulse_program_session {{${config.programSession}}}`, pad(2));
            createTerminalLine(`T_pulse_language {{${config.language}}}`, pad(2));
            createTerminalLine(`T_pulse_palette {{${config.colorPalette}}}`, pad(2));

            let maxLength = 0;
            for(let governorName in TroubleManager.governors){
                const governor = TroubleManager.governors[governorName];
                if(governor.name.length > maxLength) maxLength = governor.name.length;
            }

            // Now loop through intervals
            spacer("~~~");
            createTerminalLine("T_pulse_governors", pad(1));
            for(let governorName in TroubleManager.governors){
                const governor = TroubleManager.governors[governorName];
                const name = governor.name;
                const padding = pad(maxLength - name.length);
                
                if(governor.ok){
                    createTerminalLine(`${name}${padding} : ${localize("T_intj_ok")}`, pad(2), { translate: false });
                } else {
                    let troubles = governor.troubles;

                    let line = `${name}${padding} : ${localize("T_intj_error")}`;

                    let lineLength = structuredClone(line.length);

                    let troubleIterator = 0;
                    troubles.forEach((trouble, i) => {
                        if(troubleIterator == 0) line += ` ${trouble}`;
                        else {
                            line += `\n${pad(lineLength+1)}${trouble}`;
                        }

                        troubleIterator++;
                    });

                    createTerminalLine(line, pad(2), { translate: false, formatting: [
                        {
                            type: "range",
                            b: "c12",
                            br_start: (name.length + padding.length) + 3,
                            br_end: (name.length + padding.length) + localize("T_intj_error").length + 2,
                        }, {
                            type: "range",
                            t: "c15",
                            tr_start: (name.length + padding.length) + 3,
                            tr_end: (name.length + padding.length) + localize("T_intj_error").length + 2,
                        }
                    ]
                    });
                }
            }
            // --- Diagnostics output ---
            spacer("~~~");
            createTerminalLine("T_pulse_config", pad(1));
            const configMetrics = ['configRead', 'configWrite'].map(key => ({
                Metric: key,
                Last: diagnostics.lastSecond[key],
                Avg: diagnostics.average[key],
                Total: diagnostics.total[key]
            }));

            // Print config nicely
            configMetrics.forEach(item => {
                createTerminalLine(`${item.Metric}\n${pad(3)}${localize("T_pulse_abbr_last_second")}: ${item.Last} | ${localize("T_pulse_abbr_average")}: ${item.Avg} | ${localize("T_pulse_abbr_total")}: ${item.Total}`,pad(2), {translate: false})
            });

            spacer("~~~");

            // Reads/Writes Table
            ['reads', 'writes'].forEach(type => {
                const obj = {
                    "reads": "T_pulse_reads",
                    "writes": "T_pulse_writes"
                }
                createTerminalLine(obj[type], pad(1));

                const dirs = Object.keys(diagnostics.lastSecond[type])
                    .sort((a, b) => (SwagSystem.diagnostics[type][b]?.total || 0) - (SwagSystem.diagnostics[type][a]?.total || 0));

                dirs.forEach(dir => {
                    const last = diagnostics.lastSecond[type][dir];
                    const avg = diagnostics.average[type][dir];
                    const total = SwagSystem.diagnostics[type][dir].total;

                    const exists = FroggyFileSystem.fileExists(dir);

                    const formatting = [];

                    if(!exists){
                        formatting.push({
                            type: "blanket",
                            b: "c12",
                            br_start: 0,
                            br_end: dir.length,
                        }, {
                            type: "blanket",
                            t: "c15",
                            tr_start: 0,
                            tr_end: dir.length,
                        });
                    }

                    let line = `${dir}\n${pad(2)}${localize("T_pulse_abbr_last_second")}: ${String(last)} | ${localize("T_pulse_abbr_average")}: ${String(avg)} | ${localize("T_pulse_abbr_total")}: ${String(total)}`;

                    // console.log(type, SwagSystem.diagnostics[type][dir].stacks);
                    if(displayStacks){
                        for(let stack in SwagSystem.diagnostics[type][dir].stacks){
                            const metrics = SwagSystem.diagnostics[type][dir].stacks[stack];
                            line += `\n${pad(4)}${stack}\n${pad(6)}${localize("T_pulse_abbr_last_second")}: ${metrics.last} | ${localize("T_pulse_abbr_average")}: ${metrics.avg} | ${localize("T_pulse_abbr_total")}: ${metrics.total}`;
                        }
                        // SwagSystem.diagnostics[type][dir].stacks.forEach(stack => {
                        //     if(stackIterator == 0){
                        //         line += `\n${pad(4)}${localize("T_pulse_stack_trace")}: ${stack}`;
                        //     } else {
                        //         line += `\n${pad(18)}${stack}`;
                        //     }
                        //     stackIterator++;
                        // });
                    }

                    createTerminalLine(line, pad(2), {translate: false, formatting});
                    spacer();
                });
                spacer("~~~")
            });
            printLn();
        } break;

        case "rename": {
            if(!requireGovernor(integrityGovernor)) return;
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
            localStorage.setItem(`froggyOS-state-${config.version}-diagnostics`, JSON.stringify(diagnostics));

            createTerminalLine("T_state_saved", ">")
            printLn();
        break;

        // make directories
        case "s":
        case "spawn":
            if(!requireGovernor(integrityGovernor)) return;
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
            if(!requireGovernor(integrityGovernor)) return;
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
            createTerminalLine(`T_file_info_size {{${formatBytes(file.getSize())}}}`, "");
            createTerminalLine(horizontal("~"), "~", {translate: false});
            file.getData().forEach(line => {
                createTerminalLine(line, ">", {translate: false})
            });
            printLn();
        break;

        case "st":
        case "swimto":
            if(!requireGovernor(integrityGovernor)) return;
            if(!requireGovernor(trustedProgramsGovernor)) return;
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
                        spacer()
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

        case "[[BULLFROG]]diagnosticstable": {
            outputDiagnosticInformation();
            printLn();
        } break;
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
                openLilypad(programFile.getName(), programFile.getData(), createEditableLineAfter);
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
            createTerminalLine("T_bullfrog_commands_diagtable", ">");
            createTerminalLine("T_bullfrog_commands_greeting", ">");
            createTerminalLine("T_bullfrog_commands_help", ">");
            createTerminalLine("T_bullfrog_commands_gotoprogramline", ">");
            createTerminalLine("T_bullfrog_commands_recoverymode", ">");
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

        case '[[BULLFROG]]recoverymode':
            enterRecoveryMode();
        break;

        case '[[BULLFROG]]setstatbar':
            let text = args.join(" ");
            if(text > maxCharsPerLine()){
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

            const file = FroggyFileSystem.getFile("Config:/user");

            if(file == undefined) {
                configGovernor.addTrouble("buc/gone");
                dateTimeGovernor.addTrouble("buc/gone");
                terminal.lastChild.lastChild.contentEditable = false;
                createTerminalLine("T_user_config_does_not_exist", config.fatalErrorText);
            }

            if(state != null && fsState != null){
                for(let key in JSON.parse(state)){
                    config[key] = JSON.parse(state)[key];
                }
                FroggyFileSystem.loadFromString(fsState);
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
                    spacer()
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

                    if(currentFile.getProperty('write') == false){
                        createTerminalLine(`T_no_permission_to_edit_file`, config.errorText);
                        createEditableTerminalLine(`${config.currentPath}>`);
                        return;
                    }
                    
                    setSetting("showSpinner", true)
                    setTimeout(function(){
                        setSetting("showSpinner", false)

                        try {
                            currentFile.write(dataToWrite, config.currentPath);
                        } catch (error) {
                            console.log(error)
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

            file.write(dataToWrite, "D:/Pond/drafts");
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
                        newFile.dirname = "D:/Pond/sent";

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
                            currentFile.write(dataToWrite, "D:/Pond/drafts");
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
    terminalLine.addEventListener('wheel', () => terminal.focus());

    lineContainer.appendChild(terminalPath);
    lineContainer.appendChild(terminalLine);
    
    let lines = document.querySelectorAll(`[data-program='lilypad-pond-session-${config.programSession}']`);

    if(lines.length == 0) terminal.appendChild(lineContainer);
    else terminal.insertBefore(lineContainer, document.activeElement.parentElement.nextSibling);

    terminal.scrollTop = terminal.scrollHeight;
    terminalLine.focus();
    updateLinePrefixes();
}

terminal.addEventListener('wheel', (event) => {
    event.preventDefault();
    const direction = Math.sign(event.deltaY);
    if(event.shiftKey) terminal.scrollTop += 32 * direction;
    else terminal.scrollTop += 8 * direction;
});

function enterRecoveryMode(){
    config.currentProgram = "recovery-mode";
    let oldSendCommand = sendCommand;

    onStart = function(){};

    terminal.innerHTML = "";
    const out = (v, prefix=">") => {
        createTerminalLine(v, prefix, {translate: false})
    }
    
    const printLn = (v = ">") => {
        createEditableTerminalLine(v);
    }

    let recommendedActions = []

    out("Welcome to froggyOS recovery mode! If you're here, you probably messed something up BIG TIME and are trying to fix your mistakes. Type \"help\" for a list of commands.");

    function getAndOutputRecommendedActions(){
        Object.values(TroubleManager.governors).forEach(gov => {
            let actions = gov.getRecommendedActions();
            if(actions.length > 0){
                actions = actions.map(action => {
                    action.govName = gov.name;
                    return action;
                })
                recommendedActions.push(...actions);
            }
        })
        if(recommendedActions.length > 0) {
            out("Recommended actions:")
            for(const gov in TroubleManager.getAllRecommendedActions()){
                const actions = TroubleManager.getAllRecommendedActions()[gov];
                out(`${pad(1)}${gov}:`)
                actions.forEach(action => {
                    out(`${pad(2)}- ${action.action}: ${action.description}`)
                })
            }
        }
    }

    getAndOutputRecommendedActions()
    printLn()

    function exitRecoveryMode(fromExitCommand = false){
        if(TroubleManager.hasTrouble()){
            out("Some governors are still troubled. Staying in recovery mode.");
            getAndOutputRecommendedActions();
            printLn();
            return;
        }
        if(!fromExitCommand) out("All troubles resolved. Exiting recovery mode.");
        sendCommand = oldSendCommand;
        if(config.currentPath == "invalid directory") config.currentPath = "Config:"
        printLn(config.currentPath + ">");
        config.currentProgram = "cli";
    }

    function clearActions(actionName){
        recommendedActions.forEach(action => {
            if(action.action.startsWith(actionName)) TroubleManager.getGovernor(action.govName).removeTrouble(action.trouble);
        })
    }

    sendCommand = function(command, args){
        if(command == "[[BULLFROG]]greeting") return;
        switch(command){
            case "regenspinners": {
                if(!FroggyFileSystem.directoryExists("D:")){
                    out("Unable to regenerate spinners: D: drive missing.", config.errorText);
                    printLn()
                    return;
                }
                if(!FroggyFileSystem.directoryExists("D:/Spinners")){
                    FroggyFileSystem.createDirectory("D:/Spinners");
                }
                out("Regenerating spinners...");
                FileCopies.spinners().forEach(file => {
                    FroggyFileSystem.addFileToDirectory("D:/Spinners", file);
                });
                out(`- added all default spinners`);
                clearActions("regenspinners");
                setTerminalSize();
                out("Spinners regenerated successfully.");
                exitRecoveryMode();
            } break;
            case "regenpalettes": {
                if(!FroggyFileSystem.directoryExists("D:")){
                    out("Unable to regenerate palettes: D: drive missing.", config.errorText);
                    printLn()
                    return;
                }
                if(!FroggyFileSystem.directoryExists("D:/Palettes")){
                    FroggyFileSystem.createDirectory("D:/Palettes");
                }
                out("Regenerating palettes...");

                FileCopies.palettes().forEach(file => {
                    FroggyFileSystem.addFileToDirectory("D:/Palettes", file);
                });

                out(`- added all default palettes`);

                clearActions("regenpalettes");
                changeColorPalette("standard");
                setTerminalSize();
                out("Palettes regenerated successfully.");
                exitRecoveryMode();
            } break;
            case "purgefd": {
                if(FroggyFileSystem.directoryExists("Config:") == false){
                    out("Unable to purge floating directories: Config directory missing.", config.errorText);
                    printLn()
                    return;
                }
                out("Purging floating directories...");
                let floatingDirs = FroggyFileSystem.getFloatingDirectories();
                if(floatingDirs.length == 0){
                    out("No floating directories found.");
                    printLn()
                    return;
                }
                floatingDirs.forEach(dir => {
                    FroggyFileSystem.deleteDirectory(dir);
                    out(`- ${dir}`);
                });
                config.currentPath = "Config:";
                clearActions("purgefd");
                out("Floating directories purged successfully.");
                exitRecoveryMode();
            } break;
            case "forceexit": {
                sendCommand = oldSendCommand;
                printLn(config.currentPath + ">");
            } break;
            case "regenconfigdir": {
                out("Regenerating Config directory...");
                if(FroggyFileSystem.directoryExists("Config:")){
                    out("Config directory already exists.", config.errorText);
                    printLn()
                    return;
                }
                FroggyFileSystem.createDirectory("Config:");
                out("Config directory regenerated successfully.");
                clearActions("regenconfigdir");
                exitRecoveryMode();
            } break;
            case "regenkey": {
                let key = args[0];
                if(key == undefined){
                    out("Please specify a key to regenerate.");
                    printLn()
                    return;
                }

                const keysfSDS = parse_fSDS(FileCopies.user().getData());
                
                if(keysfSDS[key] == undefined){
                    out(`Unknown key: ${key}`);
                    printLn()
                    return;
                }

                if(!FroggyFileSystem.directoryExists("Config:")){
                    out("Unable to regenerate key: Config directory missing.", config.errorText);
                    printLn()
                    return;
                }

                if(!FroggyFileSystem.fileExists("Config:/user")){
                    out("Unable to regenerate key: User file missing.", config.errorText);
                    printLn()
                    return;
                }
                const valueToWrite = keysfSDS[key];

                set_fSDS("Config:", "user", key, valueToWrite.value);
                out(`Key ${key} regenerated successfully.`);
                clearActions("regenkey");
                exitRecoveryMode();

            } break;
            case "unhalt": {
                if(args[0] == undefined){
                    out("Please specify a governor to unhalt.");
                    printLn()
                    return;
                }
                if(!TroubleManager.getGovernor(args[0])){
                    out(`Unknown governor: ${args[0]}`);
                    printLn()
                    return;
                }
                const gov = TroubleManager.getGovernor(args[0]);
                if(!gov.hasTrouble("halt")){
                    out(`Governor ${args[0]} is not halted.`);
                    printLn()
                    return;
                }
                gov.removeTrouble("halt");
                out(`Governor ${args[0]} unhalted.`);
                exitRecoveryMode();
            } break;
            case "regenuserfile": {
                out("Regenerating user file...");
                if(!FroggyFileSystem.directoryExists("Config:")){
                    out("Unable to regenerate user file: Config directory missing.", config.errorText);
                    printLn()
                    return;
                }
                FroggyFileSystem.addFileToDirectory("Config:", FileCopies.user());
                out("User file regenerated successfully.");
                clearActions("regenuserfile");  
                exitRecoveryMode();
            } break;
            case 'regenlangfiles': {
                out("Regenerating language files...");
                if(!FroggyFileSystem.directoryExists("Config:")){
                    out("Unable to regenerate language files: Config directory missing.", config.errorText);
                    printLn()
                    return;
                }

                if(!FroggyFileSystem.directoryExists("Config:/langs")){
                    FroggyFileSystem.createDirectory("Config:/langs");
                }

                FroggyFileSystem.addFileToDirectory("Config:/langs", FroggyFile.from({name: "ldm", properties: undefined, data: Object.keys(presetLanguagesMap)}));

                const ldmFileData = FroggyFileSystem.getFile("Config:/langs/ldm").getData();

                const langCodes = Object.keys(presetLanguagesMap[ldmFileData[0]])

                const languageData = {};

                ldmFileData.forEach(descriptor => {
                    langCodes.forEach(code => {
                        if(languageData[code] == undefined){
                            languageData[code] = [];
                        }

                        languageData[code].push(presetLanguagesMap[descriptor][code]);
                    })
                })

                langCodes.forEach(code => {
                    FroggyFileSystem.addFileToDirectory("Config:/langs", FroggyFile.from({name: code, properties: undefined, data: languageData[code]}));
                });

                languageCache.ldm = FroggyFileSystem.getFile("Config:/langs/ldm").getData();
                languageCache.lang.current = config.language;
                languageCache.lang.map = FroggyFileSystem.getFile(`Config:/langs/${config.language}`).getData();

                clearActions("regenlangfiles");
                out("Language files regenerated successfully.")
                exitRecoveryMode();
            } break;
            case "regentrustedprogramfile": {
                const file = FroggyFile.from({ name: "trusted_programs", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                    "test",
                    "fs3help",
                    "confirm"
                ] })

                if(!FroggyFileSystem.directoryExists("Config:")){
                    out("Unable to regenerate trusted programs file: Config directory missing.", config.errorText);
                    printLn()
                    return;
                }

                FroggyFileSystem.addFileToDirectory("Config:", file);

                clearActions("regentrustedprogramfile");

                out("Trusted programs file regenerated successfully.");
                exitRecoveryMode();
            } break;
            case 'clearstate': {
                out("Clearing state...");
                localStorage.removeItem(`froggyOS-state-${config.version}-config`);
                localStorage.removeItem(`froggyOS-state-${config.version}-diagnostics`);
                localStorage.removeItem(`froggyOS-state-${config.version}-fs`);
                out("State cleared. Reload window to complete the process.");
            } break;
            case "help": {
                out("Available commands:");
                out(`regenlangfiles:\n${pad(2)}Regenerates language files.`);
                out(`clearstate:\n${pad(2)}Clears the autoload state.`);
                out(`regenuserfile:\n${pad(2)}Regenerates the user configuration file.`);
                out(`regentrustedprogramfile:\n${pad(2)}Regenerates the trusted programs file.`);
                out(`regenconfigdir:\n${pad(2)}Regenerates the Config directory.`);
                out(`regenkey [key]:\n${pad(2)}Regenerates a specific key in the user configuration file.`);
                out(`unhalt [governor]:\n${pad(2)}Removes the 'halt' trouble from a governor.`);
                out(`purgefd:\n${pad(2)}purges floating directories`);
                out(`regenpalettes:\n${pad(2)}Regenerates the palettes directory.`);
                out(`regenspinners:\n${pad(2)}Regenerates the spinners directory.`);
                out(`exit:\n${pad(2)}Exits recovery mode`);
                printLn()
            } break;
            case "exit": {
                exitRecoveryMode(true);
            } break;
            default: {
                out(`Unknown command: ${command}`);
                printLn()
            }
        }
    };
}

const SKIP_ANIMATION = true;
const currentAnimations = []
let animSkipped = false;
let innerBar = document.getElementById("inner-bar");

const devMode = false;
const pondLink = devMode ? "http://127.0.0.1:29329" : "https://roari.bpai.us/pond";

const messageValidationRegex = /^Recipient:(.+?)-----Subject:(.+?)-----Body:(.+?)$/;

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
        duration: Math.floor(Math.random() * 1800) + 500,
        easing: "ease-in-out",
        fill: "forwards"
    }]
}

if(SKIP_ANIMATION == false) {
    const anim0 = innerBar.animate(...getTimings(0));
    currentAnimations.push(anim0);
    anim0.onfinish = () => {
        const anim1 = innerBar.animate(...getTimings(1));
        currentAnimations.push(anim1);
        anim1.onfinish = () => {
            const anim2 = innerBar.animate(...getTimings(2));
            currentAnimations.push(anim2);
            anim2.onfinish = () => {
                const anim3 = innerBar.animate(...getTimings(3));
                currentAnimations.push(anim3);
                anim3.onfinish = () => {
                    const anim4 = innerBar.animate(...getTimings(4));
                    currentAnimations.push(anim4);
                    anim4.onfinish = () => {
                        sequence()
                    };
                };
            };
        };
    };

    document.addEventListener("keyup", () => {
        animSkipped = true;
        currentAnimations.forEach(a => a.cancel());
        setTimeout(() => {
            sequence()
        }, 500); 
    }, { once: true });

} else {
    setTimeout(() => {
        sequence()
    }, 500); 
}


ready();

function ready(){
    setUserConfigFromFile()

    languageCache.ldm = FroggyFileSystem.getFile("Config:/langs/ldm").getData();
    languageCache.lang.current = config.language;
    languageCache.lang.map = FroggyFileSystem.getFile(`Config:/langs/${config.language}`).getData();

    sendCommand('[[BULLFROG]]autoloadstate', [], false);

    changeColorPalette(config.colorPalette);

    let state = localStorage.getItem(`froggyOS-state-${config.version}-config`);
    let fsState = localStorage.getItem(`froggyOS-state-${config.version}-fs`);
    if(state && fsState){
        createTerminalLine("T_loaded_from_mem", config.alertText);
    }

    setTerminalSize();

    document.title = `froggyOS v. ${config.version}`;

    updateProgramList();

    sendCommand('[[BULLFROG]]validatelanguage', [], false);

    setTerminalSize();

    updateDateTime();
}

// literally all of this is just for the animation

function sequence(){
    setTimeout(() => {
        document.getElementById("blackout")?.remove()
        sendCommand('[[BULLFROG]]greeting', []);
        onStart();
    }, 500)

}

function onStart(){
    //sendCommand("pulse", ["-s"])
    //sendCommand("?", ["c"])
    // sendCommand("cdir", ["D:/Spinners"])
    // sendCommand("[[BULLFROG]]showspinner", ["1"])
    // sendCommand("[[BULLFROG]]recoverymode", [])
    //sendCommand("regenpalettes")
    //sendCommand("pond", ["-l", "test", "test"])
    //sendCommand("st", ["test"])
}