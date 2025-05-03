import { load_page } from "../app.js"

export default function CreatePeerReview() {
    const courseUuid = localStorage.getItem("selected_course_uuid");

    // Add question button handler 
    document.querySelector("#button_create_question").addEventListener("click", () => {
        
        const html_question = create_question()
        document.querySelector("#div_questions").appendChild(html_question);

    });

    document.querySelector("#createReviewForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const reviewName = document.querySelector("#txt_review_name").value.trim();
        const startDate = document.querySelector("#txt_start_date").value.trim();
        const dueDate = document.querySelector("#txt_due_date").value.trim();

        const questions = Array.from(document.querySelectorAll("#div_questions .nested-container")).map((questions) => {
            return {
                public: questions.querySelector("#select_pub_pri").value,
                question_type: questions.querySelector("#select_question_type").value,
                question_name: questions.querySelector("#txt_question").value.trim(),
                mcq_choices: Array.from(questions.querySelectorAll(".mcq_choices")).map((choice) => {
                    return choice.value.trim();
                })
            }
        })

        console.log(questions)

        let blnError = false;
        let strMessage = "";

        if (!reviewName) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Cannot Leave Review Name Blank.</p>';
        }
        if (!startDate) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Cannot Leave Start Date Blank.</p>';
        }
        if (!dueDate) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">Cannot Leave Due Date Blank.</p>';
        }

        if (questions.length == 0) {
            blnError = true;
            strMessage += '<p class="mb-0 mt-0">You must have at least one question.</p>';
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
            const response = await fetch(`/api/courses/${courseUuid}/assessments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                },
                body: JSON.stringify({ course_uuid: courseUuid, assessment_name: reviewName, start_date: startDate, due_date: dueDate, array_json_questions: questions }),
            });
            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: "Review created successfully!",
                }).then(() => {
                    load_page("/class_teacher_view");
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: result.error || "Failed to create Review.",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "An error occurred while creating the Review.",
            });
        }
    });
};

function create_question() {
    // Build our html for the question
    const html_container = document.createElement("div")
    html_container.className = "nested-container border border-black rounded mb-3"

    const question_heading = document.createElement("h2")
    question_heading.innerText = "Question" 
    html_container.appendChild(question_heading)

    const select_pub_pri = document.createElement("select")
    select_pub_pri.id = "select_pub_pri"
    select_pub_pri.name = "Public or Private"
    select_pub_pri.innerHTML = `
        <option value="Private">Private</option>    
        <option value="Public">Public</option>
    `
    html_container.appendChild(select_pub_pri)

    const select_question_type = document.createElement("select")
    select_question_type.id = "select_question_type"
    select_question_type.name = "Question Type"
    select_question_type.className = "mx-2"
    select_question_type.innerHTML = `
        <option value="">Select Question Type</option>
        <option value="Written Response">Written Response</option>
        <option value="Multiple Choice">Multiple Choice</option>
    `
    html_container.appendChild(select_question_type)

    const div_input_question = document.createElement("div")
    div_input_question.innerHTML = `
        <label for="txt_question" class="form-label mt-4">Enter Question:</label>
        <input id="txt_question" class="form-control" type="text" placeholder="Your question" aria-label="input for question">
    `
    html_container.appendChild(div_input_question)

    const div_responses = document.createElement("div")
    div_responses.className = "mt-3"
    html_container.appendChild(div_responses)

    
    // Based on question type, add html for it 
    select_question_type.addEventListener("change", () => {
        div_responses.innerHTML = ""// clear any previous stuff

        if (select_question_type.value === "Multiple Choice") {
            const button_add_response = document.createElement("button")
            button_add_response.type = "button"
            button_add_response.className = "btn btn-primary m-2"
            button_add_response.innerText = "Add MCQ Response"

            let num_mcq = 1
            button_add_response.addEventListener("click", () => {
                const div_response = document.createElement("div")
                div_response.id = `response_${num_mcq}`
                div_response.innerHTML = `
                    <input class="form-control mt-1" type="text" placeholder="Your MCQ response" aria-label="MCQ response ${num_mcq}">
                `
                div_responses.appendChild(div_response)
                num_mcq++
            });

            div_responses.appendChild(button_add_response);
        }

        if (select_question_type.value === "Written Response") {
            div_responses.innerText = "Written responses will be free text inputs by group members.";
        }
    });

    return html_container
}