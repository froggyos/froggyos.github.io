// Section 1: The Date and Time
function updateDateTime() {
    const now = new Date();

    // Grab the day of the week (in English).
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = daysOfWeek[now.getDay()];

    // zh-CN date system components.
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');

    // Format the date in the Chinese "yyyy/mm/dd tt:tt:tt" format.
    const dateString = `${dayOfWeek}. ${year}/${month}/${day} ${hour}:${minute}:${second}`;

    // Update the clock every second.
    document.getElementById('date-time').querySelector('p').textContent = dateString;
}

// Display the live date and time.
setInterval(updateDateTime, 1000);
updateDateTime();