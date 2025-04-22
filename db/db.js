// db.js
const sqlite = require("sqlite3").verbose()
const path = require("path")

// Set up your SQLite database file
const db_path = path.join(__dirname, "database.db") // adjust name/location as needed

// Create and export the database connection
const db = new sqlite.Database(db_path, (error) => {
    if (error) {
        console.error("Failed to connect to SQLite database:", error.message)
    } else {
        console.log("Connected to SQLite database")
    }
})

// Enforce foreign key constraints
db.run("PRAGMA foreign_keys = ON;")

module.exports = db
