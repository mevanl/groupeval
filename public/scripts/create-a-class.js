import { load_page } from "../app.js";

export default function CreatingClass() {
    document.querySelector("#button_submit").addEventListener("click", async function (e) {
        const className = document.querySelector("#txt_className").value.trim();
        const classlable = document.querySelector("#txt_classLabel").value.trim();
        const classSection = document.querySelector("#txt_classSection").value.trim();
        const classTerm = document.querySelector("#txt_classterm").value.trim();
        const studentEmails = document.querySelector("#studentEmails").value.trim();
        const ownerEmail = localStorage.getItem("user_email"); // Get the owner's email from localStorage

        let blnError = false;
        let strMessage = "";

        if (className.length < 1) {
            blnError = true;
            strMessage += "<p class='mb-0 mt-0'>Must Have Class Name.</p>";
        }

        if (classlable.length < 1) {
            blnError = true;
            strMessage += "<p class='mb-0 mt-0'>Class Must Have A Class Code.</p>";
        }

        if (classSection.length < 1) {
            blnError = true;
            strMessage += "<p class='mb-0 mt-0'>Class Must Have A Class Section.</p>";
        }

        if (classTerm.length < 1) {
            blnError = true;
            strMessage += "<p class='mb-0 mt-0'>Class Must Have A Class Term.</p>";
        }

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

        if (blnError) {
            console.log("Validation errors:", strMessage);
            Swal.fire({
                icon: "error",
                html: strMessage,
                text: "Validation Error"
            });
            return;
        }

        // Send the data to the backend
        try {
            const response = await fetch("/api/courses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    course_name: className,
                    owner_email: ownerEmail,
                    class_lable: classlable,
                    class_section: classSection,
                    class_term: classTerm,
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
            } else {
                Swal.fire({
                    icon: "error",
                    text: result.error || "Failed to create class",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                text: "An error occurred while creating the class",
            });
        }
    });

    document.querySelector("#button_cancel").addEventListener("click", () => {
        load_page("/dashboard"); // Navigate back to the dashboard
    });
}