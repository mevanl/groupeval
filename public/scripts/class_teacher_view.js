
import { load_page } from "../app.js"

export default function TeacherView() {


    // Go back to dashboard 
    document.querySelector("#button_to_dashboard").addEventListener("click", () => {
        load_page("/dashboard");
    });

    // Create review 
    document.querySelector("#button_create_review").addEventListener("click", function(event) {
        load_page("/create_review")
    })
    
};
