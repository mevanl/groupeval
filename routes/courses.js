const express = require("express")
const router = express.Router()
const db = require("../db/db")
const { v4: uuidv4 } = require("uuid")


// get a users courses, the returned object will have 2 sections
// the courses the user is a teacher in and where they are enrolled (student)
router.get("/get_courses", (request, response, next) => {
    // can return an object of courses with two main sections, teaching and enrolled based on the role 

    // get request body information (the user)

    // check if user exists in db (redudant)

    // if exists, db.all there courses 

    // return object 
})

// create a course, the user who created it is the owner/teacher of it 
router.post("/create_course", (response, request, next) => {

})





module.exports = router