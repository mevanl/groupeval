import { load_page } from "../app.js";

export default function init() {
    document.querySelector("#button_submit").addEventListener("click", async function (e) {
        const emailPattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
        const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;

        const string_username = document.querySelector("#txt_Login_Email").value;
        const string_password = document.querySelector("#txt_Login_Password").value;

        let blnError = false;
        let strMessage = "";

        if (!emailPattern.test(string_username)) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Invalid Email Address.</p>';
        }

        if (!passwordPattern.test(string_password)) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Invalid Password.</p>';
        }

        if (blnError) {
            Swal.fire({
                icon: "error",
                html: strMessage,
                text: "Validation Error"
            });
        } else {
            // API call to log in the user
            try {
                const response = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: string_username,
                        password: string_password
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    // Save the token and email to localStorage
                    localStorage.setItem("auth_token", result.token);
                    localStorage.setItem("user_email", string_username);

                    Swal.fire({
                        icon: "success",
                        text: "Login Confirmed"
                    }).then(() => {
                        load_page("/dashboard"); // Redirect to the dashboard
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        text: result.error || "Failed to log in."
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    text: "An error occurred during login."
                });
            }
        }
    });

    document.querySelector("#button_register").addEventListener("click", function (event) {
        load_page("/register");
    });
}