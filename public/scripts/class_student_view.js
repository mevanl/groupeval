import { load_page } from "../app.js";

export default async function StudentView() {
    const courseUuid = localStorage.getItem("selected_course_uuid");
    const userEmail = localStorage.getItem("user_email");

    if (!courseUuid) {
        alert("Error: No class selected. Please go back to the dashboard and select a class.");
        load_page("/dashboard");
        return;
    }

    // Fetch class details from the backend
    try {
        const response = await fetch(`/api/courses/${courseUuid}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
        });
        const result = await response.json();

        if (response.ok) {
            // Populate class details in the HTML
            document.querySelector("#classTitle_student").textContent = `Class Name: ${result.course.name}`;
            document.querySelector("#teacherInfo_student").textContent = `Teacher: ${result.course.teacher_firstname} ${result.course.teacher_lastname}`;
            document.querySelector("#teacherEmail_student").textContent = `Teacher Email: ${result.course.teacher_email}`;
            document.querySelector("#teacherPhone_student").textContent = `Teacher Phone Number: ${result.course.teacher_phone || "N/A"}`;
        } else {
            alert(result.error || "Failed to load class details.");
            load_page("/dashboard");
        }
    } catch (error) {
        alert("An error occurred while fetching class details.");
        load_page("/dashboard");
    }

    // Fetch and display the group the student has joined
    async function loadGroup() {
        try {
            const response = await fetch(`/api/courses/${courseUuid}/${userEmail}/group`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
            });

            const result = await response.json();

            if (response.ok) {
                const groupList = document.querySelector("#groupList__student");
                groupList.innerHTML = `
                    <div class="card p-3 border-primary mb-3" style="cursor: pointer;">
                        <h5 class="card-title">${result.group.group_name}</h5>
                    </div>
                `;

                // Add click event to the group card
                const groupCard = groupList.querySelector(".card");
                groupCard.addEventListener("click", () => {
                    localStorage.setItem("selected_group_uuid", result.group.group_uuid);
                    localStorage.setItem("selected_group_name", result.group.group_name);
                    load_page("/group_members");
                });
            } else {
                document.querySelector("#groupList__student").innerHTML = "<p>You are not part of any group yet.</p>";
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "An error occurred while fetching your group.",
            });
        }
    }

    loadGroup();

    document.querySelector("#button_join_group").addEventListener("click", () => {
        load_page("/join_group");
    });

    // Go back to dashboard
    document.querySelector("#button_to_dashboard_student").addEventListener("click", () => {
        load_page("/dashboard");
    });

    async function loadPeerReview(){
        try {
            const response = await fetch(`/api/courses/${courseUuid}/assessments`,{ // assessments/assigned does not work
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
            });

            const result = await response.json();
            // console.log(result);

            if (response.ok) {
                const reviewList = document.querySelector("#PeerReviewList__student");

                result.assessments.forEach((assessment)=> { //loop to create a card for all assesments instead of just one, commented out original creation
                    const reviewCard = document.createElement('div');
                    reviewCard.classList.add("card", "p-3", "border-primary", "mb-3");
                    reviewCard.style.cursor = "pointer";

                    reviewCard.innerHTML = `
                        <h5 class="card-title">${assessment.assessment_name}</h5>
                    `;

                    reviewCard.addEventListener("click", () => { //store the assessment uuid and name in local storarge
                        localStorage.setItem("selected_review_uuid", assessment.assessment_uuid);
                        localStorage.setItem("selected_review_name", assessment.assessment_name);
                        load_page("/example_peer"); //loads the peer review page
                    });
                    reviewList.appendChild(reviewCard); //adds the card to the PeerReviewList__student div
                })
            //     reviewList.innerHTML = `
            //         <div class="card p-3 border-primary mb-3" style="cursor: pointer;">
            //             <h5 class="card-title">${result.assessments.assessment_name}</h5>
            //         </div>`;
            // // Add click event to the group card
            // const reviewCard = reviewList.querySelector(".card");

        } else {
            document.querySelector("#PeerReviewList__student").innerHTML = "<p>Failed to load reviews.</p>"; // may switch to alert later
        }
    } catch(error){
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "An error occurred while fetching peer reviews.",
            });
        }
    }
    
    loadPeerReview();
}