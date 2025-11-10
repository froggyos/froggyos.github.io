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

    handlers[500] = handlers[500] || function (response, data) {
        terminal.innerHTML = "";
        createTerminalLine("T_pond_server_unreachable", config.errorText);
        createEditableTerminalLine(`${config.currentPath}>`);
    }

    handlers[429] = handlers[429] || function (response, data) {
        terminal.innerHTML = "";
        createTerminalLine("T_pond_rate_limited", config.errorText);
        createEditableTerminalLine(`${config.currentPath}>`);
    }
    try {
        const response = await fetch(`${pondLink}${link}`, body);
        let data;

        // Parse JSON safely
        try {
            data = await response.json();
        } catch (e) {
            console.error(response)
            throw new Error(`JSON Parse Error: ${e.message}`);
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

        createTerminalLine(`Please check the developer console (CTRL+SHIFT+I)`, config.fatalErrorText, {translate: false});
        throw new Error(`Unhandled response for ${link}: ${summary} - ${data.type}`);
    } catch (e) {
        console.error(e)
        handlers[500]();
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
 *    - "checkbox" → checkbox input, key should be "id:id prefix:prefix", final id will result as "pond-checkbox-${id}"
 */
function createPondMenu(object) {
    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"));
    if (error) {
        throw new Error("Blocked attempt to open Pond from unauthorized context.");
    }

    // --- Remove any existing key listeners ---
    window.onkeyup = null;

    // --- Clear terminal before showing menu ---
    terminal.innerHTML = "";

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

        let prefix = document.createElement("span");
        prefix.textContent = "~ "; // default prefix for all selectable items

        if (value === "input") {
            const keyMatch = key.match(/^id:(\S+)\s+prefix:(.*)$/);
            const userPrefix = keyMatch ? keyMatch[2] : "";

            prefix.textContent = `~ ${userPrefix}`;

            terminalLine.classList.add("pond-menu-item", "pond-menu-input");
            terminalLine.setAttribute('contenteditable', 'plaintext-only');
            terminalLine.setAttribute('spellcheck', 'false');
            terminalLine.id = keyMatch ? `pond-input-${keyMatch[1]}` : "";
            terminalLine.textContent = "";

            lineContainer.appendChild(prefix);
            lineContainer.appendChild(terminalLine);

            selectable.push(index);
            menuElements[index] = terminalLine;
            prefixElements[index] = prefix;

        } else if (value === "checkbox") {
            const keyMatch = key.match(/^id:(\S+)\s+prefix:(.+?)(?:\s+checked)?$/);
            const userPrefix = keyMatch ? keyMatch[2].trim() : "";
            const checked = /\schecked$/.test(key);

            prefix.textContent = `~ ${userPrefix}`;

            terminalLine.classList.add("pond-menu-item", "pond-menu-checkbox");
            terminalLine.id = keyMatch ? `pond-checkbox-${keyMatch[1]}` : "";
            terminalLine.dataset.checked = checked ? "true" : "false";
            terminalLine.textContent = checked ? "[X]" : "[ ]";

            lineContainer.appendChild(prefix);
            lineContainer.appendChild(terminalLine);

            selectable.push(index);
            menuElements[index] = terminalLine;
            prefixElements[index] = prefix;

        } else if (value === "text") {
            key = key.replace(/☼{{USERNAME}}☼/, FroggyFileSystem.getFile(`D:/Pond/secret/${tokenFile}`).getData()[1]);
            terminalLine.innerHTML = key;
            terminalLine.classList.add("pond-menu-text");
            lineContainer.appendChild(terminalLine);

            menuElements[index] = terminalLine;
            prefixElements[index] = null;

        } else {
            terminalLine.classList.add("pond-menu-item");
            terminalLine.textContent = key;

            lineContainer.appendChild(prefix);
            lineContainer.appendChild(terminalLine);

            selectable.push(index);
            menuElements[index] = terminalLine;
            prefixElements[index] = prefix;
        }

        terminal.appendChild(lineContainer);
    });

    // --- Selection logic ---
    if (selectable.length === 0) return;

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

                if (prefix) {
                    // convert "~ prefix" -> "~> prefix"
                    prefix.textContent = prefix.textContent.replace(/^~(>?)\s*/, "~> ");
                }

                if (el.classList.contains("pond-menu-input")) {
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

                if (prefix) {
                    // convert "~> prefix" -> "~ prefix"
                    prefix.textContent = prefix.textContent.replace(/^~>\s*/, "~ ");
                }

                if (el.classList.contains("pond-menu-input")) {
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
            const el = menuElements[selectedIndex];

            if (el?.classList.contains("pond-menu-checkbox")) {
                const isChecked = el.dataset.checked === "true";
                el.dataset.checked = isChecked ? "false" : "true";
                el.textContent = isChecked ? "[ ]" : "[X]";
                return;
            }

            const [, fn] = items[selectedIndex];
            if (typeof fn === "function") fn();
        }
    };
}
// function createPondMenu(object) {
//     const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"));

