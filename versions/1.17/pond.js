/**
 * Handles a request and routes the response to the appropriate status handler.
 * 
 * @param {string} link - The final part of the pond link, such as `/inbox` or `/send`.
 * @param {Object} body - The body of the request to be sent.
 * @param {Object<number, (req: Request, resBody: any) => void>} handlers - 
 * An object whose keys are HTTP status codes and whose values are functions 
 * that receive the request object and the parsed response body.
 * supports wildcard handlers like 40x, 50x for general error handling.
 */
async function handleRequest(link, body, handlers) {
    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"));
    if(error) throw new Error("Blocked attempt to make Pond request from unauthorized context.");
    try {
        const response = await fetch(`${pondLink}${link}`, body);
        let data;

        // Parse JSON safely
        try {
            data = await response.json();
        } catch (e) {
            createTerminalLine("Error: Response could not be parsed as JSON.", "", { translate: false });
            throw new Error(`JSON Parse Error: ${e.message}`);
        }

        handlers[429] = handlers[429] || function (response, data) {
            terminal.innerHTML = "";
            createTerminalLine("T_pond_rate_limited", config.errorText);
            createEditableTerminalLine(`${config.currentPath}>`);
        }

        // Try exact status handler first
        if (handlers[response.status]) {
            handlers[response.status](response, data);
            return;
        }

        // Try fallback wildcard handler (e.g. 40x, 50x)
        const wildcardKey = `${Math.floor(response.status / 10)}x`;
        if (handlers[wildcardKey]) {
            handlers[wildcardKey](response, data);
            return;
        }

        // Handle unexpected statuses
        const summary = `${response.status} ${response.statusText || ""}`.trim();

        console.error(data);
        throw new Error(`Unhandled response for link ${link}: ${summary} - ${data.type}`);
    } catch (e) {
        throw e; // rethrow for higher-level debugging
    }
}

