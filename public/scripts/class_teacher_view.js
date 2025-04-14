
import { load_page } from "../app.js"

export default function TeacherView() {

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
