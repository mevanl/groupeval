import { load_page } from "../app.js"

export default async function initStudentReview() {
    const assessmentUuid = localStorage.getItem("selected_review_uuid");
    const assessmentName = localStorage.getItem("selected_review_name");
    const userEmail = localStorage.getItem("user_email");
    const courseUuid = localStorage.getItem("selected_course_uuid");

    if (!assessmentUuid) {
        alert("Error: No review selected. Please go back to the class page.");
        load_page("/class_student_view");
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
        load_page("/class_student_view");
    });

    document.querySelector("#button_submit").addEventListener("click", async () => {
        const reviewAnswers = [];

        // Loop through the questions and get the answers
        const questions = document.querySelectorAll("#Questions .form-group");
        questions.forEach((question) => {
            const questionType = question.querySelector("label").textContent.split(" ")[0];
            let answer = null;

            if (questionType === "Multiple") {
                answer = question.querySelector("#mcAnswer").value;
            } else if (questionType === "Written") {
                answer = question.querySelector("#responseAnswer").value;
            }

            reviewAnswers.push({ question_type: questionType, answer });
        });

        // Send the answers to the server
        try {
            const response = await fetch(`/api/courses/${courseUuid}/assessments/${assessmentUuid}/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify({
                    string_course_uuid: courseUuid,
                    string_assessment_uuid: assessmentUuid,
                    submission_json: JSON.stringify(reviewAnswers),
                    user_email: userEmail,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    text: "Review has been submitted successfully.",
                })
                load_page("/class_student_view");
            } else {
                alert(result.error || "Failed to submit review.");
            }
        } catch (error) {
            alert("An error occurred while submitting the review.");
        }
    })

}