//     if(error) {
//         throw new Error("Blocked attempt to open Pond from unauthorized context.");
//     }

//     // --- Remove any existing key listeners ---
//     window.onkeyup = null;

//     // --- Clear terminal before showing menu ---
//     terminal.innerHTML = "";

//     // --- Build menu items ---
//     const items = Object.entries(object);
//     const menuElements = [];
//     const prefixElements = [];
//     const selectable = [];

//     items.forEach(([key, value], index) => {

//         if (value === "newline") {
//             terminal.appendChild(document.createElement("br"));
//             menuElements.push(null);
//             prefixElements.push(null);
//             return;
//         }

//         const lineContainer = document.createElement("div");
//         const terminalLine = document.createElement("div");

//         lineContainer.classList.add("line-container");
//         terminalLine.classList.add("terminal-line");

//         if(value === "input") {

//             const keyMatch = key.match(/^id:(\S+)\s+prefix:(.*)$/);

//             terminalLine.classList.add("pond-menu-item");
//             terminalLine.classList.add("pond-menu-input");
//             terminalLine.setAttribute('contenteditable', 'plaintext-only');
//             terminalLine.setAttribute('spellcheck', 'false');

//             const prefix = document.createElement("span");
//             prefix.textContent = keyMatch ? keyMatch[2] : "";

//             terminalLine.id = keyMatch ? `pond-input-${keyMatch[1]}` : "";
//             terminalLine.textContent = "";

//             lineContainer.appendChild(prefix);
//             lineContainer.appendChild(terminalLine);

//             selectable.push(index);
//             menuElements[index] = terminalLine;
//         } else if (value === "checkbox"){
//             const keyMatch = key.match(/^id:(\S+)\s+prefix:(.*)\s+(checked)?$/);

//             const checked = keyMatch && keyMatch[3] === "checked";

//             const prefix = document.createElement("span");
//             prefix.textContent = keyMatch ? keyMatch[2] : "";
            
//             terminalLine.classList.add("pond-menu-item");
//             terminalLine.classList.add("pond-menu-checkbox");
//             terminalLine.id = keyMatch ? `pond-checkbox-${keyMatch[1]}` : "";
//             terminalLine.dataset.checked = checked ? "true" : "false";
//             terminalLine.textContent = checked ? "[X]" : "[ ]";

//             lineContainer.appendChild(prefix);
//             lineContainer.appendChild(terminalLine);

//             menuElements[index] = terminalLine;
//             selectable.push(index);

//         } else if (value === "text") {
//             // No prefix for non-selectable text entries
//             key = key.replace(/☼{{USERNAME}}☼/, FroggyFileSystem.getFile(`D:/Pond/secret/${tokenFile}`).getData()[1]);
//             terminalLine.innerHTML = key;
//             terminalLine.classList.add("pond-menu-text");
//             lineContainer.appendChild(terminalLine);
//         } else {
//             // Selectable function entry
//             const prefix = document.createElement("span");
//             prefix.textContent = "~";
//             terminalLine.textContent = key;
//             terminalLine.classList.add("pond-menu-item");

//             lineContainer.appendChild(prefix);
//             lineContainer.appendChild(terminalLine);

//             prefixElements[index] = prefix;
//             selectable.push(index);
//         }

//         terminal.appendChild(lineContainer);
//         menuElements[index] = terminalLine;
//         prefixElements[index] = prefixElements[index] || null;
//     });

//     // --- Selection logic ---
//     if (selectable.length === 0) return; // nothing selectable

//     let pos = 0;
//     let selectedIndex = selectable[pos];
//     updateSelection();

//     function updateSelection() {
//         for (let i = 0; i < menuElements.length; i++) {
//             const el = menuElements[i];
//             const prefix = prefixElements[i];
//             if (!el) continue;

//             if (i === selectedIndex) {
//                 el.classList.add("selected");
//                 if (prefix) prefix.textContent = "~>";
//                 if(el.classList.contains("pond-menu-input")) {
//                     el.focus();
//                     const range = document.createRange();
//                     range.selectNodeContents(el);
//                     range.collapse(false);
//                     const sel = window.getSelection();
//                     sel.removeAllRanges();
//                     sel.addRange(range);
//                 }
//             } else {
//                 el.classList.remove("selected");
//                 if (prefix) prefix.textContent = "~";
//                 if(el.classList.contains("pond-menu-input")) {
//                     el.blur();
//                 }
//             }
//         }
//     }

