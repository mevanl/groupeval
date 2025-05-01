import { load_page } from "../app.js";

export default function init() {
    const phoneInput = document.querySelector("#telMobile_Phone_Number");
    const maskOptions = {
        mask: '+{1}(000) 000-0000'
    };
    IMask(phoneInput, maskOptions);

    document.querySelector("#button_submit").addEventListener("click", async function (e) {
        let strUsername = document.querySelector("#txtEmail").value;
        const strPassword = document.querySelector("#txtPassword").value;
        const strConfirm_Password = document.querySelector("#txtConfirm_Password").value;
        const strFirst_Name = document.querySelector("#txtFirst_Name").value;
        const strLast_Name = document.querySelector("#txtLast_Name").value;
        const telPhone = phoneInput.value;
        const strDiscord = document.querySelector("#txtDiscord").value;

        let blnError = false;
        let strMessage = "";

        const emailPattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
        const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;

        if (!emailPattern.test(strUsername)) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Invalid Email Address.</p>';
        }

        if (!passwordPattern.test(strPassword)) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Invalid Password.</p>';
        }

        if (strPassword != strConfirm_Password) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Password and Confirmation Password do not match.</p>';
        }

        if (strFirst_Name.length < 1) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Cannot Leave First Name Blank.</p>';
        }

        if (strLast_Name.length < 1) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Cannot Leave Last Name Blank.</p>';
        }

        const phoneRegex = /^\+1\(\d{3}\) \d{3}-\d{4}$/; // Regex for +1(XXX) XXX-XXXX format
        if (!phoneRegex.test(telPhone)) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Invalid Phone Number Format. Expected format: +1(XXX) XXX-XXXX.</p>';
        }

        if (blnError) {
            Swal.fire({
                icon: "error",
                html: strMessage,
                text: "Validation Error"
            });
        } else {
            // API call to register the user
            try {
                const response = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: strUsername,
                        password: strPassword,
                        first_name: strFirst_Name,
                        last_name: strLast_Name,
                        phone_number: telPhone,
                        discord_username: strDiscord
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    // Save the token and email to localStorage
                    localStorage.setItem("auth_token", result.token);
                    localStorage.setItem("user_email", strUsername);

                    Swal.fire({
                        icon: "success",
                        text: "Registration Confirmed"
                    }).then(() => {
                        load_page("/dashboard"); // Redirect to the dashboard
                    });
                } else {
                    Swal.fire({
                        icon: "error",
                        text: result.error || "Failed to register."
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    text: "An error occurred during registration."
                });
            }
        }
    });

    document.querySelector("#button_login").addEventListener("click", function (event) {
        load_page("/login");
    });
}