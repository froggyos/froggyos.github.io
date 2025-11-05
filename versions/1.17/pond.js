/**
 * Creates a scrollable interactive Pond menu.
 *
 * @param {{ [key: string]: Function | "text" | "newline" }} object
 * - Keys are menu labels.
 * - Values can be:
 *    - A function → selectable/executable item
 *    - "text" → plain text, not selectable
 *    - "newline" → blank line for spacing
 */
function createPondMenu(object) {
    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"));

    if(error) {
        throw new Error("Blocked attempt to open Pond from unauthorized context.");
    }

    // --- Remove any existing key listeners ---
    window.onkeyup = null;

    // --- Clear terminal before showing menu ---
    terminal.innerHTML = "";

    // --- Build menu items ---
    const items = Object.entries(object);
    const menuElements = [];
    const prefixElements = [];
    const selectable = [];

    items.forEach(([key, value], index) => {
        if (value === "newline") {
            terminal.appendChild(document.createElement("br"));
            menuElements.push(null);
            prefixElements.push(null);
            return;
        }

        const lineContainer = document.createElement("div");
        const terminalLine = document.createElement("div");

        lineContainer.classList.add("line-container");
        terminalLine.classList.add("terminal-line");

        if (value === "text") {
            // No prefix for non-selectable text entries
            terminalLine.textContent = key;
            terminalLine.classList.add("pond-menu-text");
            lineContainer.appendChild(terminalLine);
        } else {
            // Selectable function entry
            const prefix = document.createElement("span");
            prefix.textContent = "~";
            terminalLine.textContent = key;
            terminalLine.classList.add("pond-menu-item");

            lineContainer.appendChild(prefix);
            lineContainer.appendChild(terminalLine);

            prefixElements[index] = prefix;
            selectable.push(index);
        }

        terminal.appendChild(lineContainer);
        menuElements[index] = terminalLine;
        prefixElements[index] = prefixElements[index] || null;
    });

    // --- Selection logic ---
    if (selectable.length === 0) return; // nothing selectable

    let pos = 0;
    let selectedIndex = selectable[pos];
    updateSelection();

    function updateSelection() {
        for (let i = 0; i < menuElements.length; i++) {
            const el = menuElements[i];
            const prefix = prefixElements[i];
            if (!el) continue;

            if (i === selectedIndex) {
                el.classList.add("selected");
                if (prefix) prefix.textContent = "~>";
            } else {
                el.classList.remove("selected");
                if (prefix) prefix.textContent = "~";
            }
        }
    }

    // --- Handle keyboard navigation ---
    window.onkeyup = (e) => {
        if (e.key === "ArrowUp") {
            pos = (pos - 1 + selectable.length) % selectable.length;
            selectedIndex = selectable[pos];
            updateSelection();
            e.preventDefault();
        } else if (e.key === "ArrowDown") {
            pos = (pos + 1) % selectable.length;
            selectedIndex = selectable[pos];
            updateSelection();
            e.preventDefault();
        } else if (e.key === "Enter") {
            const [, fn] = items[selectedIndex];
            if (typeof fn === "function") fn();
        }
    };
}

