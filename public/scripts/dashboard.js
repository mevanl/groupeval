
import { load_page } from "../app.js";

export default async function initDashboard() {
    const userEmail = localStorage.getItem("user_email");

    // Check if the email exists in localStorage
    if (!userEmail) {
        alert("Error: User email not found. Please log in again.");
        load_page("/login"); // Redirect to the login page if no email is found
        return;
    }
    
    // Navigate to the create-class page
    document.querySelector("#button_create_class").addEventListener("click", () => {
        load_page("/create-a-class");
    });

    // Navigate to the enroll page
    document.querySelector("#button_enroll_class").addEventListener("click", () => {
        load_page("/enroll");
    });

    // Get reference to class lists
    const teachingList = document.querySelector("#teachingList");
    const enrolledList = document.querySelector("#enrolledList");

    // Fetch teaching classes from the backend
    try {
        const response = await fetch(`/api/user/${userEmail}/courses/teaching`);
        const result = await response.json();
    
        if (response.ok) {
            teachingList.innerHTML = ""; 
            if (result.teaching_classes.length === 0) {
                teachingList.innerHTML = `<p>No classes found. Create a class to get started!</p>`;
            } else {
                result.teaching_classes.forEach((classItem) => {
                    const classCard = document.createElement("div");
                    classCard.classList.add("card", "p-3", "border-primary", "mb-3");
                    classCard.innerHTML = `
                        <h5>${classItem.name}</h5>
                        <h6>${classItem.class_lable}</h6>
                        <h7>${classItem.class_section}</h7>
                        <p>${classItem.class_term}</p>
                    `;
                
                    classCard.addEventListener("click", () => {
                        // Store the selected class's course_uuid in localStorage
                        localStorage.setItem("selected_course_uuid", classItem.course_uuid);
                        load_page("/class_teacher_view"); // Redirect to the teacher view page
                    });
                
                    teachingList.appendChild(classCard);
                });
            }
        } else {
            teachingList.innerHTML = `<p>${result.error || "Failed to load teaching classes."}</p>`;
        }
    } catch (error) {
        teachingList.innerHTML = `<p>An error occurred while fetching teaching classes.</p>`;
    }

    // // Populate Teaching Classes
    // teachingClasses.forEach((classItem) => {
    //     const classCard = document.createElement("div");
    //     classCard.classList.add("card", "p-3", "border-primary", "mb-3");
    //     classCard.innerHTML = `
    //         <h5>${classItem.name}</h5>
    //         <h6>${classItem.code}</h6>
    //         <h7>Section: ${classItem.section}</h7>
    //         <p>Term: ${classItem.term}</p>
    //     `;

    //     classCard.addEventListener("click", () => {
    //         load_page("/class_teacher_view"); // Redirect to the teacher class page
    //     });

    //     teachingList.appendChild(classCard);
    // });

    // Populate Enrolled Classes
    const enrolledClasses = [
        { name: "English 3", code: "ENG303", term: "Fall 2023", teacher: "Mr. John Doe" },
        { name: "History 4", code: "HIS404", term: "Spring 2026", teacher: "Dr. Jane Smith" }
    ];

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