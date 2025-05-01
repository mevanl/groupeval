const express = require("express")
const cors = require("cors")
require("dotenv").config()
const path = require("path")


// Setup our expres app 
const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))


// Get our routes 
const auth_routes = require("./routes/auth")
const course_routes = require("./routes/courses")
const group_routes = require("./routes/groups")
const assessment_routes = require("./routes/assessments")


// Use routes 
app.use("/api", auth_routes)
app.use("/api", course_routes)
app.use("/api", group_routes)
app.use("/api", assessment_routes)


// base route 
app.get("*", (request, response, next) => {
    response.status(200).sendFile(path.join(__dirname, "public", "index.html"))
})


// Create server 
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}/`))
