import { load_page } from "../app.js";

export default function CreatingClass() {
    document.querySelector("#button_submit").addEventListener("click", async function (e) {
        e.preventDefault(); // Prevent default form submission behavior

        const className = document.querySelector("#txt_className").value.trim();
        const studentEmails = document.querySelector("#studentEmails").value.trim();
        const ownerEmail = localStorage.getItem("user_email"); // Get the owner's email from localStorage
        const token = localStorage.getItem("auth_token"); // Get the auth token from localStorage

        let blnError = false;
        let strMessage = "";

        // Validate class name
        if (className.length < 1) {
            blnError = true;
            strMessage += "<p class='mb-0 mt-0'>Must Have Class Name.</p>";
        }

        // Validate student emails
        if (studentEmails.length < 1) {
            blnError = true;
            strMessage += "<p class='mb-0 mt-0'>You must provide at least one student email.</p>";
        } else {
            const emailArray = studentEmails.split(",").map(email => email.trim());
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            const invalidEmails = emailArray.filter(email => !emailRegex.test(email));
            if (invalidEmails.length > 0) {
                blnError = true;
                strMessage += `<p class='mb-0 mt-0'>Invalid email(s): ${invalidEmails.join(", ")}</p>`;
            }
        }

        // If validation errors exist, show an error message
        if (blnError) {
            console.log("Validation errors:", strMessage);
            Swal.fire({
                icon: "error",
                html: strMessage,
                text: "Validation Error",
            });
            return;
        }

        // Send the data to the backend
        try {
            const response = await fetch("/api/courses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Include the token in the request
                },
                body: JSON.stringify({
                    course_name: className,
                    owner_email: ownerEmail,
                    student_emails: studentEmails,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    text: "Class Created Successfully",
                }).then(() => {
                    load_page("/dashboard"); // Redirect to the dashboard
                });
            } else if (result.invalid_emails && result.invalid_emails.length > 0) {
                // Handle invalid emails returned by the backend
                Swal.fire({
                    icon: "error",
                    html: `<p>Some student emails are invalid or not registered:</p><p>${result.invalid_emails.join(", ")}</p>`,
                });
            } else {
                Swal.fire({
                    icon: "error",
                    text: result.error || "Failed to create class",
                });
            }
        } catch (error) {
            console.error("Error creating class:", error);
            Swal.fire({
                icon: "error",
                text: "An error occurred while creating the class",
            });
        }
    });

    // Handle cancel button click
    document.querySelector("#button_cancel").addEventListener("click", () => {
        load_page("/dashboard"); // Navigate back to the dashboard
    });
}