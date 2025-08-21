// Function to generate the table from JSON data
function generateTableFromJSON(data, file, num) {
  const container = document.getElementById("table-container");

  const newblock = document.createElement("div");
  newblock.className = file.replace(".json", "");

  const btn = document.createElement("img");
  btn.className = "title-icon";
  btn.src = "../ico/resize.png";

  const title = document.createElement("h2");
  title.textContent = num + ". " + data.title;
  // Add cursor pointer style to the title
  title.style.cursor = "pointer";
  if (data.collapse) {
    title.classList.add("collapsed");
  } else {
    title.classList.add("expanded");
  }

  // Create table element
  const table = document.createElement("table");
  table.style.display = data.collapse ? "none" : "table";

  // add event listener to toggle table visibility
  title.addEventListener("click", function () {
    if (table.style.display === "none") {
      table.style.display = "table";
      this.classList.remove("collapsed");
      this.classList.add("expanded");
    } else {
      table.style.display = "none";
      this.classList.remove("expanded");
      this.classList.add("collapsed");
    }
  });

  // Create table header
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  data.headers.forEach((headerText) => {
    const th = document.createElement("th");
    if (
      headerText === "Finished" ||
      headerText === "Scores" ||
      headerText === "Inspected"
    ) {
      th.className = "checkbox-cell";
    }
    th.textContent = headerText;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement("tbody");

  data.rows.forEach((rowData) => {
    const row = document.createElement("tr");

    // Topic column with link and comment
    const topicCell = document.createElement("td");
    const topicContainer = document.createElement("div");
    topicContainer.className = "topic-container";

    if (rowData.useful_links && rowData.useful_links.length > 0) {
      const topic = document.createElement("p");
      topic.textContent = rowData.topic;
      topicContainer.appendChild(topic);

      const linkList = document.createElement("ol");
      linkList.className = "useful-links";
      rowData.useful_links.forEach((linkData) => {
        const linkElement = document.createElement("a");
        linkElement.href = linkData.url;
        linkElement.textContent = linkData.text;
        linkElement.target = "_blank"; // Open in new tab
        linkElement.rel = "noopener noreferrer"; // Security best practice
        linkList
          .appendChild(document.createElement("li"))
          .appendChild(linkElement);
      });
      topicContainer.appendChild(linkList);

      topicCell.setAttribute("colspan", "7");
      topicCell.appendChild(topicContainer);

      row.appendChild(topicCell);
    } else {
      // Add link
      if (rowData.link) {
        const link = document.createElement("a");
        link.href = rowData.link;
        link.textContent = rowData.topic;
        link.target = "_blank"; // Open in new tab
        link.rel = "noopener noreferrer"; // Security best practice
        topicContainer.appendChild(link);
      } else {
        const topic = document.createElement("p");
        topic.className = "topic-text";
        topic.textContent = rowData.topic;
        topicContainer.appendChild(topic);
      }

      // Add comment icon if there are comments
      if (
        rowData.comment.instructions_text ||
        rowData.comment.instructions ||
        rowData.comment.text ||
        rowData.comment.urls ||
        rowData.comment.tasks
      ) {
        const btn = document.createElement("img");
        btn.className = "comment-icon";
        btn.alt = "Comment";
        btn.src = "./ico/resize.png";

        // Add click event listener to toggle comment visibility
        btn.addEventListener("click", function () {
          const commentDiv = this.nextElementSibling;
          if (commentDiv && commentDiv.classList.contains("comment")) {
            const isOpen = commentDiv.getAttribute("is-open") === "true";
            commentDiv.setAttribute("is-open", !isOpen);
            // commentDiv.style.display = isOpen ? "none" : "block";
          }
        });

        topicContainer.appendChild(btn);
      }

      // Add LMS
      const lmsCell = document.createElement("td");
      lmsCell.className = "lms-cell";
      if (rowData.lms_link && rowData.lms_link.trim() !== "") {
        const lmslink = document.createElement("a");
        lmslink.href = rowData.lms_link;
        lmslink.textContent = "</link>";
        lmslink.target = "_blank"; // Open in new tab
        lmslink.rel = "noopener noreferrer"; // Security best practice
        lmsCell.appendChild(lmslink);
      }

      if (rowData.comment && (rowData.comment.text || rowData.comment.tasks)) {
        const commentDiv = document.createElement("div");
        commentDiv.classList.add("comment");
        commentDiv.setAttribute("is-open", false);

        // Comment text
        if (rowData.comment.text && rowData.comment.text.trim() !== "") {
          const textDiv = document.createElement("div");

          textDiv.classList.add("comment-text");

          // Check if there are instructions in the comment
          if (
            rowData.comment.instructions &&
            rowData.comment.instructions.length > 0
          ) {
            if (
              rowData.comment.instructions_text &&
              rowData.comment.instructions_text.trim() !== ""
            ) {
              txt = document.createElement("p");
              txt.classList.add("comment-text-content");
              txt.textContent = rowData.comment.instructions_text;
              textDiv.appendChild(txt);
            }

            const instructionsList = document.createElement("ul");
            rowData.comment.instructions.forEach((instruction) => {
              const instructionItem = document.createElement("li");
              const instructionLink = document.createElement("a");

              instructionLink.href = instruction.url;
              instructionLink.textContent = instruction.text;
              instructionLink.target = "_blank"; // Open in new tab
              instructionLink.rel = "noopener noreferrer"; // Security best practice
              instructionItem.appendChild(instructionLink);
              instructionsList.appendChild(instructionItem);
            });

            textDiv.appendChild(instructionsList);
          }

          txt = document.createElement("p");
          txt.classList.add("comment-text-content");
          txt.textContent = rowData.comment.text;
          textDiv.appendChild(txt);

          if (rowData.comment.urls && rowData.comment.urls.length > 0) {
            const urlList = document.createElement("ol");
            rowData.comment.urls.forEach((url) => {
              const urlItem = document.createElement("li");
              const urlLink = document.createElement("a");
              urlLink.href = url;
              urlLink.textContent = url;
              urlLink.target = "_blank"; // Open in new tab
              urlLink.rel = "noopener noreferrer"; // Security best practice
              urlItem.appendChild(urlLink);
              urlList.appendChild(urlItem);
            });
            textDiv.appendChild(urlList);
          }

          commentDiv.appendChild(textDiv);
        }

        // Comment tasks
        if (rowData.comment.tasks && rowData.comment.tasks.trim() !== "") {
          const tasksDiv = document.createElement("div");
          tasksDiv.classList.add("comment-tasks");

          // Check if tasks matches the special format "[x], [y,z...]" with any whitespace
          const specialFormatRegex =
            /^\[\s*(\d+)\s*\],\s*\[\s*([\d\s,]+)\s*\]$/;
          const match = rowData.comment.tasks.match(specialFormatRegex);

          if (match) {
            const totalColumns = parseInt(match[1]);
            // Remove all whitespace and split by commas
            const checkedColumns = match[2]
              .replace(/\s/g, "")
              .split(",")
              .map(Number);

            // Create a table for the special format
            const specialTable = document.createElement("table");
            specialTable.className = "comment-tasks-table";

            // Create header row with numbers 1 to totalColumns
            const headerRow = document.createElement("tr");
            for (let i = 1; i <= totalColumns; i++) {
              const th = document.createElement("th");
              th.textContent = i;
              headerRow.appendChild(th);
            }
            specialTable.appendChild(headerRow);

            // Create checkbox row
            const checkboxRow = document.createElement("tr");
            for (let i = 1; i <= totalColumns; i++) {
              const td = document.createElement("td");
              const checkbox = document.createElement("input");
              checkbox.type = "checkbox";
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
      row.appendChild(lmsCell);

      // Done checkbox
      const doneCell = document.createElement("td");
      doneCell.className = "checkbox-cell";
      const doneCheckbox = document.createElement("input");
      doneCheckbox.type = "checkbox";
      doneCheckbox.checked = rowData.done;
      doneCheckbox.readOnly = true;
      doneCell.appendChild(doneCheckbox);
      row.appendChild(doneCell);

      // Score checkbox
      const scoreCell = document.createElement("td");
      if (rowData.score) {
        scoreCell.className = "checkbox-cell";
        const scoreCheckbox = document.createElement("input");
        scoreCheckbox.type = "checkbox";
        scoreCheckbox.checked = rowData.score;
        scoreCheckbox.readOnly = true;
        scoreCell.appendChild(scoreCheckbox);
      }
      row.appendChild(scoreCell);

      // Deadline
      const deadlineCell = document.createElement("td");
      deadlineCell.className = "deadline";
      deadlineCell.textContent = rowData.deadline;
      row.appendChild(deadlineCell);

      // Time left
      const timeLeftCell = document.createElement("td");
      timeLeftCell.className = "time-left";
      row.appendChild(timeLeftCell);

      // Verified checkbox
      const verifiedCell = document.createElement("td");
      verifiedCell.className = "checkbox-cell";
      verifiedCell.classList.add("verified-cell");
      const verifiedCheckbox = document.createElement("input");
      verifiedCheckbox.type = "checkbox";
      verifiedCheckbox.checked = rowData.verified;
      verifiedCheckbox.readOnly = true;
      verifiedCell.appendChild(verifiedCheckbox);
      row.appendChild(verifiedCell);
    }

    tbody.appendChild(row);
  });

  table.appendChild(tbody);

  newblock.appendChild(btn);
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
  const deadlineCells = document.querySelectorAll(".deadline");
  const timeLeftCells = document.querySelectorAll(".time-left");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function updateTimeLeft() {
    const now = new Date();

    deadlineCells.forEach((cell, index) => {
      const dateParts = cell.textContent.split(".");
      const deadlineDate = new Date(
        dateParts[2],
        dateParts[1] - 1,
        dateParts[0]
      );
      deadlineDate.setHours(23, 59, 59, 999);

      const timeDiff = deadlineDate.getTime() - now.getTime();
      const verifiedCheckbox = cell
        .closest("tr")
        .querySelector('.verified-cell input[type="checkbox"]');

      if (verifiedCheckbox.checked) {
        timeLeftCells[index].innerHTML =
          '<span style="color: green; font-weight: bold; font-size: 16px;">✓</span>';
        return;
      }

      if (timeDiff <= 0) {
        timeLeftCells[index].textContent = "Deadline passed";
        cell.classList.add("deadline-close");
        return;
      }

      const weeksDiff = Math.floor(timeDiff / (1000 * 3600 * 24) / 7);
      const totalDays = Math.floor(timeDiff / (1000 * 3600 * 24));
      const daysDiff = totalDays % 7;
      const hoursDiff = Math.floor(
        (timeDiff % (1000 * 3600 * 24)) / (1000 * 3600)
      );
      const minutesDiff = Math.floor((timeDiff % (1000 * 3600)) / (1000 * 60));

      const formattedHours = String(hoursDiff).padStart(2, "0");
      const formattedMinutes = String(minutesDiff).padStart(2, "0");

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
        cell.classList.add("deadline-close");
      } else {
        cell.classList.remove("deadline-close");
      }
    });
  }

  updateTimeLeft();
  setInterval(updateTimeLeft, 60000);
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("./data/file-list.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((fileList) => {
      // Проверяем, что fileList является массивом
      if (!Array.isArray(fileList)) {
        throw new Error("File list is not an array");
      }
      let num = fileList.length;

      // Для каждого файла в списке выполняем запрос
      const fetchPromises = fileList.map((file) => {
        return fetch(`./data/${file}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Network response for file ${file} was not ok`);
            }
            return response.json();
          })
          .then((data) => {
            console.log(
              `Loaded data from file: ${file}`,
              data.title,
              data.rows.length
            );
            generateTableFromJSON(data, file, num--);
          })
          .catch((error) => {
            console.error(`Error loading JSON data from file ${file}:`, error);
            // Можно добавить обработку ошибок для каждого файла
            // return Promise.resolve(); // Продолжаем выполнение для других файлов
          });
      });

      return Promise.all(fetchPromises);
    })
    .catch((error) => {
      console.error("Error loading file list:", error);
      document.getElementById("table-container").textContent =
        "Error loading data. Please try again later.";
    });
});