const mainMenu = {
    "Welcome to the Pond!": "text",
    "Rules:": "text",
    "1. Be nice!": "text",
    "": "newline",
    "Inbox": () => {
        const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))

        if(error) {
            throw new Error("Blocked attempt to open Pond from unauthorized context.");
        }
        console.log("Opening inbox...");
    },
    "Compose Message": () => {
        const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))

        if(error) {
            throw new Error("Blocked attempt to open Pond from unauthorized context.");
        }
        window.onkeyup = null;
        terminal.innerHTML = "";
        // create a new file in D:/Pond/Messages with a file name of new-msg-Date.now()
        let newMsgFileName = `draft-${Date.now()}`;

        const file = new FroggyFile(newMsgFileName);

        file.write([
            "Recipient:",
            "",
            "-----",
            "Subject:",
            "",
            "-----",
            "Body:",
            ""
        ]);
        
        FroggyFileSystem.addFileToDirectory("D:/Pond/drafts", file);

        config.currentPath = "D:/Pond/drafts";

        createTerminalLine("Composing new message...", "", {translate: false});
        createTerminalLine("", "\u00A0", {translate: false});
        createTerminalLine("Press [ESC] to save and exit", ">", {translate: false});
        createTerminalLine("Press [SHIFT + ESC] to exit without saving", ">", {translate: false});
        createTerminalLine("Press [F1] to save", ">", {translate: false});
        createTerminalLine("Press [F3] to send the last >>saved version of the file<<", ">", {translate: false});
        createTerminalLine("", "~~~~~", {translate: false});
        openPondLilypad(file, {
            exitMenu: mainMenu
        });
    },
    "Sent Messages": () => {
        const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))

        if(error) {
            throw new Error("Blocked attempt to open Pond from unauthorized context.");
        }
    },
    "Drafts": () => {
        const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))

        if(error) {
            throw new Error("Blocked attempt to open Pond from unauthorized context.");
        }

        window.onkeyup = null;

        terminal.innerHTML = "";

        config.currentPath = "D:/Pond/drafts";

        // get all files in D:/Pond/drafts

        function draftMenu(){
            const draftFiles = FroggyFileSystem.getDirectory("D:/Pond/drafts");
            
            let menu = {
                "Drafts": "text",
                "": "newline",
                "Press [DEL] to delect the selected draft.": "text",
                "Drafts are stored locally in D:/Pond/drafts, make sure to save froggyOS in order to keep them.": "text",
                "": "newline"
            };

            draftFiles.forEach(file => {
                menu[file.getName()] = () => {
                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))

                    if(error) {
                        throw new Error("Blocked attempt to open Pond from unauthorized context.");
                    }

                    window.onkeyup = null;
                    terminal.innerHTML = "";

                    createTerminalLine("Editing draft...", "", {translate: false});
                    createTerminalLine("", "\u00A0", {translate: false});
                    createTerminalLine("Press [ESC] to save and exit", ">", {translate: false});
                    createTerminalLine("Press [SHIFT + ESC] to exit without saving", ">", {translate: false});
                    createTerminalLine("Press [F1] to save", ">", {translate: false});
                    createTerminalLine("Press [F3] to send the last >>saved version of the file<<", ">", {translate: false});
                    createTerminalLine("", "~~~~~", {translate: false});

                    openPondLilypad(file, {
                        exitMenu: draftMenu(),
                    });
                };
            })

            menu["<< Back to Main Menu"] = () => {
                const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                if(error) {
                    throw new Error("Blocked attempt to open Pond from unauthorized context.");
                }
                createPondMenu(mainMenu);
            };
            
            return menu;
        }

        createPondMenu(draftMenu());

        document.body.onkeydown = (e) => {
            if (e.key === "Delete") {
                const items = document.querySelectorAll(".pond-menu-item");
                const selected = document.querySelector(".pond-menu-item.selected");

                if (!selected) return; // nothing selected

                // find which index corresponds to the selected item
                const index = [...items].indexOf(selected);
                const draftFiles = FroggyFileSystem.getDirectory("D:/Pond/drafts");
                const file = draftFiles[index];

                if (!file) return;

                createPondMenu({
                    "Are you sure you want to delete this draft?": "text",
                    "No": () => {
                        const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                        if(error) {
                            throw new Error("Blocked attempt to open Pond from unauthorized context.");
                        }
                        createPondMenu(draftMenu());
                    },
                    "Yes": () => {
                        const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                        if(error) {
                            throw new Error("Blocked attempt to open Pond from unauthorized context.");
                        }
                        FroggyFileSystem.deleteFile(`D:/Pond/drafts/${file.getName()}`);
                        createPondMenu(draftMenu());
                    }
                })
            }
        };
    },
    "Exit": () => {
        const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))

        if(error) {
            throw new Error("Blocked attempt to open Pond from unauthorized context.");
        }
        terminal.innerHTML = "";
        window.onkeyup = null;
        createEditableTerminalLine(`${config.currentPath}>`);
    }
}

async function openPond(userRoles = []) {
    // get a stack trace
    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
    if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

    // promise for 1 second
    await new Promise((resolve) => setTimeout(resolve, 1000));
    terminal.innerHTML = "";

    const entrancePath = structuredClone(config.currentPath)

    if(userRoles.includes("admin")){
        mainMenu["Admin Panel"] = () => {
            const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
            if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

            const adminMenu = {
                "Ban User": () => {
                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                    if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                },
                "<< Back to Main Menu": () => {
                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                    if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                    createPondMenu(mainMenu);
                }
            }

            createPondMenu(adminMenu);
        };
    }

    createPondMenu(mainMenu)
};