import { load_page } from "../app.js";

export default async function StudentView() {
    const courseUuid = localStorage.getItem("selected_course_uuid");

    if (!courseUuid) {
        alert("Error: No class selected. Please go back to the dashboard and select a class.");
        load_page("/dashboard");
        return;
    }

    // Fetch class details from the backend
    try {
        const response = await fetch(`/api/courses/${courseUuid}`);
        const result = await response.json();

        if (response.ok) {
            // Populate class details in the HTML
            document.querySelector("#classTitle_student").textContent = `Class Name: ${result.course.name}`;
            document.querySelector("#classterm_student").textContent = `Term: ${result.course.class_term}`;
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

    // Go back to dashboard
    document.querySelector("#button_to_dashboard_student").addEventListener("click", () => {
        load_page("/dashboard");
    });
}