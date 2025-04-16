const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()

const app = express()
app.use(express.static(path.join(__dirname, 'public')))

const PORT = process.env.PORT || 3000


// Base url index.html
app.get("*", (request, response, next) => {
    response.status(200).sendFile(path.join(__dirname, "public", "index.html"))
})

// LOGIN AND REGISTER API 
// validate login 
app.get("/api/validate_login", (request, response, next) => {

})

// register account 
app.post("/api/register_account", (request, response, next) => {

})


// DASHBOARD API 
// get the courses you are in 
app.get("/api/get_courses", (request, response, next) => {
    // can return an object of courses with two main sections, teaching and enrolled based on the role 
})


// COURSE API 
// get peer review assignments for a class 
app.get("/api/get_peer_reviews", (request, response, next) => {

})

// teacher create peer review for a class 
app.post("/api/create_peer_review", (request, response, next) => {
    
})

// get course groups 
app.get("/api/get_groups", (request, response, next) => {

})

// teacher create group for class
app.post("/api/create_group", (request, response, next) => {

})




app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}/`))