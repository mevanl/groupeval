import { load_page } from "../app.js";

export default function JoinGroup() {
    document.querySelector("#button_submit").addEventListener("click", async function (e) {
        e.preventDefault();

        const groupUuid = document.querySelector("#txt_join_grouptCode").value.trim();
        const token = localStorage.getItem("auth_token");
        const userEmail = localStorage.getItem("user_email"); // Use email instead of UUID

        console.log("Group UUID:", groupUuid); // Debugging log
        console.log("User Email:", userEmail); // Debugging log

        if (!groupUuid) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Please enter the group code.",
            });
            return;
        }

        if (!userEmail) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "User email is missing. Please log in again.",
            });
            return;
        }

        try {
            const response = await fetch(`/api/groups/${groupUuid}/members`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user_email: userEmail, // Send the user email
                }),
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "You have successfully joined the group!",
                }).then(() => {
                    load_page("/class_student_view");
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: result.error || "Failed to join the group.",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "An error occurred while trying to join the group.",
            });
        }
    });

    // Cancel button to go back to the student view
    document.querySelector("#button_cancel").addEventListener("click", () => {
        load_page("/class_student_view");
    });
}