import { load_page } from "../app.js"

export default function CreatePeerReview() {

    // Add question button handler 
    document.querySelector("#button_create_question").addEventListener("click", () => {
       
        const html_question = create_question()
        document.querySelector("#div_questions").appendChild(html_question);

    });
};

function create_question() {
    // Build our html for the question
    const html_container = document.createElement("div")
    html_container.className = "border border-black rounded mb-3"

    const question_heading = document.createElement("h2")
    question_heading.innerText = "Question" 
    html_container.appendChild(question_heading)

    const select_pub_pri = document.createElement("select")
    select_pub_pri.id = "select_pub_pri"
    select_pub_pri.name = "Public or Private"
    select_pub_pri.innerHTML = `
        <option>Private</option>    
        <option>Public</option>
    `
    html_container.appendChild(select_pub_pri)

    const select_question_type = document.createElement("select")
    select_question_type.id = "select_question_type"
    select_question_type.name = "Question Type"
    select_question_type.className = "mx-2"
    select_question_type.innerHTML = `
        <option>Select Question Type</option>
        <option>Written Response</option>
        <option>Multiple Choice</option>
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