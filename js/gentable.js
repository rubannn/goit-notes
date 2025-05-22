// Function to generate the table from JSON data
function generateTableFromJSON(data) {
    const container = document.getElementById('table-container');

    const title = document.createElement('h2');
    title.textContent = data.title;

    // Create table element
    const table = document.createElement('table');

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    data.headers.forEach(headerText => {
        const th = document.createElement('th');
        if (headerText === 'Зроблено' || headerText === 'Бали' || headerText === 'Перевірено') {
            th.className = 'checkbox-cell';
        }
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');

    data.rows.forEach(rowData => {
        const row = document.createElement('tr');

        // Topic column with link and comment
        const topicCell = document.createElement('td');
        const topicContainer = document.createElement('div');

        // Add link
        const link = document.createElement('a');
        link.href = rowData.link;
        link.textContent = rowData.topic;
        topicContainer.appendChild(link);

        // Add comment if exists
        if (rowData.comment && rowData.comment.trim() !== '') {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            commentDiv.textContent = rowData.comment;
            topicContainer.appendChild(commentDiv);
        }

        topicCell.appendChild(topicContainer);
        row.appendChild(topicCell);

        // Done checkbox
        const doneCell = document.createElement('td');
        doneCell.className = 'checkbox-cell';
        const doneCheckbox = document.createElement('input');
        doneCheckbox.type = 'checkbox';
        doneCheckbox.checked = rowData.done;
        doneCheckbox.readOnly = true;
        doneCell.appendChild(doneCheckbox);
        row.appendChild(doneCell);

        // Score checkbox
        const scoreCell = document.createElement('td');
        scoreCell.className = 'checkbox-cell';
        const scoreCheckbox = document.createElement('input');
        scoreCheckbox.type = 'checkbox';
        scoreCheckbox.checked = rowData.score;
        scoreCheckbox.readOnly = true;
        scoreCell.appendChild(scoreCheckbox);
        row.appendChild(scoreCell);

        // Deadline
        const deadlineCell = document.createElement('td');
        deadlineCell.className = 'deadline';
        deadlineCell.textContent = rowData.deadline;
        row.appendChild(deadlineCell);

        // Time left
        const timeLeftCell = document.createElement('td');
        timeLeftCell.className = 'time-left';
        row.appendChild(timeLeftCell);

        // Verified checkbox
        const verifiedCell = document.createElement('td');
        verifiedCell.className = 'checkbox-cell';
        const verifiedCheckbox = document.createElement('input');
        verifiedCheckbox.type = 'checkbox';
        verifiedCheckbox.checked = rowData.verified;
        verifiedCheckbox.readOnly = true;
        verifiedCell.appendChild(verifiedCheckbox);
        row.appendChild(verifiedCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(title);
    container.appendChild(table);

    // Initialize the time left functionality
    initializeTimeLeft();
}

// Function to initialize the time left counters
function initializeTimeLeft() {
    const deadlineCells = document.querySelectorAll('.deadline');
    const timeLeftCells = document.querySelectorAll('.time-left');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    function updateTimeLeft() {
        const now = new Date();

        deadlineCells.forEach((cell, index) => {
            const dateParts = cell.textContent.split('.');
            const deadlineDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
            deadlineDate.setHours(23, 59, 59, 999);

            const timeDiff = deadlineDate.getTime() - now.getTime();
            const verifiedCheckbox = cell.parentElement.querySelector('td:nth-child(6) input[type="checkbox"]');

            if (verifiedCheckbox.checked) {
                timeLeftCells[index].textContent = "Ok";
                return;
            }

            if (timeDiff <= 0) {
                timeLeftCells[index].textContent = "Deadline passed";
                cell.classList.add('deadline-close');
                return;
            }

            const weeksDiff = Math.floor(timeDiff / (1000 * 3600 * 24) / 7);
            const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24));
            const daysDiff = totalDays % 7;
            const hoursDiff = Math.floor((timeDiff % (1000 * 3600 * 24)) / (1000 * 3600));
            const minutesDiff = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));

            const formattedHours = String(hoursDiff).padStart(2, '0');
            const formattedMinutes = String(minutesDiff).padStart(2, '0');

            let timeLeftStr = "";
            if (weeksDiff > 0) {
                timeLeftStr += `${weeksDiff}w `;
            }
            if (daysDiff > 0 || weeksDiff === 0) {
                timeLeftStr += `${daysDiff}d `;
            }
            timeLeftStr += `${formattedHours}:${formattedMinutes}`;

            timeLeftCells[index].textContent = timeLeftStr.trim();

            if (totalDays < 7 && daysDiff >= 0) {
                cell.classList.add('deadline-close');
            } else {
                cell.classList.remove('deadline-close');
            }
        });
    }

    updateTimeLeft();
    setInterval(updateTimeLeft, 60000);
}

// Generate the table when the page loads
// document.addEventListener('DOMContentLoaded', function () {
//     generateTableFromJSON(tableData);
// });


document.addEventListener('DOMContentLoaded', function () {
    fetch('./data/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            generateTableFromJSON(data);
        })
        .catch(error => {
            console.error('Error loading JSON data:', error);
            document.getElementById('table-container').textContent = 'Error loading data. Please try again later.';
        });
});
