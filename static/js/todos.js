document.getElementById("add-task-btn").addEventListener("click", function() {
    window.location.href = "addTask.html";
});

document.getElementById("sign-out-btn").addEventListener("click", function() {
    fetch("/sign-out", { method: "POST" })
    .then(() => window.location.href = "/index.html");
});

document.getElementById("delete-acc-btn").addEventListener("click", function() {
    const userConfirmed = window.confirm("Are you sure you want to delete your account?");
    if (userConfirmed) {
        fetch("/delete-account", { method: "DELETE" })
        .then(() => window.location.href = "/index.html");
    }
});

document.getElementById("sort-btn").addEventListener("click", sortTodos); 
document.getElementById("overdue-btn").addEventListener("click", overdueTodos);
document.getElementById("all-btn").addEventListener("click", loadTodos);
document.getElementById("in-prog-btn").addEventListener("click", inProgressTodos);
document.getElementById("done-btn").addEventListener("click", doneTodos);

var todoList = [];
var overdueList = [];
var overdueOnly = false;
var doneOnly = false;
var doneList = [];
var inProgressOnly = false;
var inProgressList = [];
var sortOrder = "asc"

function formatTime(time) { 
    let hour = parseInt(time.split(":")[0]);
    if (hour > 12) {
        return hour - 12 + ":" + time.split(":")[1] + " PM"
    }
    if (hour == 12) {
        return hour + ":" + time.split(":")[1] + " PM"
    } else if (hour == 0) {
        hour = 12
    }
    return hour + ":" + time.split(":")[1] + " AM"
}

async function changeStatus(event, todoId) {   
    const checkbox = event.target;
    const status = checkbox.checked ? "Done" : "In Progress";

    try {
        const response = await fetch(`/change-status/${todoId}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status: status })
        });

        if (response.ok) {
            if (doneOnly) {
                await doneTodos();
            } else if (inProgressOnly) {
                await inProgressTodos();
            } else if (overdueOnly) {
                await overdueTodos();
            } else {
                await loadTodos();
            }
        } else {
            console.error("Error changing status:", response.statusText);
        }
    } catch (error) {
        console.error("Error changing status:", error);
    }
}

async function deleteTodo(todoId) {
    try {
        const response = await fetch(`/delete-todo/${todoId}`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            if (doneOnly) {
                await doneTodos();
            } else if (inProgressOnly) {
                await inProgressTodos();
            } else if (overdueOnly) {
                await overdueTodos();
            } else {
                await loadTodos();
            }
        } else {
            console.error("Error deleting todo:", response.statusText);
        }
    } catch (error) {
        console.error("Error deleting todo:", error);
    }
}

function displayTodos(todos) {
    document.getElementById("todo-items").innerHTML = ""; 
        todos.forEach(todo => {
            const todoItem = document.createElement("div");

            const todoCheckbox = document.createElement("input");
            todoCheckbox.type = "checkbox";
            todoCheckbox.checked = todo.status === "Done";
            todoCheckbox.addEventListener("change", (e) => changeStatus(e, todo.id));
            todoItem.appendChild(todoCheckbox);

            const todoName = document.createElement("h3");
            todoName.textContent = todo.name;
            todoItem.appendChild(todoName);

            const todoDay = document.createElement("p");
            const date = new Date(todo.day);
            const formattedDate = date.toLocaleDateString('en-US');
            todoDay.textContent = formattedDate;
            todoItem.appendChild(todoDay);

            const todoTime = document.createElement("p");
            todoTime.textContent = formatTime(todo.time);
            todoItem.appendChild(todoTime);
            
            const todoStatusText = document.createElement("p");
            todoStatusText.textContent = todo.status;
            todoItem.appendChild(todoStatusText);

            const todoDeleteButton = document.createElement("button");
            todoDeleteButton.textContent = "Delete";
            todoDeleteButton.addEventListener("click", () => deleteTodo(todo.id));
            todoItem.appendChild(todoDeleteButton);

            todoItem.classList.add("todo-item");
            document.getElementById("todo-items").appendChild(todoItem);
        });
}

async function sortTodos() {
    const list = overdueOnly ? overdueList : (inProgressOnly ? inProgressList : doneOnly ? doneList : todoList);
    list.sort((a, b) => {
        const dateTimeA = new Date(`${a.day.split("T")[0]}T${a.time}`);
        const dateTimeB = new Date(`${b.day.split("T")[0]}T${b.time}`);

        return sortOrder === "asc" ? dateTimeA - dateTimeB : dateTimeB - dateTimeA;
    });
    sortOrder = sortOrder === "asc" ? "desc" : "asc";  
    displayTodos(list);
}

async function overdueTodos() {
    sortOrder = "asc";
    overdueOnly = true;
    inProgressOnly = false;
    doneOnly = false;
    const today = new Date();
    await getTodos();
    overdueList = todoList.filter(todo => {
        const todoDate = new Date(todo.day);
        return todo.status !== "Done" && todoDate < today;
    });
    displayTodos(overdueList);
}

async function inProgressTodos() {
    sortOrder = "asc";
    overdueOnly = false;
    inProgressOnly = true;
    doneOnly = false;
    await getTodos();
    inProgressList = todoList.filter(todo => todo.status === "In Progress");
    displayTodos(inProgressList);
}

async function doneTodos() {
    sortOrder = "asc";
    doneOnly = true;
    inProgressOnly = false;
    overdueOnly = false;
    await getTodos();
    doneList = todoList.filter(todo => todo.status === "Done");
    displayTodos(doneList);
}

async function getTodos() {
    try {
        const response = await fetch("/todos", {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const todos = await response.json();
        todoList = todos
    } catch (error) {
        console.error("Error fetching todos:", error);
        return [];
    }
}

async function loadTodos() {
    sortOrder = "asc";
    overdueOnly = false;
    doneOnly = false;
    inProgressOnly = false;
    await getTodos();
    displayTodos(todoList);
}

loadTodos();