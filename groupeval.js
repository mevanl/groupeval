const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()


const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.static("public"))


// routes go here (we dont need for SPA ?)


// Serve index.html
app.get("*", (request, response) => {
    response.sendFile(path.join(__dirname, "public", "index.html"))
})


// Start server 
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}/`))
