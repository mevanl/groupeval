import { load_page } from "../app.js"

export default async function initTeacherReview() {
    const assessmentUuid = localStorage.getItem("selected_review_uuid");
    const assessmentName = localStorage.getItem("selected_review_name");
    const userEmail = localStorage.getItem("user_email");
    const courseUuid = localStorage.getItem("selected_course_uuid");

    if (!assessmentUuid) {
        alert("Error: No submission selected. Please go back to the class page.");
        load_page("/class_teacher_view");
        return;
    }

    document.querySelector("#submissionTitle").textContent = `Reviews: ${assessmentName}`;

    async function loadGroups() {
        try {
            const response = await fetch(`/api/courses/${courseUuid}/groups`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
            });
            const result = await response.json();
    
            if (response.ok) {
                const groupsSection = document.querySelector("#groupsSection");
                const groupsList = document.createElement("div");
                groupsList.classList.add("d-flex", "flex-wrap", "gap-2", "mt-3");
    
                result.groups.forEach((group) => {
                    const groupCard = document.createElement("div");
                    groupCard.classList.add("card", "p-3", "border-primary", "mb-3");
                    groupCard.style.cursor = "pointer";
    
                    groupCard.innerHTML = `
                        <h5 class="card-title">${group.group_name}</h5>
                    `;
    
                    groupCard.addEventListener("click", () => {

                        // Clear previous selection
                        groupsSection.querySelectorAll(".card").forEach((card) => {
                            card.style.border = "1px solid #007bff";
                            card.style.backgroundColor = ""
                        });

                        // Highlight selected group
                        groupCard.style.border = "2px solid #007bff";
                        groupCard.style.backgroundColor = "#e7f0ff";

                        setGroupMembers(group.group_uuid);
                    });

    
                    groupsList.appendChild(groupCard);
                });
    
                // Clear and append the updated groups list
                groupsSection.innerHTML = `
                    <h3>Groups</h3>
                `;
                groupsSection.appendChild(groupsList);

            } else {
                alert(result.error || "Failed to load groups.");
            }
        } catch (error) {
            alert("An error occurred while fetching groups.");
        }
    }

    // Load groups on page load
    loadGroups();

    document.querySelector("#button_back").addEventListener("click", () => {
        load_page("/class_teacher_view");
    });
}

async function setGroupMembers(group_uuid) {

    const membersResponse = await fetch(`/api/groups/${group_uuid}/members`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
    });

    const submissionResponse = await fetch(`/api/courses/${group_uuid}/assessments/submissions`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
    });

    const membersResult = await membersResponse.json();
    const submissionResult = await submissionResponse.json();
    //console.log(submissionResult);

    if (membersResponse.ok) {
        const membersSection = document.querySelector("#membersSection");
        const membersList = document.createElement("div");
        membersList.classList.add("d-flex", "flex-wrap", "gap-2", "mt-3");


        membersResult.members.forEach((member) => {
            const memberCard = document.createElement("div");
            memberCard.classList.add("card", "p-3", "border-primary", "mb-3");
            memberCard.style.cursor = "pointer";
        
            memberCard.innerHTML = `
                <h5 class="card-title">${member.full_name}</h5>
            `;
    
            memberCard.addEventListener("click", () => {

                // Clear previous selection
                membersSection.querySelectorAll(".card").forEach((card) => {
                    card.style.border = "1px solid #007bff";
                    card.style.backgroundColor = ""
                });

                // Highlight selected group
                memberCard.style.border = "2px solid #007bff";
                memberCard.style.backgroundColor = "#e7f0ff";

                createSubmissions(memberCard.group_uuid);
            });

     
            membersList.appendChild(memberCard);
        });
        
        membersSection.innerHTML = `
                <h3>Members</h3>
            `;
        membersSection.appendChild(membersList);

    } else {
        alert(membersResult.error || "Failed to load group members.");
    }
}

async function createSubmission(submission_uuid) {
    const submissionSection = document.querySelector("#submissionSection");
    submissionsSection.innerHTML = "";
    const submissionsList = document.createElement("div");
    submissionsList.classList.add("d-flex", "flex-wrap", "gap-2", "mt-3");


}