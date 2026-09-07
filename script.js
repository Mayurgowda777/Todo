const API_URL = "http://localhost:3000/tasks";

// Get HTML elements
const taskInput = document.getElementById("taskInput");
const deadlineInput = document.getElementById("deadlineInput");
const priorityInput = document.getElementById("priorityInput");
const statusInput = document.getElementById("statusInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");

// Load tasks when the page opens
loadTasks();

// LOAD TASKS

async function loadTasks() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Could not load tasks");
        }

        const tasks = await response.json();

        displayTasks(tasks);

    } catch (error) {

        console.error(error);

        taskList.innerHTML = `
            <li class="task-item">
                <strong>Unable to load tasks.</strong>
                <br>
                Make sure JSON Server is running.
            </li>
        `;
    }
}

// DISPLAY TASKS

function displayTasks(tasks) {

    taskList.innerHTML = "";

    if (tasks.length === 0) {

        taskList.innerHTML = `
            <li class="task-item">
                No tasks available.
            </li>
        `;

        return;
    }

    tasks.forEach(function(task) {

        // Main task container
        const listItem = document.createElement("li");

        listItem.className = "task-item";

        // TASK TITLE

        const title = document.createElement("div");

        title.className = "task-title";

        title.textContent = task.title;

        // TASK DETAILS

        const details = document.createElement("div");

        details.className = "task-details";

        details.innerHTML = `
            <span>
                📅 Deadline: ${task.deadline || "No deadline"}
            </span>

            <span>
                ⭐️ Priority: ${getPriorityText(task.priority)}
            </span>

            <span>
                🔄 Status: ${task.status}
            </span>
        `;

        // ACTION BUTTONS

        const actions = document.createElement("div");

        actions.className = "task-actions";

        // Edit button
        const editButton = document.createElement("button");

        editButton.className = "edit-button";

        editButton.textContent = "Edit";

        editButton.addEventListener("click", function() {

            editTask(task);

        });

        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-button";

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {

            deleteTask(task.id);

        });

        // Status button
        const statusButton = document.createElement("button");

        statusButton.className = "status-button";

        statusButton.textContent = "Next Status";

        statusButton.addEventListener("click", function() {

            changeStatus(task);

        });

        // Add buttons
        actions.appendChild(editButton);

        actions.appendChild(statusButton);

        actions.appendChild(deleteButton);

        // ADD EVERYTHING TO TASK

        listItem.appendChild(title);

        listItem.appendChild(details);

        listItem.appendChild(actions);

        taskList.appendChild(listItem);

    });
}

// PRIORITY TEXT

function getPriorityText(priority) {

    if (Number(priority) === 1) {
        return "1 - High";
    }

    if (Number(priority) === 2) {
        return "2 - Medium";
    }

    if (Number(priority) === 3) {
        return "3 - Low";
    }

    return priority;
}

// ==========================================
// ADD TASK
// ==========================================

addButton.addEventListener("click", addTask);

async function addTask() {

    const title = taskInput.value.trim();

    const deadline = deadlineInput.value;

    const priority = Number(priorityInput.value);

    const status = statusInput.value;

    // Validate task
    if (title === "") {

        alert("Please enter a task!");

        taskInput.focus();

        return;
    }

    // Create new task
    const newTask = {

        title: title,

        deadline: deadline,

        priority: priority,

        status: status

    };

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(newTask)

        });

        if (!response.ok) {

            throw new Error("Could not add task");

        }

        // Clear form
        taskInput.value = "";

        deadlineInput.value = "";

        priorityInput.value = "1";

        statusInput.value = "Pending";

        // Reload tasks
        loadTasks();

    } catch (error) {

        console.error(error);

        alert("Could not add task.");

    }
}

// ==========================================
// DELETE TASK
// ==========================================

async function deleteTask(taskId) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/${taskId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {

            throw new Error("Could not delete task");

        }

        loadTasks();

    } catch (error) {

        console.error(error);

        alert("Could not delete task.");

    }
}

// EDIT TASK

async function editTask(task) {

    const newTitle = prompt(
        "Edit task:",
        task.title
    );

    // User cancelled
    if (newTitle === null) {
        return;
    }

    const title = newTitle.trim();

    if (title === "") {

        alert("Task cannot be empty.");

        return;
    }

    const newDeadline = prompt(
        "Edit deadline (YYYY-MM-DD):",
        task.deadline || ""
    );

    if (newDeadline === null) {
        return;
    }

    const newPriority = prompt(
        "Edit priority: 1 = High, 2 = Medium, 3 = Low",
        task.priority
    );

    if (newPriority === null) {
        return;
    }

    const priority = Number(newPriority);

    if (![1, 2, 3].includes(priority)) {

        alert("Priority must be 1, 2, or 3.");

        return;
    }

    const updatedTask = {

        title: title,

        deadline: newDeadline,

        priority: priority,

        status: task.status

    };
    try {

        const response = await fetch(
            `${API_URL}/${task.id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(updatedTask)
            }
        );
        if (!response.ok) {

            throw new Error("Could not edit task");

        }
        loadTasks();

    } catch (error) {

        console.error(error);

        alert("Could not edit task.");

    }
}

// CHANGE STATUS

async function changeStatus(task) {

    let newStatus;

    if (task.status === "Pending") {

        newStatus = "In Progress";

    } else if (task.status === "In Progress") {

        newStatus = "Completed";

    } else {

        newStatus = "Pending";

    }

    const updatedTask = {

        title: task.title,

        deadline: task.deadline,

        priority: task.priority,

        status: newStatus

    };

    try {

        const response = await fetch(
            `${API_URL}/${task.id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(updatedTask)
            }
        );

        if (!response.ok) {

            throw new Error("Could not update status");

        }

        loadTasks();

    } catch (error) {

        console.error(error);

        alert("Could not update status.");

    }
}