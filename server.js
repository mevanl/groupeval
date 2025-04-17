const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const app = express()

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

const PORT = process.env.PORT || 3000



// LOGIN AND REGISTER API 
// validate login 
app.get("/api/validate_login", (request, response, next) => {
    // get request body information (email and password)
    
    // validate
    
    // db.run
})

// register account 
app.post("/api/register_account", (request, response, next) => {
    // get request body information 
    
    // validate with regex and NIST standard 
    
    // check db if email exists yet or not 
    
    // if doesnt exists and validation successful, db.run 
})


// DASHBOARD API 
// get the courses you are in 
app.get("/api/get_courses", (request, response, next) => {
    // can return an object of courses with two main sections, teaching and enrolled based on the role 
    
    
    // get request body information (the user)
    
    // check if user exists in db (redudant)
    
    // if exists, db.all there courses 
})


// COURSE API 
// get peer review assignments for a class 
app.get("/api/get_peer_reviews", (request, response, next) => {
    // get request body information (course name)
    
    // validate request body information 
    
    // check to make sure course exists in db (redundant but better safe)
    
    // if validation good, db.all 
})

// teacher create peer review for a class 
app.post("/api/create_peer_review", (request, response, next) => {
    // get request body information (course name, peer review data)
    
    // validate request body information 
    
    // check to make sure course exists in db (redundant but better safe)
    
    // check that peer review name is unqiue in db 
    
    // if validation good, db.run  
})

// get course groups 
app.get("/api/get_groups", (request, response, next) => {
    // get request body information (course name)
    
    // validate request body information 
    
    // check to make sure course exists in db (redundant but better safe)
    
    // if course exists, db.all for groups in that course 
})

// teacher create group for class
app.post("/api/create_group", (request, response, next) => {
    // get request body information 
    
    // validation request body information
    
    // check in database course exists in db (redundant but better safe)
    
    // check in database if this group conflicts in this course 
    // (group name should be unique basically)
    
    // If unqiue and validated successfully, db.run 
})

// teacher can update a group in a class 
app.post("/api/update_group", (request, response, next) => {
    // get request body information 
    
    // validation request body information
    
    // check in database course exists in db (redundant but better safe)
    
    // check in database if this group conflicts in this course 
    // (group name should be unique basically)

    // do unique updates (no duplicate users, name is still unique, etc.)
    
    // If unqiue and validated successfully, db.run 
})


// USER PROFILE

// return your profile 
app.get("/api/user_profile", (request, response, next) => {
    // get request body information 
    
    // validate user, make sure they are that user 

    // db.all if validation successful 
})

app.post("/api/update_user_profile", (request, response, next) => {
    // get request body information 
    
    // validate user, make sure they are that user

    // db.run if validation successful 
})

// Base url index.html
app.get("*", (request, response, next) => {
    response.status(200).sendFile(path.join(__dirname, "public", "index.html"))
})


app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}/`))