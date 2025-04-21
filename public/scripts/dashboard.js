
import { load_page } from "../app.js"

export default function initDashboard() {

    document.querySelector("#button_create_class").addEventListener("click", () => {
        // Navigate to the create-class page
        load_page("/create-a-class");
    });

    document.querySelector("#button_enroll_class").addEventListener("click", () => {
        // Navigate to the create-class page
        load_page("/enroll");
    });


    //This is only a place holder until we we get the create a class function working
    const teachingClasses = [
        { name: "Math 1", code: "MTH101", section: "A", term: "Fall 2023" },
        { name: "Science 2", code: "SCI202", section: "B", term: "Spring 2025" }
    ];

    //This is only a place holder until we we get the create a class function working
    const enrolledClasses = [
        { name: "English 3", code: "ENG303", term: "Fall 2023", teacher: "Mr. John Doe" },
        { name: "History 4", code: "HIS404", term: "Spring 2026", teacher: "Dr. Jane Smith" }
    ];

    // Get reference to class lists
    const teachingList = document.querySelector("#teachingList");
    const enrolledList = document.querySelector("#enrolledList");

    // Populate Teaching Classes
    teachingClasses.forEach((classItem) => {
        const classCard = document.createElement("div");
        classCard.classList.add("card", "p-3", "border-primary", "mb-3");
        classCard.innerHTML = `
            <h5>${classItem.name}</h5>
            <h6>${classItem.code}</h6>
            <h7>Section: ${classItem.section}</h7>
            <p>Term: ${classItem.term}</p>
        `;

        classCard.addEventListener("click", () => {
            load_page("/class_teacher_view"); // Redirect to the teacher class page
        });

        teachingList.appendChild(classCard);
    });

    // Populate Enrolled Classes
    enrolledClasses.forEach((classItem) => {
        const classCard = document.createElement("div");
        classCard.classList.add("card", "p-3", "border-primary", "mb-3");
        classCard.innerHTML = `
            <h5>${classItem.name}</h5>
            <h6>${classItem.code}</h6>
            <h7>Term: ${classItem.term}</h7>
            <p>Teacher: ${classItem.teacher}</p>
        `;

        classCard.addEventListener("click", () => {
            alert(`You selected your class: ${classItem.code} that you are enrolled in.`);
        });

        enrolledList.appendChild(classCard);
    });
}