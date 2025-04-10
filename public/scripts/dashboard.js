
import { load_page } from "../app.js"

export default function initDashboard() {

    document.querySelector("#btnCreateClass").addEventListener("click", () => {
        // Navigate to the create-class page
        load_page("/create-a-class");
    });

    document.querySelector("#btnEnrollClass").addEventListener("click", () => {
        // Navigate to the create-class page
        load_page("/enroll");
    });


    
    const teachingClasses = [
        { name: "Math 1", code: "MTH101", section: "A" },
        { name: "Science 2", code: "SCI202", section: "B" }
    ];

    const enrolledClasses = [
        { name: "English 3", code: "ENG303", teacher: "Mr. John Doe" },
        { name: "History 4", code: "HIS404", teacher: "Dr. Jane Smith" }
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
            <p>Section: ${classItem.section}</p>
        `;

        classCard.addEventListener("click", () => {
            alert(`You selected your class: ${classItem.code} ${classItem.section} that you are teaching.`);
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
            <p>Teacher: ${classItem.teacher}</p>
        `;

        classCard.addEventListener("click", () => {
            alert(`You selected your class: ${classItem.code} that you are enrolled in.`);
        });

        enrolledList.appendChild(classCard);
    });
}