/**
 * Creates a scrollable interactive Pond menu.
 *
 * @param {{ [key: string]: Function | "text" | "newline" }} object
 * - Keys are menu labels.
 * - Values can be:
 *    - A function → selectable/executable item
 *    - "text" → plain text, not selectable
 *    - "newline" → blank line for spacing
 *    - "input" → text input, key should be "id:id prefix:prefix", final id will result as "pond-input-${id}"
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

        if(value === "input") {

            const keyMatch = key.match(/^id:(\S+)\s+prefix:(.*)$/);

            terminalLine.classList.add("pond-menu-item");
            terminalLine.classList.add("pond-menu-input");
            terminalLine.setAttribute('contenteditable', 'plaintext-only');
            terminalLine.setAttribute('spellcheck', 'false');

            const prefix = document.createElement("span");
            prefix.textContent = keyMatch ? keyMatch[2] : "";

            terminalLine.id = keyMatch ? `pond-input-${keyMatch[1]}` : "";
            terminalLine.textContent = "";

            lineContainer.appendChild(prefix);
            lineContainer.appendChild(terminalLine);

            selectable.push(index);
            menuElements[index] = terminalLine;

        } else if (value === "text") {
            // No prefix for non-selectable text entries
            terminalLine.innerHTML = key;
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
                if(el.classList.contains("pond-menu-input")) {
                    el.focus();
                    const range = document.createRange();
                    range.selectNodeContents(el);
                    range.collapse(false);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            } else {
                el.classList.remove("selected");
                if (prefix) prefix.textContent = "~";
                if(el.classList.contains("pond-menu-input")) {
                    el.blur();
                }
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

        const sessionToken = FroggyFileSystem.getFile("D:/Pond/secret/e0ba59dd5c336adf").getData()[0];

        handleRequest("/inbox", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Session-Token": sessionToken
                }
            }, {
                200: async (response, data) => {
                    let inbox = data.inbox;

                    function createInboxMenu(){
                        let inboxMenu = {
                            "Inbox:": "text",
                            "": "newline",
                        };
                        inbox.forEach((message, index) => {
                            inboxMenu[`${message.read == false ? "(!) " : ""}${message.subject} - From: ${message.sender}`] = () => {
                                const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                                if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                                window.onkeyup = null;

                                terminal.innerHTML = "";

                                let userDecorations = "";

                                message.senderDecorations.forEach(deco => {
                                    if(decorations[deco]){
                                        userDecorations += ` ${decorations[deco]}`;
                                    }
                                });

                                let messageMenu = {
                                    [`${"\u00A0".repeat(5)}FROM : ${message.sender}${userDecorations}`]: "text",
                                    [`${"\u00A0".repeat(2)}SUBJECT : ${message.subject}`]: "text",
                                    [`TIMESTAMP : ${parseTimeFormat(config.timeFormat, message.timestamp)}`]: "text",
                                    "-----": "text",
                                    "a": "newline",
                                };
                                if(!Array.isArray(message.body)) message.body = [message.body];
                                message.body.forEach(line => {
                                    messageMenu[line] = "text";
                                })
                                messageMenu["b"] = "newline";
                                messageMenu["--\u200B---"] = "text";
                                messageMenu["<< Back to Inbox"] = () => {
                                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"));
                                    if (error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                                    if(message.read == false) {
                                        handleRequest("/mark-as-read", {
                                            method: "POST",
                                            headers: {
                                                "Content-Type": "application/json",
                                                "Session-Token": sessionToken
                                            },
                                            body: JSON.stringify({
                                                messageID: message.messageID,
                                            })
                                        }, {
                                            200: (response, data) => {
                                                inbox[index].read = true;
                                            },
                                            401: (response, data) => {
                                                terminal.innerHTML = "";
                                                createTerminalLine("T_invalid_session", config.errorText);
                                                createEditableTerminalLine(`${config.currentPath}>`);
                                            },
                                            404: (response, data) => {
                                                const type = data.type;

                                                if(type === "message"){
                                                    terminal.innerHTML = "";
                                                    createTerminalLine(`T_session_forcefully_terminated_additional_notes {{${localize("T_additional_notes_message_not_found")}}}`, config.errorText);
                                                    createEditableTerminalLine(`${config.currentPath}>`);
                                                } else if (type === "user"){
                                                    terminal.innerHTML = "";
                                                    createTerminalLine(`T_session_forcefully_terminated_additional_notes {{${localize("T_additional_notes_user_not_found")}}}`, config.errorText);
                                                    createEditableTerminalLine(`${config.currentPath}>`);
                                                }
                                            }
                                        });
                                    }

                                    createPondMenu(createInboxMenu());
                                };
                                messageMenu[`Report this message`] = () => {
                                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"));
                                    if (error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                                    let confirmationMenu = {
                                        "Write your report...": "text",
                                        "": "newline",
                                        "id:report-title prefix:Title of report:": "input",
                                        "id:report-details prefix:Give some details (optional):": "input",
                                        "Report": () => {
                                            const title = document.getElementById("pond-input-report-title").textContent.trim();
                                            const details = document.getElementById("pond-input-report-details").textContent.trim() || "No additional details provided.";

                                            if(title.length == 0){
                                                createTerminalLine("Please provide a title for the report.", config.errorText, {translate: false, expire: 5000});
                                                return;
                                            }

                                            const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"));
                                            if (error) throw new Error("Blocked attempt to open Pond from unauthorized context.");


                                            handleRequest("/report", {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    "Session-Token": sessionToken
                                                },
                                                body: JSON.stringify({
                                                    title: title,
                                                    details: details,
                                                    messageID: message.messageID,
                                                    sender: message.sender,
                                                    subject: message.subject,
                                                    body: message.body
                                                })
                                            }, {
                                                200: (response, data) => {
                                                    createPondMenu({
                                                        "Message reported successfully.": "text",
                                                        "<< Back to Inbox": () => {
                                                            const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"));
                                                            if (error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                                                            createPondMenu(createInboxMenu());
                                                        }
                                                    });
                                                },
                                                401: (response, data) => {
                                                    terminal.innerHTML = "";
                                                    createTerminalLine("T_invalid_session", config.errorText);
                                                    createEditableTerminalLine(`${config.currentPath}>`);
                                                },
                                                403: (response, data) => {
                                                    terminal.innerHTML = "";
                                                    createTerminalLine("T_session_forcefully_terminated", config.errorText);
                                                    createEditableTerminalLine(`${config.currentPath}>`);
                                                },
                                                404: (response, data) => {
                                                    terminal.innerHTML = "";
                                                    createTerminalLine(`T_session_forcefully_terminated_additional_notes {{${localize("T_additional_notes_user_not_found")}}}`, config.errorText);
                                                    createEditableTerminalLine(`${config.currentPath}>`);
                                                }
                                            });
                                        },
                                        "<< Back to Message": () => {
                                            const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"));
                                            if (error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                                            createPondMenu(messageMenu);
                                        }
                                    }

                                    createPondMenu(confirmationMenu);
                                };

                                createPondMenu(messageMenu);
                            };
                        });

                        inboxMenu["<< Back to Main Menu"] = () => {
                            const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                            if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                            createPondMenu(mainMenu);
                        };

                        return inboxMenu;
                    }

                    createPondMenu(createInboxMenu());
                },
                401: (response, data) => {
                    terminal.innerHTML = "";
                    createTerminalLine("T_invalid_session", config.errorText);
                    createEditableTerminalLine(`${config.currentPath}>`);
                },
                403: (response, data) => {
                    terminal.innerHTML = "";
                    createTerminalLine("T_session_forcefully_terminated", config.errorText);
                    createEditableTerminalLine(`${config.currentPath}>`);
                },
                404: (response, data) => {
                    terminal.innerHTML = "";
                    createTerminalLine("T_session_forcefully_terminated", config.errorText, {translate: false});
                    createEditableTerminalLine(`${config.currentPath}>`);
                },
                500: (response, data) => {
                    terminal.innerHTML = "";
                    createTerminalLine("T_pond_server_unreachable", config.errorText, {translate: false});
                    createEditableTerminalLine(`${config.currentPath}>`);
                }
            }
        );
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
        if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

        window.onkeyup = null;

        terminal.innerHTML = "";

        config.currentPath = "D:/Pond/sent";

        let menu = {
            "Sent Messages": "text",
            "Sent message records are stored locally in D:/Pond/sent, make sure to save froggyOS in order to keep them.": "text",
            "": "newline",
        }

        const sentMessages = FroggyFileSystem.getDirectory("D:/Pond/sent");

        sentMessages.forEach(file => {
            menu[file.getName()] = () => {
                const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                let sentMessageMenu = {}

                window.onkeyup = null;
                terminal.innerHTML = "";
                let messageBody = "";
                file.getData().forEach(line => {
                    messageBody += "> "+line+"<br>";
                });
                sentMessageMenu[messageBody] = "text";
                sentMessageMenu["<< Back to Sent Messages"] = () => {
                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                    if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                    createPondMenu(menu);
                }
                createPondMenu(sentMessageMenu);
            };
        });

        menu["<< Back to Main Menu"] = () => {
            const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
            if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
            createPondMenu(mainMenu);
        }

        createPondMenu(menu);
    },
    "Drafts": () => {
        const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))

        if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

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
                    const banMenu = {
                        "Ban user": "text",
                        "provide the length in a format like this: 1y 6mo 7d 12h 30m": "text",
                        "enter 0 for a permanent ban": "text",
                        "": "newline",
                        "id:username prefix:Enter username:": "input",
                        "id:length prefix:Enter length:": "input",
                        "id:reason prefix:Enter reason:": "input",
                        "Ban": () => {
                            const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                            if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                            function parseDuration(str) {
                                const regex = /(\d+)(y|mo|d|h|m|s)/g;
                                let ms = 0;

                                if(str.trim() === "0") return -1; // permanent ban

                                for (const [, num, unit] of str.matchAll(regex)) {
                                    const n = +num;
                                    switch (unit) {
                                        case "y":  ms += n * 1000 * 60 * 60 * 24 * 365; break;
                                        case "mo": ms += n * 1000 * 60 * 60 * 24 * 30;  break;
                                        case "d":  ms += n * 1000 * 60 * 60 * 24;       break;
                                        case "h":  ms += n * 1000 * 60 * 60;            break;
                                        case "m":  ms += n * 1000 * 60;                 break;
                                        case "s":  ms += n * 1000;                      break;
                                    }
                                }

                                return ms;
                            }

                            const username = document.getElementById("pond-input-username").textContent.trim();
                            const length = document.getElementById("pond-input-length").textContent.trim();
                            const reason = document.getElementById("pond-input-reason").textContent.trim();

                            if(username.length == 0){
                                createTerminalLine("Please provide a username to ban.", config.errorText, {translate: false, expire: 5000});
                                return;
                            }
                            if(length.length == 0){
                                createTerminalLine("Please provide a length for the ban.", config.errorText, {translate: false, expire: 5000});
                                return;
                            }

                            const durationMs = parseDuration(length);
                            if(isNaN(durationMs)){
                                createTerminalLine("Invalid length format. Please use the specified format.", config.errorText, {translate: false, expire: 5000});
                                return;
                            }

                            const sessionToken = FroggyFileSystem.getFile("D:/Pond/secret/e0ba59dd5c336adf").getData()[0];

                            handleRequest("/ban", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Session-Token": sessionToken
                                },
                                body: JSON.stringify({
                                    username,
                                    duration: durationMs,
                                    reason
                                })
                            }, {
                                200: (response, data) => {
                                    createPondMenu({
                                        "User banned successfully.": "text",
                                        "<< Back to Admin Menu": () => {
                                            const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                                            if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                                            createPondMenu(adminMenu);
                                        }
                                    });
                                },
                                401: (response, data) => {
                                    terminal.innerHTML = "";
                                    createTerminalLine("T_invalid_session", config.errorText);
                                    createEditableTerminalLine(`${config.currentPath}>`);
                                },
                                403: (response, data) => {
                                    if(data.type == "no_permission"){
                                        createTerminalLine("You do not have permission to ban this user.", config.errorText, {translate: false, expire: 5000});
                                    } else if (data.type == "banned"){
                                        terminal.innerHTML = "";
                                        createTerminalLine("T_session_forcefully_terminated", config.errorText);
                                        createEditableTerminalLine(`${config.currentPath}>`);
                                    }
                                },
                                404: (response, data) => {
                                    terminal.innerHTML = "";
                                    if(data.type == "user"){
                                        createTerminalLine(`T_session_forcefully_terminated_additional_notes {{${localize("T_additional_notes_user_not_found")}}}`, config.errorText),
                                        createTerminalLine("T_session_forcefully_terminated", config.errorText);
                                    }
                                    createEditableTerminalLine(`${config.currentPath}>`);
                                }   
                            });

                        },
                        "<< Back to Admin Menu": () => {
                            const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                            if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                            createPondMenu(adminMenu);
                        }
                    }
                    createPondMenu(banMenu);

                },
                "Unban User": () => {
                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                    if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                    const unbanMenu = {
                        "Unban user": "text",
                        "": "newline",
                        "id:username prefix:Enter username:": "input",
                        "Unban": () => {
                        },
                        "<< Back to Admin Menu": () => {
                            const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                            if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                            createPondMenu(adminMenu);
                        }
                    }

                    createPondMenu(unbanMenu);
                },
                "View Reports": () => {
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


const decorations = {
    "admin": `<span style="color: var(--c12)">[ADMIN]</span>`,
    "owner": `<span style="color: #f7a923">[OWNER]</span>`,
}