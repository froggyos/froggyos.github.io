const config = {
    version: "1.5",
    colorPalette: "standard",
    currentPath: 'C:/Home',
    commandHistory: [],
    commandHistoryIndex: -1,
    showLoadingSpinner: false,
    timeFormat: 'w. y/M/d h:m:s',
    updateStatBar: true,
    currentProgram: "cli", // do something with this later
    programList: ["cli", "lilypad"],
    allowedProgramDirectories: ["D:/Programs"],
    dissallowSubdirectoriesIn: ["D:/Programs", "D:/Macros", "D:/Program-Data", "D:/Palettes"],
    programSession: 0,
    errorText: "<span class='error'><span class='error-text'>!!ERROR!!</span> -</span>",
    fileSystem: {
        "C:": [], 
        "C:/Home": [
            { name: "welcome!", properties: {read: true, write: true, hidden: false}, data: ['Hello!', "Welcome to FroggyOS.", "Type 'help' for a list of commands.", "Have fun! ^v^"] },
        ],
        "C:/Docs": [],
        "D:": [], 
        "D:/Programs": [
            { name: "cli", properties: {read: false, write: false, hidden: true}, data: ["str cli = 'this program is hardcoded into froggyOS'", "endprog"] },
            { name: "lilypad", properties: {read: false, write: false, hidden: true}, data: ["str lilypad = 'this program is hardcoded into froggyOS'", "endprog"] },
            { name: "help", properties: {read: true, write: false, hidden: false}, data: [
                "str category = ''",
                "out 'Choose a category: '",
                "prompt category OS File Directory Other",
                "if {v:category == 'OS'}",
                "out 'clearstate. . . .clears froggyOS state'",
                "out 'loadstate . . . .loads froggyOS state'",
                "out 'savestate . . . .saves froggyOS state'",
                "out 'swimto [program] start a program'",
                "endif",
                "if {v:category == 'File'}",
                "out 'croak [file]. . . . . . . . .deletes the file'",
                "out 'hatch [file]. . . . . . . . .creates a file'",
                "out 'meta [file] . . . . . . . . .edits a file'",
                "out 'metaprop [file] [perm] [0/1] edits a file\'s properties'",
                "out 'spy [file]. . . . . . . . . .reads the file'",
                "endif",
                "if {v:category == 'Directory'}",
                "out 'spawn [directory] creates a directory'",
                "out 'hop [directory]. .moves to a directory'",
                "endif",
                "if {v:category == 'Other'}",
                "out 'changepalette [palette] changes the color palette'",
                "out 'clear. . . . . . . . . .clears the terminal output'",
                "out 'macro [macro]. . . . . .runs a macro'",
                "out 'ribbit [text]. . . . . .displays the text'",
                "out 'formattime [format]. . .changes the time format'",
                "out 'clearterminal' . . . . .clears the terminal output'",
                "endif",
                "endprog",
            ] },
            { name: "test", properties: {read: true, write: true, hidden: false}, data: [
                "str meow = 'meow'",
                "append meow 'woof woof gyatt'",
                "out v:meow",
                "endprog",

            ] },
            { name: "demo", properties: {read: true, write: true, hidden: true}, data: [
                "str field = ''",

                "int field_x = 0",
                "int player_x = 0",

                "str playerAction = 'right'",
                "int selectedOption = 0",

                "str fieldBackground = '.'",
                "str playerChar = '^-^'",

                "str quitConfirm = ''",


                "loop { true }",
                "    -- field generation",
                "    loop {v:field_x < 75}",
                "        if {v:field_x == v:player_x}",
                "            append field v:playerChar",
                "        else",
                "            append field v:fieldBackground",
                "        endif",
                "        set field_x = v:field_x + 1",
                "    endloop",

                "    clearterminal",

                "    out v:field",
                "    out ''",

                "    set field_x = 0",

                "    prompt selectedOption playerAction left right [[QUIT]]",
                "    if {v:playerAction == 'left' && v:player_x > 0}",
                "        set playerAction = 'left'",
                "        set player_x = v:player_x - 1",
                "        set selectedOption = 0",
                "    endif",

                "    if {v:playerAction == 'right' && v:player_x < 74}",
                "        set playerAction = 'right'",
                "        set player_x = v:player_x + 1",
                "        set selectedOption = 1",
                "    endif",

                "    if {v:playerAction == '[[QUIT]]'}",
                "        out 'Are you sure you want to quit?'",
                "        prompt 0 quitConfirm no yes",
                "        if {v:quitConfirm == 'yes'}",
                "            clearterminal",
                "            endprog",
                "        endif",
                "        set quitConfirm = ''",
                "    endif",

                "    set field = ''",
                "endloop",
            ] },
        ],
        "D:/Macros": [
            { name: "create-program", properties: {read: true, write: true, hidden: false}, data: [
                "!c",
                "h D:/Programs",
                "ch $1",
                "m $1"
            ] },
            { name: "edit-program", properties: {read: true, write: true, hidden: false}, data: [
                "!e",
                "h D:/Programs",
                "m $1"
            ] },
        ],
        "D:/Program-Data": [],
        "D:/Palettes": [
            // standard and revised palettes:  https://int10h.org/blog/2022/06/ibm-5153-color-true-cga-palette/
            { name: "standard", properties: {read: true, write: true, hidden: false}, data: [
                "000000", // 00 black
                "0000AA", // 01 blue
                "00AA00", // 02 green
                "00AAAA", // 03 cyan
                "AA0000", // 04 red
                "AA00AA", // 05 magenta
                "AA5500", // 06 brown
                "AAAAAA", // 07 light grey
                "555555", // 08 dark grey
                "5555FF", // 09 light blue
                "55FF55", // 10 light green
                "55FFFF", // 11 light cyan
                "FF5555", // 12 light red
                "FF55FF", // 13 light magenta
                "FFFF55", // 14 yellow
                "FFFFFF", // 15 white
            ] },
            { name: "revised", properties: {read: true, write: true, hidden: false}, data: [
                "000000",
                "0000C4",
                "00C400",
                "00C4C4",
                "C40000",
                "C400C4",
                "C47E00",
                "C4C4C4",
                "4E4E4E",
                "4E4EDC",
                "4EDC4E",
                "4EF3F3",
                "DC4E4E",
                "F34EF3",
                "F3F34E",
                "FFFFFF",
            ] },
            { name: "cherry", properties: {read: true, write: true, hidden: false}, data: [
                "000000",
                "1C219F",
                "289E42",
                "17ABAE",
                "E48579",
                "980C6C",
                "BC3517",
                "C2C5C6",
                "464C50",
                "5790E4",
                "FF9F58",
                "68DCCD",
                "831326",
                "D97BC7",
                "B7EA8A",
                "FFFFFF",
            ] },
            { name: "swamp", properties: {read: true, write: true, hidden: false}, data: [
                "000000",
                "4B71AF",
                "3F9A44",
                "3B9994",
                "DEA4A5",
                "9A3F95",
                "C27E4B",
                "B2B2B2",
                "6C6C6C",
                "96A2CF",
                "93C495",
                "AECFCD",
                "984547",
                "D7ABD4",
                "D6B87B",
                "FFFFFF",
            ] },
            { name: "swamp-revised", properties: {read: true, write: true, hidden: false}, data: [
                "000000",
                "31618D",
                "298B27",
                "268B67",
                "D3977F",
                "773669",
                "BF833A",
                "97A791",
                "465C3F",
                "8DBDD5",
                "81CB7D",
                "91C9B9",
                "753B29",
                "CBA9DB",
                "D7D357",
                "FFFFFF",
            ] },
            { name: "neon", properties: {read: true, write: true, hidden: false}, data: [
                "000000",
                "0000FF",
                "00FF00",
                "00FFFF",
                "FF0000",
                "FF00FF",
                "FFA500",
                "ABABAB",
                "757575",
                "5555FF",
                "55FF55",
                "55FFFF",
                "FF5555",
                "FF55FF",
                "FFFF55",
                "FFFFFF",
            ] },
        ]
    }
};