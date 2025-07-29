// Reference to the login form
const formLogin = document.getElementById("form-login");

// When the form is submitted, prevent default behavior and extract input values
formLogin.addEventListener("submit", function (event) {
    event.preventDefault();
    const intupUsername = formLogin.username.value;
    const intupPassword = formLogin.password.value;
    login(intupUsername, intupPassword);
});

// Async function to handle login logic
async function login(username, password) {
    // Fetch user by username
    let response = await fetch(`http://localhost:3000/users?username=${username}`);
    let data = await response.json();

    // If no user is found
    if (data.length === 0) {
        alert("Incorrect credentials");
    } else {
        const userFound = data[0];

        // Compare passwords
        if (userFound.password === password) {
            // Save user to localStorage
            localStorage.setItem("currentUser", JSON.stringify(userFound));
            alert("Login successful");
            window.location.href = "../views/dashboard.html"; // Redirect to dashboard
        } else {
            alert("Incorrect credentials");
        }
    }
}
