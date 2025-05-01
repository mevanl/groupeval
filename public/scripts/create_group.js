import { load_page } from "../app.js";

export default async function CreateGroup() {
    const courseUuid = localStorage.getItem("selected_course_uuid");

    if (!courseUuid) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "No class selected. Please go back to the dashboard and select a class.",
        }).then(() => {
            load_page("/dashboard");
        });
        return;
    }

    // Fetch and populate students
    async function loadStudents() {
        try {
            const response = await fetch(`/api/courses/${courseUuid}/students`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
            });
            const result = await response.json();

            if (response.ok) {
                const studentsList = document.querySelector("#studentsList");
                studentsList.innerHTML = "";
                result.students.forEach((student) => {
                    const studentCheckbox = document.createElement("div");
                    studentCheckbox.classList.add("form-check");
                    studentCheckbox.innerHTML = `
                        <input class="form-check-input" type="checkbox" value="${student.email}" id="student-${student.email}">
                        <label class="form-check-label" for="student-${student.email}">
                            ${student.firstname} ${student.lastname}
                        </label>
                    `;
                    studentsList.appendChild(studentCheckbox);
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: result.error || "Failed to load students.",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "An error occurred while fetching students.",
            });
        }
    }
    loadStudents();

    // Handle group creation
    document.querySelector("#createGroupForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const groupName = document.querySelector("#groupName").value.trim();
        const selectedStudents = Array.from(document.querySelectorAll("#studentsList input:checked")).map(
            (checkbox) => checkbox.value
        );

        let blnError = false;
        let strMessage = "";

        if (!groupName) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Cannot Leave Group Name Blank.</p>';
        }
        if (selectedStudents.length === 0) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">You must select at least one student.</p>';
        }

        if (blnError) {
            Swal.fire({
                icon: "error",
                html: strMessage,
                title: "Validation Error",
            });
            return;
        }

        try {
            const response = await fetch(`/api/courses/${courseUuid}/groups`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify({ group_name: groupName, students: selectedStudents }),
            });
            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Group created successfully!",
                }).then(() => {
                    load_page("/class_teacher_view");
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: result.error || "Failed to create group.",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "An error occurred while creating the group.",
            });
        }
    });

    // Cancel and go back to class_teacher_view
    document.querySelector("#button_to_dashboard").addEventListener("click", () => {
        load_page("/class_teacher_view");
    });
}