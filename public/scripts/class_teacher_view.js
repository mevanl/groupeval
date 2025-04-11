
import { load_page } from "../app.js"

export default function TeacherView() {


    // Go back to dashboard functionality
    document.querySelector("#goBackToDashboard_btn").addEventListener("click", () => {
        load_page("/dashboard");
    });
    
};
