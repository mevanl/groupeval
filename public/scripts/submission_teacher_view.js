import { load_page } from "../app.js"

export default async function initTeacherReview() {
    const assessmentUuid = localStorage.getItem("selected_submission_uuid");
    const assessmentName = localStorage.getItem("selected_submission_name");
    const userEmail = localStorage.getItem("user_email");
    const courseUuid = localStorage.getItem("selected_course_uuid");

    if (!assessmentUuid) {
        alert("Error: No submission selected. Please go back to the class page.");
        load_page("/class_teacher_view");
        return;
    }

    

    document.querySelector("#button_cancel").addEventListener("click", () => {
        load_page("/class_teacher_view");
    });
}