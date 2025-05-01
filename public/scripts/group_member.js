import { load_page } from "../app.js";

export default async function GroupMembers() {
    const groupUuid = localStorage.getItem("selected_group_uuid");
    const groupName = localStorage.getItem("selected_group_name");
    const userEmail = localStorage.getItem("user_email");
    const courseUuid = localStorage.getItem("selected_course_uuid");

    if (!groupUuid) {
        alert("Error: No group selected. Please go back to the class page.");
        load_page("/class_student_view");
        return;
    }

    document.querySelector("#groupTitle").textContent = `Group Members: ${groupName}`;

    try {
        const response = await fetch(`/api/courses/${courseUuid}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
        });

        const result = await response.json();

        if (response.ok) {
            const ownerEmail = result.course.owner_email;

            // Back to class button
            document.querySelector("#button_back_to_class").addEventListener("click", () => {
                if (userEmail === ownerEmail) {
                    load_page("/class_teacher_view"); // Redirect to teacher view
                } else {
                    load_page("/class_student_view"); // Redirect to student view
                }
            });

            // Populate group members table
            const tableBody = document.querySelector("#groupMembersTableBody");
            tableBody.innerHTML = ""; // Clear existing rows

            const membersResponse = await fetch(`/api/groups/${groupUuid}/members`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
            });

            const membersResult = await membersResponse.json();

            if (membersResponse.ok) {
                membersResult.members.forEach((member) => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${member.full_name}</td>
                        <td>${member.email}</td>
                        <td>${member.phone}</td>
                        <td>${member.discord || "N/A"}</td>
                    `;
                    tableBody.appendChild(row);
                });
            } else {
                alert(membersResult.error || "Failed to load group members.");
            }
        } else {
            alert(result.error || "Failed to load course details.");
        }
    } catch (error) {
        alert("An error occurred while fetching group members.");
    }
}