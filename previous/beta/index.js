// Section 1: The Date and Time

function updateDateTime() {
    const now = new Date();

    // Grab the current weekday.
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = daysOfWeek[now.getDay()];  // Grab the live day of the week.

    // zh-CN date system components.
    const year = now.getFullYear(); // Year
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Month
    const day = String(now.getDate()).padStart(2, '0'); // Day
    const hour = String(now.getHours()).padStart(2, '0'); // Hour in 24-hour format
    const minute = String(now.getMinutes()).padStart(2, '0'); // Minutes
    const second = String(now.getSeconds()).padStart(2, '0'); // Seconds

    // Format date in the Chinese "yyyy/mm/dd tt:tt:tt" format.
    const dateString = `${dayOfWeek}. ${year}/${month}/${day} ${hour}:${minute}:${second}`;

    // Update the clock every second.
    document.getElementById('date-time').querySelector('p').textContent = dateString;
}

// Update the time every second.
setInterval(updateDateTime, 1000);
updateDateTime(); // Initial call to display the live date and time.

// Section 2: The terminal itself.

// Function to move the caret to the end of the editable content. This fixes cursor jumping.
function moveCaretToEnd() {
    const cursor = document.getElementById("cursor");
    const range = document.createRange();
    const selection = window.getSelection();
    
    range.selectNodeContents(cursor);
    range.collapse(false);  // Collapse to the end of the content.
    selection.removeAllRanges();
    selection.addRange(range);
}

// This is the commands section.
function handleKeyPress(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent default action (new line).

        const input = document.getElementById("cursor").textContent;

        // Display the user input (F:/Home> <input>) in green.
        displayUserInput(`F:/Home> ${input}`);

        // Clear input after pressing enter.
        document.getElementById("cursor").textContent = "";

        // "Hello" command.
        if (input.toLowerCase() === "hello") {
            displayOutput("Hello, and welcome to froggyOS.");

        // Clears the terminal
        } else if (input.toLowerCase() === "clear") {
            document.getElementById("output").innerHTML = "";
        
        // "Pulse" command.
        } else if (input.toLowerCase() === "pulse") {
            displayOutput("froggyOS is (probably) working as intended.");

        // Help command
        } else if (input.toLowerCase() === "help") {
            displayOutput("* A few basic froggyOS commands *");
            displayOutput("clear - Clears the terminal output.");
            displayOutput("hello - Displays a greeting message.");
            displayOutput("pulse - Tells the user if froggyOS is working.");
            
        // If froggy cannot recognize the command...
        } else {
            displayOutput(`Froggy doesn't know "${input}", sorry.`);
        }

        // Move the cursor to the end after each input
        moveCaretToEnd();
    }
}

// Function to display the user input (F:/Home>) in green
function displayUserInput(input) {
    const outputDiv = document.getElementById("output");
    const outputElement = document.createElement("div");
    const promptElement = document.createElement("span");
    
    promptElement.textContent = "F:/Home> ";
    promptElement.style.color = "#00AA00";  // Set the prompt to a froggy green.
    outputElement.appendChild(promptElement);
    
    const inputText = document.createElement("span");
    inputText.textContent = input.slice("F:/Home> ".length);  // Only the input part (without the prompt).
    inputText.style.color = "#00AA00";
    outputElement.appendChild(inputText);
    
    outputDiv.appendChild(outputElement);
    outputDiv.scrollTop = outputDiv.scrollHeight; // Auto-scroll to the bottom
}

// Function to display output in green (for results)
function displayOutput(output) {
    const outputDiv = document.getElementById("output");
    const outputElement = document.createElement("div");
    outputElement.textContent = output;
    outputElement.style.color = "#00AA00"; // Set text color for command output to a bright red.
    outputDiv.appendChild(outputElement);
    outputDiv.scrollTop = outputDiv.scrollHeight; // Auto-scroll to the bottom
}

// Make sure the cursor is always at the end
document.getElementById("cursor").addEventListener("keydown", handleKeyPress);