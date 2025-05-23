// Function to generate the table from JSON data
function generateTableFromJSON(data, file) {
    const container = document.getElementById('table-container');

    const newblock = document.createElement('div');
    newblock.className = file.replace('.json', '');

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
        link.target = '_blank'; // Open in new tab
        link.rel = 'noopener noreferrer'; // Security best practice
        topicContainer.appendChild(link);

        // Add comment if exists
        if (rowData.comment && rowData.comment.trim() !== '') {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';

            // Check if comment matches the special format "[x], [y,z...]" with any whitespace
            const specialFormatRegex = /^\[\s*(\d+)\s*\],\s*\[\s*([\d\s,]+)\s*\]$/;
            const match = rowData.comment.match(specialFormatRegex);

            if (match) {
                const totalColumns = parseInt(match[1]);
                // Remove all whitespace and split by commas
                const checkedColumns = match[2].replace(/\s/g, '').split(',').map(Number);

                // Create a table for the special format
                const specialTable = document.createElement('table');
                specialTable.className = 'comment-table';

                // Create header row with numbers 1 to totalColumns
                const headerRow = document.createElement('tr');
                for (let i = 1; i <= totalColumns; i++) {
                    const th = document.createElement('th');
                    th.textContent = i;
                    headerRow.appendChild(th);
                }
                specialTable.appendChild(headerRow);

                // Create checkbox row
                const checkboxRow = document.createElement('tr');
                for (let i = 1; i <= totalColumns; i++) {
                    const td = document.createElement('td');
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.checked = checkedColumns.includes(i);
                    checkbox.readOnly = true;
                    td.appendChild(checkbox);
                    checkboxRow.appendChild(td);
                }
                specialTable.appendChild(checkboxRow);

                commentDiv.appendChild(specialTable);
            } else {
                // Regular comment content
                commentDiv.innerHTML = rowData.comment;
            }
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
        verifiedCell.classList.add('verified-cell');
        const verifiedCheckbox = document.createElement('input');
        verifiedCheckbox.type = 'checkbox';
        verifiedCheckbox.checked = rowData.verified;
        verifiedCheckbox.readOnly = true;
        verifiedCell.appendChild(verifiedCheckbox);
        row.appendChild(verifiedCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);

    newblock.appendChild(title);
    newblock.appendChild(table);
    container.appendChild(newblock);

    // container.appendChild(title);
    // container.appendChild(table);

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
            const verifiedCheckbox = cell.closest('tr').querySelector('.verified-cell input[type="checkbox"]');

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



// document.addEventListener('DOMContentLoaded', function () {
//     fetch('./data/file-list.json')
//         .then(response => response.json());

//     fetch('./data/${file}')
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(data => {
//             generateTableFromJSON(data);
//         })
//         .catch(error => {
//             console.error('Error loading JSON data:', error);
//             document.getElementById('table-container').textContent = 'Error loading data. Please try again later.';
//         });
// });


document.addEventListener('DOMContentLoaded', function () {
    fetch('./data/file-list.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(fileList => {
            // Проверяем, что fileList является массивом
            if (!Array.isArray(fileList)) {
                throw new Error('File list is not an array');
            }

            // Для каждого файла в списке выполняем запрос
            const fetchPromises = fileList.map(file => {
                return fetch(`./data/${file}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Network response for file ${file} was not ok`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log(`Loaded data from file: ${file}`, data.title, data.rows.length);
                        generateTableFromJSON(data, file);
                    })
                    .catch(error => {
                        console.error(`Error loading JSON data from file ${file}:`, error);
                        // Можно добавить обработку ошибок для каждого файла
                        return Promise.resolve(); // Продолжаем выполнение для других файлов
                    });
            });

            return Promise.all(fetchPromises);
        })
        .catch(error => {
            console.error('Error loading file list:', error);
            document.getElementById('table-container').textContent = 'Error loading data. Please try again later.';
        });
});
