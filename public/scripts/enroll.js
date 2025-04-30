import { load_page } from "../app.js";

export default function EnrollingClass() {
    document.querySelector("#button_submit").addEventListener("click", async function () {
        const txt_Code = document.querySelector("#txt_enrollmentCode").value.trim();
        const userEmail = localStorage.getItem("user_email"); // Get the user's email from localStorage
        const token = localStorage.getItem("auth_token"); // Get the auth token from localStorage
        let blnError = false;
        let strMessage = "";

        // Validate the enrollment code
        if (txt_Code.length !== 36) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">The Code Must Be From Your Teacher.</p>';
        }

        if (blnError) {
            Swal.fire({
                icon: "error",
                html: strMessage,
                text: "Validation Error",
            });
            return;
        }

        // Send the enrollment request to the backend
        try {
            const response = await fetch(`/api/courses/${txt_Code}/enroll`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Include the token in the request
                },
                body: JSON.stringify({
                    user_email: userEmail,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    text: "You have been successfully enrolled in the class!",
                }).then(() => {
                    load_page("/dashboard"); // Redirect to the dashboard
                });
            } else {
                Swal.fire({
                    icon: "error",
                    text: result.error || "Failed to enroll in the class",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                text: "An error occurred while enrolling in the class",
            });
        }
    });

    document.querySelector("#button_cancel").addEventListener("click", () => {
        load_page("/dashboard"); // Navigate back to the dashboard
    });
}