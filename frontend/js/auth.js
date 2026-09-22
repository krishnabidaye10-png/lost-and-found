
// ===============================
// REGISTER
// ===============================

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;


            const message =
                document.getElementById(
                    "registerMessage"
                );


            // Check passwords

            if (password !== confirmPassword) {

                message.textContent =
                    "Passwords do not match.";

                return;
            }


            try {

                const response =
                    await fetch(
                        "/api/auth/register",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name,
                                email,
                                password,
                                confirmPassword

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Registration failed.";

                    return;
                }


                message.textContent =
                    "Registration successful! Redirecting to login...";


                setTimeout(() => {

                    window.location.href =
                        "login.html";

                }, 1500);


            } catch (error) {

                console.error(error);

                message.textContent =
                    "Unable to connect to the server.";

            }

        }
    );

}


// ===============================
// LOGIN
// ===============================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const message =
                document.getElementById(
                    "loginMessage"
                );


            try {

                const response =
                    await fetch(
                        "/api/auth/login",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                email,
                                password

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Login failed.";

                    return;
                }


                // Save JWT

                localStorage.setItem(
                    "token",
                    data.token
                );


                // Save user information

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );


                message.textContent =
                    "Login successful! Redirecting...";


                setTimeout(() => {

    const redirect =
        localStorage.getItem(
            "redirectAfterLogin"
        );


    // Remove saved destination
    localStorage.removeItem(
        "redirectAfterLogin"
    );


    // Go to requested page
    if (redirect) {

        window.location.href =
            redirect;

    } else {

        window.location.href =
            "index.html";

    }

}, 1000);


            } catch (error) {

                console.error(error);

                message.textContent =
                    "Unable to connect to the server.";

            }

        }
    );

}


// ===============================
// AUTH AREA
// ===============================

function updateAuthArea() {

    const authArea =
        document.getElementById(
            "authArea"
        );


    // Page doesn't have auth area

    if (!authArea) {
        return;
    }


    const token =
        localStorage.getItem("token");


    // ===============================
    // LOGGED IN
    // ===============================

    if (token) {

        authArea.innerHTML = `

            <button
                id="logoutButton"
                class="auth-button logout-button"
            >
                Logout
            </button>

        `;


        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        logoutButton.addEventListener(
            "click",
            () => {

                // Remove login information

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );


                // Go to home page

                window.location.href =
                    "index.html";

            }
        );


        return;
    }


    // ===============================
    // LOGGED OUT
    // ===============================

    authArea.innerHTML = `

        <a
            href="login.html"
            class="auth-button"
        >
            Login
        </a>

        <a
            href="register.html"
            class="auth-button"
        >
            Register
        </a>

    `;

}


// Update authentication buttons

// ===============================
// PROTECT LINKS
// ===============================

const protectedLinks =
    document.querySelectorAll(".protected-link");


protectedLinks.forEach((link) => {

    link.addEventListener("click", (event) => {

        const token =
            localStorage.getItem("token");


        // User is logged in
        if (token) {
            return;
        }


        // User is not logged in
        event.preventDefault();


        const destination =
            link.getAttribute("href");


        localStorage.setItem(
            "redirectAfterLogin",
            destination
        );


        window.location.href =
            "login.html";

    });

});


// ===============================
// UPDATE AUTH AREA
// ===============================

updateAuthArea();