//     // --- Handle keyboard navigation ---
//     window.onkeyup = (e) => {
//         if (e.key === "ArrowUp") {
//             pos = (pos - 1 + selectable.length) % selectable.length;
//             selectedIndex = selectable[pos];
//             updateSelection();
//             e.preventDefault();

//         } else if (e.key === "ArrowDown") {
//             pos = (pos + 1) % selectable.length;
//             selectedIndex = selectable[pos];
//             updateSelection();
//             e.preventDefault();

//         } else if (e.key === "Enter") {
//             const el = menuElements[selectedIndex];

//             if (el?.classList.contains("pond-menu-checkbox")) {
//                 const isChecked = el.dataset.checked === "true";
//                 el.dataset.checked = isChecked ? "false" : "true";
//                 el.textContent = isChecked ? "[ ]" : "[X]";
//                 return;
//             }

//             const [, fn] = items[selectedIndex];
//             if (typeof fn === "function") fn();
//         }
//     };
// }

const mainMenu = {
    [`Welcome to the Pond, ☼{{USERNAME}}☼!`]: "text",
    "Rules:": "text",
    "1. Be nice!": "text",
    "": "newline",
    "Inbox": () => {
        const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))

        if(error) {
            throw new Error("Blocked attempt to open Pond from unauthorized context.");
        }

        const sessionToken = FroggyFileSystem.getFile(`D:/Pond/secret/${tokenFile}`).getData()[0];

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

                                let userDecorations = getDecorations(message.senderDecorations);

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
                                            createTerminalLine("T_pond_invalid_session", config.errorText);
                                            createEditableTerminalLine(`${config.currentPath}>`);
                                        },
                                        404: (response, data) => {
                                            const type = data.type;

                                            if(type === "message"){
                                                terminal.innerHTML = "";
                                                createTerminalLine(`T_pond_session_forcefully_terminated_additional_notes {{${localize("T_pond_message_not_found")}}}`, config.errorText);
                                                createEditableTerminalLine(`${config.currentPath}>`);
                                            } else if (type === "user"){
                                                terminal.innerHTML = "";
                                                createTerminalLine(`T_pond_session_forcefully_terminated_additional_notes {{${localize("T_pond_user_not_found")}}}`, config.errorText);
                                                createEditableTerminalLine(`${config.currentPath}>`);
                                            }
                                        }
                                    });
                                }

                                let messageMenu = {
                                    [`${"\u00A0".repeat(5)}FROM : ${message.sender}\u00A0${userDecorations}`]: "text",
                                    [`${"\u00A0".repeat(2)}SUBJECT : ${message.subject}`]: "text",
                                    [`TIMESTAMP : ${parseTimeFormat(config.timeFormat, message.timestamp)}`]: "text",
                                    "-----": "text",
                                    "a": "newline",
                                };
                                if(!Array.isArray(message.body)) message.body = [message.body];
                                messageMenu[`${message.body.map(line => `${line}`).join("<br>")}`] = "text";
                                messageMenu["b"] = "newline";
                                messageMenu["--\u200B---"] = "text";
                                messageMenu["<< Back to Inbox"] = () => {
                                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"));
                                    if (error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                                    createPondMenu(createInboxMenu());
                                };
                                messageMenu[`Report this message`] = () => {
                                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"));
                                    if (error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                                    let confirmationMenu = {
                                        "Write your report...": "text",
                                        "": "newline",
                                        "id:report-title prefix:Title of report:": "input",
                                        "id:report-details prefix:Details (optional):": "input",
                                        "id:delete-message prefix:Delete message?: checked": "checkbox",
                                        "Report": () => {
                                            const title = document.getElementById("pond-input-report-title").textContent.trim();
                                            const details = document.getElementById("pond-input-report-details").textContent.trim() || "No additional details provided.";

                                            if(title.length == 0){
                                                createTerminalLine("Please provide a title for the report.", config.errorText, {translate: false, expire: 5000});
                                                return;
                                            }

                                            const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"));
                                            if (error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                                            const deleteMessage = document.getElementById("pond-checkbox-delete-message").dataset.checked === "true";


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
                                                    body: message.body,
                                                    deleteMessage: deleteMessage
                                                })
                                            }, {
                                                200: (response, data) => {
                                                    // delete the message from inbox

                                                    if(deleteMessage) inbox = inbox.filter(msg => msg.messageID !== message.messageID);

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
                                                    createTerminalLine("T_pond_invalid_session", config.errorText);
                                                    createEditableTerminalLine(`${config.currentPath}>`);
                                                },
                                                403: (response, data) => {
                                                    terminal.innerHTML = "";
                                                    createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                                                    createEditableTerminalLine(`${config.currentPath}>`);
                                                },
                                                404: (response, data) => {
                                                    terminal.innerHTML = "";
                                                    createTerminalLine(`T_pond_session_forcefully_terminated_additional_notes {{${localize("T_pond_user_not_found")}}}`, config.errorText);
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
                    createTerminalLine("T_pond_invalid_session", config.errorText);
                    createEditableTerminalLine(`${config.currentPath}>`);
                },
                403: (response, data) => {
                    terminal.innerHTML = "";
                    createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                    createEditableTerminalLine(`${config.currentPath}>`);
                },
                404: (response, data) => {
                    terminal.innerHTML = "";
                    createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                    createEditableTerminalLine(`${config.currentPath}>`);
                },
                500: (response, data) => {
                    terminal.innerHTML = "";
                    createTerminalLine("T_pond_server_unreachable", config.errorText);
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
    "Username Search": () => {
        const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
        if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

        window.onkeyup = null;

        terminal.innerHTML = "";

        let searchMenu = {
            "id:search-query prefix:Enter username to search:": "input",
            "Search": () => {
                const query = document.getElementById("pond-input-search-query").textContent.trim();

                const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                const sessionToken = FroggyFileSystem.getFile(`D:/Pond/secret/${tokenFile}`).getData()[0];

                handleRequest("/usernames", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Session-Token": sessionToken,
                        "searchTerm": query
                    }
                }, {
                    200: (response, data) => {
                        let results = data.usernames;

                        const usernames = [];

                        for(const [key, value] of Object.entries(results)){
                           usernames.push(`${key} ${getDecorations(value)}`);
                        }

                        const resultsMenu = {
                            "Search Results:": "text",
                            "": "newline",
                            [usernames.join("<br>")]: "text",
                            "<< Back to Search": () => {
                                const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                                if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                                createPondMenu(searchMenu);
                            }
                        };

                        createPondMenu(resultsMenu);
                    },
                    401: (response, data) => {
                        terminal.innerHTML = "";
                        createTerminalLine("T_pond_invalid_session", config.errorText);
                        createEditableTerminalLine(`${config.currentPath}>`);
                    },
                    403: (response, data) => {
                        terminal.innerHTML = "";
                        createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                        createEditableTerminalLine(`${config.currentPath}>`);
                    },
                });
            },
            "<< Back to Main Menu": () => {
                const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                createPondMenu(mainMenu);
            }
        };

        createPondMenu(searchMenu);
    },
    "Settings": () => {
        const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
        if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");


        window.onkeyup = null;

        terminal.innerHTML = "";

        handleRequest("/get-settings", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Session-Token": FroggyFileSystem.getFile(`D:/Pond/secret/${tokenFile}`).getData()[0]
            }
        }, {
            200: (response, data) => {
                const settings = data.settings;

                let appearInSearches = settings.appearInSearches

                const settingsMenu = {
                    "Your Settings": "text",
                    "": "newline",
                    [`id:appearInSearches prefix:Appear in username searches? ${appearInSearches ? 'checked' : ''}`]: "checkbox",
                    "Save": () => {
                        handleRequest("/save-settings", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Session-Token": FroggyFileSystem.getFile(`D:/Pond/secret/${tokenFile}`).getData()[0]
                            },
                            body: JSON.stringify({
                                appearInSearches: document.getElementById("pond-checkbox-appearInSearches").dataset.checked === "true"
                            })
                        }, {
                            200: (response, data) => {
                                createTerminalLine("T_pond_settings_saved", "", {expire: 5000});
                            },
                            401: (response, data) => {
                                terminal.innerHTML = "";
                                createTerminalLine("T_pond_invalid_session", config.errorText);
                                createEditableTerminalLine(`${config.currentPath}>`);
                            },
                            403: (response, data) => {
                                terminal.innerHTML = "";
                                createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                                createEditableTerminalLine(`${config.currentPath}>`);
                            },
                            404: (response, data) => {
                                terminal.innerHTML = "";
                                createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                                createEditableTerminalLine(`${config.currentPath}>`);
                            }
                        });

                    },
                    "<< Back to Main Menu": () => {
                        const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                        if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                        createPondMenu(mainMenu);
                    }
                }

                createPondMenu(settingsMenu);
            },
            401: (response, data) => {
                terminal.innerHTML = "";
                createTerminalLine("T_pond_invalid_session", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
            },
            404: (response, data) => {
                terminal.innerHTML = "";
                createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                createEditableTerminalLine(`${config.currentPath}>`);
            }
        });
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

    if(userRoles.includes("mod")){
        mainMenu["Mod Panel"] = () => {
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
                // add option for IP ban
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
                        createTerminalLine("T_pond_provide_ban_user", config.errorText, {expire: 5000});
                        return false;
                    }
                    if(length.length == 0){
                        createTerminalLine("T_pond_provide_ban_duration", config.errorText, {expire: 5000});
                        return false;
                    }

                    const durationMs = parseDuration(length);
                    if(isNaN(durationMs)){
                        createTerminalLine("T_pond_invalid_length_format", config.errorText, {expire: 5000});
                        return false;
                    }

                    const sessionToken = FroggyFileSystem.getFile(`D:/Pond/secret/${tokenFile}`).getData()[0];

                    // if ip banned, send request to /ip-ban as well
                    //

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
                                "<< Back to Mod Menu": () => {
                                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                                    if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                                    createPondMenu(modMenu);
                                }
                            });
                        },
                        401: (response, data) => {
                            if(data.type == "no_permission"){
                                createTerminalLine("T_pond_no_permission_to_ban_user", config.errorText, {expire: 5000});
                                return
                            }
                            terminal.innerHTML = "";
                            createTerminalLine("T_pond_invalid_session", config.errorText);
                            createEditableTerminalLine(`${config.currentPath}>`);
                        },
                        403: (response, data) => {
                            terminal.innerHTML = "";
                            createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                            createEditableTerminalLine(`${config.currentPath}>`);
                        },
                        404: (response, data) => {
                            terminal.innerHTML = "";
                            if(data.type == "user"){
                                createTerminalLine(`T_pond_session_forcefully_terminated_additional_notes {{${localize("T_pond_user_not_found")}}}`, config.errorText),
                                createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                            }
                            createEditableTerminalLine(`${config.currentPath}>`);
                        }   
                    });

                },
                "<< Back to Mod Menu": () => {
                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                    if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                    createPondMenu(modMenu);
                }
            }

            const warnMenu = {
                "Warn User": "text",
                "": "newline",
                "id:username prefix:Enter username:": "input",
                "id:reason prefix:Enter reason:": "input",
                "Warn": () => {
                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                    if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                    const username = document.getElementById("pond-input-username").textContent.trim();
                    const reason = document.getElementById("pond-input-reason").textContent.trim();
                    if(username.length == 0){
                        createTerminalLine("T_pond_provide_warn_user", config.errorText, {expire: 5000});
                        return false;
                    }
                    if(reason.length == 0){
                        createTerminalLine("T_pond_provide_warn_reason", config.errorText, {expire: 5000});
                        return false;
                    }
                    handleRequest("/warn", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Session-Token": FroggyFileSystem.getFile(`D:/Pond/secret/${tokenFile}`).getData()[0]
                        },
                        body: JSON.stringify({
                            username,
                            reason
                        })
                    }, {
                        200: (response, data) => {
                            //resolveReport();
                            createPondMenu({
                                "User warned successfully.": "text",
                                "<< Back to Mod Menu": () => {
                                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                                    if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                                    createPondMenu(modMenu);
                                }
                            });
                        },
                        401: (response, data) => {
                            if(data.type == "no_permission"){
                                createTerminalLine("T_pond_no_permission_to_warn_user", config.errorText, {expire: 5000});
                                return;
                            }
                            terminal.innerHTML = "";
                            createTerminalLine("T_pond_invalid_session", config.errorText);
                            createEditableTerminalLine(`${config.currentPath}>`);
                        },
                        403: (response, data) => {
                            terminal.innerHTML = "";
                            createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                            createEditableTerminalLine(`${config.currentPath}>`);
                        },
                        404: (response, data) => {
                            terminal.innerHTML = ""; 
                            if(data.type == "user"){
                                createTerminalLine("T_pond_user_not_found", config.errorText, {expire: 5000});
                            } else {
                                createTerminalLine(`T_pond_session_forcefully_terminated`, config.errorText);
                                createEditableTerminalLine(`${config.currentPath}>`);
                            }
                        }
                    });
                },
                "<< Return to Mod Menu": () => {
                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                    if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                    createPondMenu(modMenu);
                },
            };

            const modMenu = {
                "Ban User": () => {
                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                    if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
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
                            const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                            if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                            const username = document.getElementById("pond-input-username").textContent.trim();

                            if(username.length == 0){
                                createTerminalLine("T_pond_provide_user_to_unban", config.errorText, {expire: 5000});
                                return;
                            }
                            handleRequest("/unban", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Session-Token": FroggyFileSystem.getFile(`D:/Pond/secret/${tokenFile}`).getData()[0]
                                },
                                body: JSON.stringify({
                                    username
                                })
                            }, {
                                200: (response, data) => {
                                    createPondMenu({
                                        "User unbanned successfully.": "text",
                                        "<< Back to Mod Menu": () => {
                                            const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                                            if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                                            createPondMenu(modMenu);
                                        }
                                    });
                                },
                                401: (response, data) => {
                                    if(data.type == "no_permission"){
                                        createTerminalLine("T_pond_no_permission_to_unban_user", config.errorText, {expire: 5000});
                                    } else {
                                        terminal.innerHTML = "";
                                        createTerminalLine("T_pond_invalid_session", config.errorText);
                                        createEditableTerminalLine(`${config.currentPath}>`);
                                    }
                                },
                                403: (response, data) => {
                                    terminal.innerHTML = "";
                                    createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                                    createEditableTerminalLine(`${config.currentPath}>`);
                                },
                                404: (response, data) => {
                                    if(data.type == "user"){
                                        createTerminalLine("T_pond_user_not_found", config.errorText, {expire: 5000});
                                    } else {
                                        terminal.innerHTML = "";
                                        if(data.type == "moderator"){
                                            createTerminalLine(`T_pond_session_forcefully_terminated_additional_notes {{${localize("T_pond_user_not_found")}}}`, config.errorText)
                                        } else {
                                            createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                                        }
                                        createEditableTerminalLine(`${config.currentPath}>`);
                                    }
                                }
                            });
                        },
                        "<< Back to Mod Menu": () => {
                            const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                            if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                            createPondMenu(modMenu);
                        }
                    }

                    createPondMenu(unbanMenu);
                },
                "Warn User": () => {
                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                    if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                    createPondMenu(warnMenu);
                },
                "View Reports": () => {
                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                    if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                    handleRequest("/get-reports", {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "Session-Token": FroggyFileSystem.getFile(`D:/Pond/secret/${tokenFile}`).getData()[0]
                        }
                    }, {
                        200: (response, data) => {
                            const reports = data.reports;


                            function createReportsMenu(){

                                const reportsMenu = {
                                    "User Reports": "text",
                                    "": "newline",
                                };

                                reports.forEach((report, index) => {
                                    const reportStatus = report.resolved ? "[CLSD]" : "[OPEN]";
                                    reportsMenu[`${reportStatus} - ${report.reportID}`] = () => {
                                        const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                                        if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                                        terminal.innerHTML = "";

                                        function resolveReport(){
                                            handleRequest("/resolve-report", {
                                                method: "POST",
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    "Session-Token": FroggyFileSystem.getFile(`D:/Pond/secret/${tokenFile}`).getData()[0]
                                                },
                                                body: JSON.stringify({
                                                    reportID: report.reportID
                                                })
                                            }, {
                                                200: (response, data) => {
                                                },
                                                401: (response, data) => {
                                                    if(data.type == "no_permission"){
                                                        createTerminalLine("T_pond_no_permission_to_resolve_reports", config.errorText, {expire: 5000});
                                                        return;
                                                    }
                                                    terminal.innerHTML = "";
                                                    createTerminalLine("T_pond_invalid_session", config.errorText);
                                                    createEditableTerminalLine(`${config.currentPath}>`);
                                                },
                                                403: (response, data) => {
                                                    terminal.innerHTML = "";
                                                    createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                                                    createEditableTerminalLine(`${config.currentPath}>`);
                                                },
                                                404: (response, data) => {
                                                    terminal.innerHTML = "";
                                                    createTerminalLine(`T_pond_session_forcefully_terminated_additional_notes {{${localize("T_pond_user_not_found")}}}`, config.errorText);
                                                    createEditableTerminalLine(`${config.currentPath}>`);
                                                }
                                            });
                                        }

                                        const reportMenu = {
                                            [`${"\u00A0".repeat(4)}TITLE : ${report.title}`]: "text",
                                            [`${"\u00A0".repeat(1)}REPORTER : ${report.reporter}`]: "text",
                                            [`TIMESTAMP : ${parseTimeFormat(config.timeFormat, report.reportTimestamp)}`]: "text",
                                            [`${"\u00A0".repeat(2)}DETAILS : ${report.details}`]: "text",
                                            [`REPORT ID : ${report.reportID}`]: "text",
                                            "": "newline",
                                            "Reported Message:": "text",
                                            " ": "newline",
                                            [`${"\u00A0".repeat(3)}FROM : ${report.reportedMessage.sender}`]: "text",
                                            [`SUBJECT : ${report.reportedMessage.subject}`]: "text",
                                            "-----": "text",
                                            "a": "newline",
                                            [report.reportedMessage.body.join("<br>")]: "text",
                                            "b": "newline",
                                            "--\u200b---": "text",
                                            [report.resolved ? 
                                                "Resolved by : " +  report.resolvedBy + "<br>" +
                                                "Resolution Timestamp : " + parseTimeFormat(config.timeFormat, report.resolutionTimestamp)
                                                : ""]: "text",
                                            "Take Action:": "text",
                                            "": "newline",
                                            "Ban Sender": () => {
                                                const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                                                if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                                                const oldBanFunction = banMenu["Ban"].bind(banMenu);

                                                banMenu["Ban"] = function(){
                                                    let result = oldBanFunction();
                                                    if(result !== false){

                                                        let banInput = document.getElementById("pond-input-length").textContent.trim();
                                                        let reasonInput = document.getElementById("pond-input-reason").textContent.trim();

                                                        const banLength = banInput === "0" ? "permanently" : `for ${banInput}`;
                                                        const reason = reasonInput.length === 0 ? "Violation of Community Guidelines. (It's ONE rule.)" : reasonInput;

                                                        handleRequest("/send", {
                                                            method: "POST",
                                                            headers: {
                                                                "Content-Type": "application/json",
                                                                "Session-Token": FroggyFileSystem.getFile(`D:/Pond/secret/${tokenFile}`).getData()[0]
                                                            },
                                                            body: JSON.stringify({
                                                                recipient: report.reporter,
                                                                subject: `Your report has been processed (AUTOMATIC)`,
                                                                body: [
                                                                    `Hello ${report.reporter},`,
                                                                    "",
                                                                    `This is to inform you that your report has been processed by our moderation team. If you have any further questions or concerns, please feel free to reach out.`,
                                                                    "",
                                                                    `The user ${report.reportedMessage.sender} has been banned ${banLength} for the following reason:`,
                                                                    `${reason}`,
                                                                    "",
                                                                    "Thank you for helping us maintain a safe community."
                                                                ],
                                                                timestamp: Date.now()
                                                            })
                                                        }, {
                                                            200: (response, data) => {
                                                                resolveReport();
                                                                createPondMenu({
                                                                    "User banned and reporter notified successfully.": "text",
                                                                    "<< Back to Mod Menu": () => {
                                                                        const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                                                                        if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                                                                        createPondMenu(modMenu);
                                                                    }
                                                                });
                                                            },
                                                            401: (response, data) => {
                                                                terminal.innerHTML = "";
                                                                createTerminalLine("T_pond_invalid_session", config.errorText);
                                                                createEditableTerminalLine(`${config.currentPath}>`);
                                                            },
                                                            403: (response, data) => {
                                                                if(data.type == "recipient_banned"){
                                                                    createTerminalLine("The reporter has been banned, could not send notification.", config.errorText, {translate: false, expire: 5000});
                                                                    return;
                                                                }
                                                                terminal.innerHTML = "";
                                                                createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                                                                createEditableTerminalLine(`${config.currentPath}>`);
                                                            },
                                                            404: (response, data) => {
                                                                terminal.innerHTML = "";
                                                                createTerminalLine(`T_pond_session_forcefully_terminated_additional_notes {{${localize("T_pond_user_not_found")}}}`, config.errorText);
                                                                createEditableTerminalLine(`${config.currentPath}>`);
                                                            },
                                                        });
                                                    }
                                                };

                                                createPondMenu(banMenu);

                                                document.getElementById("pond-input-username").textContent = report.reportedMessage.sender;
                                                
                                                banMenu["Ban"] = oldBanFunction;
                                            },
                                            "Ban Reporter": () => {
                                                const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                                                if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                                                
                                                const oldBanFunction = banMenu["Ban"].bind(banMenu);

                                                banMenu["Ban"] = function(){
                                                    let result = oldBanFunction();
                                                    if(result !== false){
                                                        resolveReport();
                                                        createPondMenu({
                                                            "Reporter banned successfully.": "text",
                                                            "<< Back to Mod Menu": () => {
                                                                const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                                                                if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                                                                createPondMenu(modMenu);
                                                            }
                                                        });
                                                    }
                                                };

                                                createPondMenu(banMenu);

                                                document.getElementById("pond-input-username").textContent = report.reporter;
                                                document.getElementById("pond-input-reason").textContent = `Abuse of report system.`;

                                                banMenu["Ban"] = oldBanFunction;
                                            },
                                            "Warn Sender": () => {
                                                const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                                                if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                                                const oldWarnFunction = warnMenu["Warn"].bind(warnMenu);

                                                warnMenu["Warn"] = function(){
                                                    let result = oldWarnFunction();
                                                    if(result !== false){
                                                        resolveReport();
                                                        createPondMenu({
                                                            "User warned successfully.": "text",
                                                            "<< Back to Mod Menu": () => {
                                                                const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                                                                if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                                                                createPondMenu(modMenu);
                                                            }
                                                        });
                                                    }
                                                };

                                                createPondMenu(warnMenu);

                                                document.getElementById("pond-input-username").textContent = report.reportedMessage.sender;
                                                document.getElementById("pond-input-reason").textContent = `For a message that you sent. Due to the architecture of the system, we cannot provide more specific details, such as the contents of the message.`;
                                                
                                                warnMenu["Warn"] = oldWarnFunction;
                                            },
                                            "Warn Reporter": () => {
                                            },
                                            "Dismiss": () => {
                                                const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                                                if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");

                                                handleRequest("/dismiss-report", {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                        "Session-Token": FroggyFileSystem.getFile(`D:/Pond/secret/${tokenFile}`).getData()[0]
                                                    },
                                                    body: JSON.stringify({
                                                        reportID: report.reportID
                                                    })
                                                }, {
                                                    200: (response, data) => {
                                                        createPondMenu({
                                                            "Report dismissed successfully.": "text",
                                                            "<< Back to Mod Menu": () => {
                                                                const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                                                                if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                                                                createPondMenu(modMenu);
                                                            }
                                                        });
                                                    },
                                                    401: (response, data) => {
                                                        if(data.type == "no_permission"){
                                                            createTerminalLine("T_pond_no_permission_to_resolve_reports", config.errorText, {expire: 5000});
                                                            return;
                                                        }
                                                        terminal.innerHTML = "";
                                                        createTerminalLine("T_pond_invalid_session", config.errorText);
                                                        createEditableTerminalLine(`${config.currentPath}>`);
                                                    },
                                                    403: (response, data) => {
                                                        terminal.innerHTML = "";
                                                        createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                                                        createEditableTerminalLine(`${config.currentPath}>`);
                                                    },
                                                    404: (response, data) => {
                                                        terminal.innerHTML = "";
                                                        createTerminalLine("T_pond_message_not_found", config.errorText, {expire: 5000});
                                                        createEditableTerminalLine(`${config.currentPath}>`);
                                                    }
                                                })
                                            },
                                            ["<< Back to Reports"]: () => {
                                                const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                                                if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.")
                                                createPondMenu(createReportsMenu());
                                            }
                                        };

                                        if(report.resolved){
                                            delete reportMenu["Ban Sender"];
                                            delete reportMenu["Ban Reporter"];
                                            delete reportMenu["Warn Sender"];
                                            delete reportMenu["Warn Reporter"];
                                        }
                                        createPondMenu(reportMenu);
                                    };
                                });

                                reportsMenu["<< Back to Mod Menu"] = () => {
                                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                                    if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                                    createPondMenu(modMenu);
                                };

                                return reportsMenu;
                            }
                            createPondMenu(createReportsMenu());
                        },
                        401: (response, data) => {
                            terminal.innerHTML = "";
                            createTerminalLine("T_pond_invalid_session", config.errorText);
                            createEditableTerminalLine(`${config.currentPath}>`);
                        },
                        403: (response, data) => {
                            if(data.type == "banned"){
                                terminal.innerHTML = "";
                                createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                                createEditableTerminalLine(`${config.currentPath}>`);
                            } else {
                                createTerminalLine("You do not have permission to view reports.", config.errorText, {translate: false, expire: 5000});
                            }
                        },
                        404: (response, data) => {
                            terminal.innerHTML = "";
                            createTerminalLine("T_pond_session_forcefully_terminated", config.errorText);
                            createEditableTerminalLine(`${config.currentPath}>`);
                        }
                    },);
                },
                "<< Back to Main Menu": () => {
                    const error = new Error().stack.split("\n").map(line => line.trim()).some(line => line.startsWith("at <anonymous>"))
                    if(error) throw new Error("Blocked attempt to open Pond from unauthorized context.");
                    createPondMenu(mainMenu);
                }
            }

            createPondMenu(modMenu);
        };
    }
    createPondMenu(mainMenu)
};

function getDecorations(roles){
    let result = " ";
    roles.forEach(role => {
        if(decorations[role]){
            result += decorations[role] + " ";
        }
    });
    return result.trim();
}

const decorations = {
    "admin" : `<span class="tag"        style="color: var(--c12)" >[ADMIN]</span>`,
    "owner" : `<span class="tag"        style="color: #f7a923"  >[OWNER]</span>`,
    "mod"   : `<span class="tag"        style="color: var(--c09)" >[MOD]</span>`,
    "banned": `<span class="tag"        style="color: var(--c08)" >[BANNED]</span>`,
    "spinny": `<span class="tag spinny" style="color: var(--c05)" ></span>`
}