const express = require("express")
const router = express.Router()
const db = require("../db/db")
const { v4: uuidv4 } = require("uuid")



// for a given course uuid, get all peer review assessment from db (stores as text, its json)
router.get("/course/:course_uuid/assessments", (request, response, next) => {

})


// for a given course, create a peer review assessment and store in db as text (json object)
router.post("/course/:course_uuid/assessments", (request, response, next) => {

})


// for a given course, the enrolled student will get their assigned peer review 
router.get("/course/:course_uuid/assessments/assigned", (request, response, next) => {

})


// for a given course and student, get peer review back (public question information only)
router.get("/course/:course_uuid/assessments/:assessment_uuid/public", (request, response, next) => {
    // the peer review json questions has them marked as public or private, we only 
    // will send the ones marked as public as the feedback from their group
})



router.get("/course/:course_uuid/assessments/submitted", (request, response, next) => {
    // returns name and uuid of all peer reviews, teacher can click on them
    // which will fetch from /get_submitted_course_peer_review  
})


// for a given course and the teacher, see submitted peer reviews answers (public and private)

router.get("/course/:course_uuid/assessments/:assessment_uuid/submitted", (request, response, next) => {
// returns a specific peer review
})


module.exports = router