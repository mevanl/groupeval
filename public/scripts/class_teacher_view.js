
import { load_page } from "../app.js"

export default async function TeacherView() {

    const courseUuid = localStorage.getItem("selected_course_uuid");

    if (!courseUuid) {
        alert("Error: No class selected. Please go back to the dashboard and select a class.");
        load_page("/dashboard");
        return;
    }

    // Fetch class details from the backend
    try {
        const response = await fetch(`/api/courses/${courseUuid}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`, // Replace "auth_token" with your token key
            },
        });
        const result = await response.json();

        if (response.ok) {
            // Populate class details in the HTML
            document.querySelector("#classTitle").textContent = `Class Name: ${result.course.name}`;

        } else {
            alert(result.error || "Failed to load class details.");
            load_page("/dashboard");
        }
    } catch (error) {
        alert("An error occurred while fetching class details.");
        load_page("/dashboard");
    }

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
                        localStorage.setItem("selected_group_uuid", group.group_uuid);
                        localStorage.setItem("selected_group_name", group.group_name);
                        load_page("/group_members");
                    });
    
                    groupsList.appendChild(groupCard);
                });
    
                // Clear and append the updated groups list
                groupsSection.innerHTML = `
                    <h3>Groups</h3>
                    <button id="button_create_groups" class="btn btn-primary m-2" aria-label="Creates Groups">Create Groups</button>
                `;
                groupsSection.appendChild(groupsList);
    
                // Reattach the event listener for the "Create Groups" button
                document.querySelector("#button_create_groups").addEventListener("click", () => {
                    load_page("/create_group");
                });
            } else {
                alert(result.error || "Failed to load groups.");
            }
        } catch (error) {
            alert("An error occurred while fetching groups.");
        }
    }

    // Load groups on page load
    loadGroups();

    // Go back to dashboard
    document.querySelector("#button_to_dashboard").addEventListener("click", () => {
        load_page("/dashboard");
    });

    async function loadReviews() {
        try {
            const response = await fetch(`/api/courses/${courseUuid}/assessments`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
            });
            const result = await response.json();
    
            if (response.ok) {
                const reviewList = document.querySelector("#PeerReviewList");

                result.assessments.forEach((assessment) => {
                    const reviewCard = document.createElement("div");
                    reviewCard.classList.add("card", "p-3", "border-primary", "mb-3");
                    reviewCard.style.cursor = "pointer";
    
                    reviewCard.innerHTML = `
                        <h5 class="card-title">${assessment.assessment_name}</h5>
                    `;
    
                    reviewCard.addEventListener("click", () => {
                        localStorage.setItem("selected_review_uuid", assessment.assessment_uuid);
                        localStorage.setItem("selected_review_name", assessment.assessment_name);
                        load_page("/example_peer");
                    });
    
                    reviewList.appendChild(reviewCard);
                });
            } else {
                alert(result.error || "Failed to load reviews.");
            }
        } catch (error) {
            alert("An error occurred while fetching reviews.");
        }
    }

    // Load reviews on page load
    loadReviews();

    document.querySelector("#button_create_groups").addEventListener("click", () => {
        load_page("/create_group");
    });

    // Go back to dashboard 
    document.querySelector("#button_to_dashboard").addEventListener("click", () => {
        load_page("/dashboard");
    });

    // Create review 
    document.querySelector("#button_create_review").addEventListener("click", function(event) {
        load_page("/create_review")
    })
    
};