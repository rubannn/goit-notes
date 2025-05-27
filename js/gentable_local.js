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
        if (rowData.comment && (rowData.comment.text || rowData.comment.tasks)) {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            commentDiv.style.display = 'flex'; // Располагаем элементы в одной строке
            commentDiv.style.gap = '10px'; // Добавляем отступ между элементами
            commentDiv.style.width = '100%'; // Занимает всю доступную ширину

            // Text comment
            if (rowData.comment.text && rowData.comment.text.trim() !== '') {
                const textDiv = document.createElement('div');
                textDiv.style.flex = '1'; // Занимает 50% ширины
                textDiv.style.minWidth = '0'; // Для правильного сжатия текста
                textDiv.textContent = rowData.comment.text;
                commentDiv.appendChild(textDiv);
            }

            // Tasks comment
            if (rowData.comment.tasks && rowData.comment.tasks.trim() !== '') {
                const tasksDiv = document.createElement('div');
                tasksDiv.style.flex = '1'; // Занимает 50% ширины
                tasksDiv.style.minWidth = '0'; // Для правильного сжатия содержимого

                // Check if tasks matches the special format "[x], [y,z...]" with any whitespace
                const specialFormatRegex = /^\[\s*(\d+)\s*\],\s*\[\s*([\d\s,]+)\s*\]$/;
                const match = rowData.comment.tasks.match(specialFormatRegex);

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

                    tasksDiv.appendChild(specialTable);
                } else {
                    // Regular tasks content
                    tasksDiv.textContent = rowData.comment.tasks;
                }

                commentDiv.appendChild(tasksDiv);
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

data = {
    "title": "Basic Algorithms and Data Structures",
    "headers": [
        "Тема",
        "Зроблено",
        "Бали",
        "Дедлайн",
        "Залишилось",
        "Перевірено"
    ],
    "rows": [
        {
            "topic": "Тема 2. Основні структури даних",
            "link": "https://github.com/rubannn/goit-algo-hw-02",
            "done": true,
            "score": false,
            "deadline": "26.05.2025",
            "verified": true,
            "comment": ""
        },
        {
            "topic": "Тема 3. Рекурсивні функції, алгоритми та приклади їх застосування",
            "link": "https://github.com/rubannn/goit-algo-hw-03",
            "done": true,
            "score": false,
            "deadline": "02.06.2025",
            "verified": true,
            "comment": ""
        },
        {
            "topic": "Тема 4. Алгоритми сортування",
            "link": "https://github.com/rubannn/goit-algo-hw-04",
            "done": true,
            "score": false,
            "deadline": "02.06.2025",
            "verified": true,
            "comment": ""
        },
        {
            "topic": "Тема 5. Алгоритми пошуку",
            "link": "https://github.com/rubannn/goit-algo-hw-05",
            "done": true,
            "score": false,
            "deadline": "09.06.2025",
            "verified": true,
            "comment": ""
        },
        {
            "topic": "Тема 6. Графи",
            "link": "https://github.com/rubannn/goit-algo-hw-06",
            "done": true,
            "score": false,
            "deadline": "09.06.2025",
            "verified": true,
            "comment": ""
        },
        {
            "topic": "Тема 7. Дерева та балансування",
            "link": "https://github.com/rubannn/goit-algo-hw-07",
            "done": true,
            "score": true,
            "deadline": "16.06.2025",
            "verified": true,
            "comment": ""
        },
        {
            "topic": "Тема 8. Купи",
            "link": "https://github.com/rubannn/goit-algo-hw-08",
            "done": true,
            "score": false,
            "deadline": "16.06.2025",
            "verified": false,
            "comment": ""
        },
        {
            "topic": "Тема 9. Жадібні алгоритми та динамічне програмування",
            "link": "https://github.com/rubannn/goit-algo-hw-09",
            "done": true,
            "score": false,
            "deadline": "22.06.2025",
            "verified": true,
            "comment": ""
        },
        {
            "topic": "Тема 10. Лінійне програмування та рандомізовані алгоритми",
            "link": "https://github.com/rubannn/goit-algo-hw-10",
            "done": true,
            "score": false,
            "deadline": "22.06.2025",
            "verified": false,
            "comment": {"text":"Подумати про заміну функції в завданні 2", "tasks": "[2], [1]"}
        },
        {
            "topic": "Фінальний проєкт",
            "link": "https://github.com/rubannn/goit-algo-final",
            "done": false,
            "score": true,
            "deadline": "22.06.2025",
            "verified": false,
            "comment": {"text": "", "tasks": "[7], [1, 2, 4, 5, 6, 3]"}
        },
        {
            "topic": "Наукова публікація 1",
            "link": "",
            "done": true,
            "score": false,
            "deadline": "26.05.2025",
            "verified": true,
            "comment": ""
        },
        {
            "topic": "Наукова публікація 2",
            "link": "",
            "done": true,
            "score": false,
            "deadline": "16.06.2025",
            "verified": true,
            "comment": ""
        }
    ]
}


document.addEventListener('DOMContentLoaded', function () {
    // Используем локальную переменную data вместо загрузки из файлов
    try {
        generateTableFromJSON(data, "local-data.json");
    } catch (error) {
        console.error('Error processing local data:', error);
        document.getElementById('table-container').textContent = 'Error processing data.';
    }
});
