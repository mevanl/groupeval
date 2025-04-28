
import { load_page } from "../app.js"

export default async function TeacherView() {

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
            document.querySelector("#classTitle").textContent = `Class Name: ${result.course.name}`;
            document.querySelector("#classSection").textContent = `Section: ${result.course.class_section}`;
            document.querySelector("#classterm").textContent = `Term: ${result.course.class_term}`;
        } else {
            alert(result.error || "Failed to load class details.");
            load_page("/dashboard");
        }
    } catch (error) {
        alert("An error occurred while fetching class details.");
        load_page("/dashboard");
    }

    const array_peer_reviews = [
        { name: "Peer Assigment 1" },
        { name: "Peer Assigment 2" }
    ]

    const peerreviewlist = document.querySelector("#PeerReviewList")
    array_peer_reviews.forEach((peerreview) => {
        
        // Add html
        const PeerReviwCard = document.createElement("div");
        PeerReviwCard.classList.add("card", "p-3", "border-primary", "mb-3");
 
        PeerReviwCard.innerHTML = `
            <h5>${peerreview.name}</h5>
        `

        PeerReviwCard.addEventListener("click", () => {
            load_page("/example_peer") // Redirect to the teacher class page
        })
 
        peerreviewlist.appendChild(PeerReviwCard)
    });


    // Go back to dashboard 
    document.querySelector("#button_to_dashboard").addEventListener("click", () => {
        load_page("/dashboard");
    });

    // Create review 
    document.querySelector("#button_create_review").addEventListener("click", function(event) {
        load_page("/create_review")
    })
    
};