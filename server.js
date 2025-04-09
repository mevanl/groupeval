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


app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}/`))