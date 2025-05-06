document.getElementById("sign-up-btn").addEventListener("click", function() {
    document.getElementById("log-in-div").style.display = "none";
    document.getElementById("sign-up-div").style.display = "block";
});

document.getElementById("log-in-btn").addEventListener("click", function() {
    document.getElementById("sign-up-div").style.display = "none";
    document.getElementById("log-in-div").style.display = "block";
});

document.getElementById("sign-up").addEventListener("submit", async function (e) {
    e.preventDefault(); 

    const username = document.getElementById("sign-up-username").value;
    const password = document.getElementById("sign-up-password").value;

    const response = await fetch("/sign-up", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ username, password })
    });

    if (response.status === 500) {
        const errorElement = document.getElementById("error");
        const errorMessage = await response.text();
        errorElement.style.display = "block";
        errorElement.textContent = errorMessage;
        setTimeout(() => {
            errorElement.style.display = "none";
        }, 3000);
    } else if (response.ok) {
        window.location.href = "/todos.html";
    }
});

document.getElementById("log-in").addEventListener("submit", async function (e) {
    e.preventDefault(); 

    const username = document.getElementById("log-in-username").value;
    const password = document.getElementById("log-in-password").value;

    const response = await fetch("/log-in", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ username, password })
    });

    if (response.status === 401) {
        const errorElement = document.getElementById("error");
        const errorMessage = await response.text();
        errorElement.style.display = "block";
        errorElement.textContent = errorMessage;
        setTimeout(() => {
            errorElement.style.display = "none";
        }, 3000);
    } else if (response.ok) {
        window.location.href = "/todos.html";
    }
});
