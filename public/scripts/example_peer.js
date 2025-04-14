import { load_page } from "../app.js"

export default function initexamplepeer() {
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