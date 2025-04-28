
import { load_page } from "../app.js";

export default async function initDashboard() {
    const userEmail = localStorage.getItem("user_email");

    // Check if the email exists in localStorage
    if (!userEmail) {
        alert("Error: User email not found. Please log in again.");
        load_page("/login"); // Redirect to the login page if no email is found
        return;
    }

     // Fetch user info and update the greeting
     try {
        const response = await fetch(`/api/user/${userEmail}`);
        const result = await response.json();

        if (response.ok) {
            const userGreeting = document.querySelector("#userGreeting");
            userGreeting.textContent = `Hello, ${result.firstname} ${result.lastname}`;
        } else {
            alert(result.error || "Failed to load user information.");
        }
    } catch (error) {
        alert("An error occurred while fetching user information.");
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


try {
    const response = await fetch(`/api/user/${userEmail}/courses/enrolled`);
    const result = await response.json();

    if (response.ok) {
        enrolledList.innerHTML = ""; // Clear the list before populating
        if (result.enrolled_courses.length === 0) {
            enrolledList.innerHTML = `<p>No enrolled classes found. Use the enrollment code to join a class!</p>`;
        } else {
            result.enrolled_courses.forEach((classItem) => {
                const classCard = document.createElement("div");
                classCard.classList.add("card", "p-3", "border-primary", "mb-3");
                classCard.innerHTML = `
                    <h5>${classItem.name}</h5>
                    <h6>${classItem.class_lable}</h6>
                    <h7>${classItem.class_term}</h7>
                    <p>Teacher: ${classItem.firstname} ${classItem.lastname}</p>
                `;

                classCard.addEventListener("click", () => {
                    // Store the selected class's course_uuid in localStorage
                    localStorage.setItem("selected_course_uuid", classItem.course_uuid);
                    load_page("/class_student_view"); // Redirect to the teacher view page
                });

                enrolledList.appendChild(classCard);
            });
        }
    } else {
        enrolledList.innerHTML = `<p>${result.error || "Failed to load enrolled classes."}</p>`;
    }
} catch (error) {
    enrolledList.innerHTML = `<p>An error occurred while fetching enrolled classes.</p>`;
}


const logoutButton = document.querySelector("#button_logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            // Clear user session data from localStorage
            localStorage.removeItem("user_email");
            localStorage.removeItem("selected_course_uuid");

            // Redirect the user to the login page
            window.location.href = "/home";
        });
    }
}