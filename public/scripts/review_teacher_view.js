import { load_page } from "../app.js"

export default async function initTeacherReview() {
    const assessmentUuid = localStorage.getItem("selected_review_uuid");
    const assessmentName = localStorage.getItem("selected_review_name");
    const userEmail = localStorage.getItem("user_email");
    const courseUuid = localStorage.getItem("selected_course_uuid");

    if (!assessmentUuid) {
        alert("Error: No review selected. Please go back to the class page.");
        load_page("/class_teacher_view");
        return;
    }

    document.querySelector("#reviewTitle").textContent = `Review: ${assessmentName}`;

    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    try {
        const response = await fetch(`/api/courses/${courseUuid}/assessments`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
        });

        const result = await response.json();

        if (response.ok) {

            const questionsBody = document.querySelector("#Questions");
            questionsBody.innerHTML = ""; // Clear existing rows

            //Loop through assessments and select the one with the matching UUID
            result.assessments.forEach((assessment) => {
                if (assessment.assessment_uuid == assessmentUuid) {

                    // Create a list of the questions in the assessment
                    const questions = JSON.parse(assessment.array_json_questions);

                    // Loop through the questions and add them to the HTML
                    questions.forEach((question) => {

                        const questionDiv = document.createElement("div");
                        console.log(question)
                        questionDiv.classList.add("form-group");
                        questionDiv.innerHTML = `
                            <label for="mcAnswer">${question.question_type} (${question.public}):</label>
                            <p>${question.question_name}</p>
                        `;

                        if(question.question_type == "Multiple Choice") {
                            questionDiv.innerHTML += `
                                <select class="form-control" id="mcAnswer">
                                    <option value="">Select an answer</option>
                                    ${question.mcq_choices.map((option) => `<option value="${option}">${option}</option>`).join("")}
                                </select>
                            `;
                        }
                        else if(question.question_type == "Written Response") {
                            questionDiv.innerHTML += `
                                <textarea id="responseAnswer" class="form-control" placeholder="Write your response"></textarea>
                            `;
                        }

                        questionsBody.appendChild(questionDiv);
                    })
                }
            })

        } else {
            alert(result.error || "Failed to load course details.");
        }
    } catch (error) {
        alert("An error occurred while fetching review.");
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////

    document.querySelector("#button_cancel").addEventListener("click", () => {
        load_page("/class_teacher_view");
        // Logic to go back to the teacher view would go here
    });
    
    document.querySelector("#button_update").addEventListener("click", () => {
        alert("Update functionality is coming soon!");
    });
    
    document.querySelector("#button_delete").addEventListener("click", () => {
        alert("Delete functionality is coming soon!");
    });

}