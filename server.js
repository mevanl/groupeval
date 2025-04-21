// Imports
const express = require("express")
const cors = require("cors")
const path = require("path")
require("dotenv").config()
const { v4: uuidv4 } = require("uuid")
const sqlite = require("sqlite3").verbose()
const bcrypt = require("bcrypt")
const int_salt = 10

// Setup our expres app 
const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))

// Setup our database 
const db_source = "database.db"
const db = new sqlite.Database(db_source)


// LOGIN AND REGISTER API 
// validate login 
app.get("/api/validate_login", (request, response, next) => {
    // SQL preparted statements
    const qstring_get_account = `SELECT email, password from table_users WHERE email = ?`
    const qstring_update_last_logged_in = `UPDATE table_users SET last_logged_in = ? WHERE email = ?`


    // get request body information (email and password)
    let string_email = request.body.email.trim().toLowerCase()
    let string_password = request.body.password


    // Email validation using regex
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_regex.test(string_email)) {
        return response.status(400).json({ error: "You must provide a valid email addresponses" });
    }

    // Password validation based on NIST standards
    if (string_password.length < 8 ||
        !/[A-Z]/.test(string_password) ||
        !/[a-z]/.test(string_password) ||
        !/[0-9]/.test(string_password) ||
        !/[!@#$%^&*(),.?":{}|<>]/.test(string_password)) {
        return response.status(400).json({ error: "Password must meet complexity requirements" });
    }

    db.get(qstring_get_account, [string_email], (error, row) => {
        // if cant access db or other issue
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error" })
        }

        // If no user
        if (!row) {
            return response.status(401).json({ error: "Invalid email or password" })
        }

        // check password 
        const bool_password_match = bcrypt.compareSync(string_password, row.password)
        if (!bool_password_match) {
            return response.status(401).json({ error: "Invalid email or password" })
        }

        // email and password are valid and matched, update last_logged_in
        const timestamp = new Date().toISOString()

        db.run(qstring_update_last_logged_in, [timestamp, string_email], function (error) {
            // if couldnt update
            if (error) {
                console.error(error)
                return response.status(500).json({ error: "Failed to update last login" })
            }

            return response.status(500).json({ error: "Failed to update last login" })
        })
    })
})



// register account 
app.post("/api/register_account", (request, response, next) => {
    // SQL Prepared statements
    const qstring_check_email_exists = `SELECT email FROM table_users WHERE email = ?`
    const qstring_insert_account = `INSERT INTO table_users (firstname, lastname, email, password, created_at, last_logged_in) VALUES (?, ?, ?, ?, ?, ?)`
    const qstring_insert_socials = `INSERT INTO table_socials (email, discord, phone) VALUES (?, ?, ?)`

    // get request body information 
    let string_email = request.body.email.trim().toLowerCase()
    let string_password = request.body.password
    let string_first_name = request.body.first_name
    let string_last_name = request.body.last_name
    let string_phone_number = request.body.phone_number
    let string_discord_username = request.body.discord_username

    // Email validation using regex
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_regex.test(string_email)) {
        return response.status(400).json({ error: "You must provide a valid email addresponses" });
    }

    // Password validation based on NIST standards
    if (string_password.length < 8 ||
        !/[A-Z]/.test(string_password) ||
        !/[a-z]/.test(string_password) ||
        !/[0-9]/.test(string_password) ||
        !/[!@#$%^&*(),.?":{}|<>]/.test(string_password)) {
        return response.status(400).json({ error: "Password must meet complexity requirements" });
    }


    // First and last name not blank 
    if (!string_first_name || string_first_name.length < 1) {
        return response.status(400).json({ error: "First name must not be blank" })
    }
    if (!string_last_name || string_last_name.length < 1) {
        return response.status(400).json({ error: "Last name must not be blank" })
    }

    // Phone validation 

    // TODO: IMPLEMENT THIS WHEN FIGURE OUT LIBRARY 


    // Discord Validation, can be empty 
    // if empty, igore 
    if (string_discord_username.length < 1) {
        string_discord_username = null
    }


    const string_hashed_password = bcrypt.hashSync(string_password, int_salt)
    const timestamp = new Date().toISOString()

    // Do our db transactions 
    db.get(qstring_check_email_exists, [string_email], (error, row) => {

        // if cant access db or other issue
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error" })
        }

        // if this row exists, account with this email already is made
        if (row) {
            return response.status(400).json({ error: "An account with this email already exists." })
        }

        // account doesnt exists, insert account information into the tables
        db.run(qstring_insert_account, [string_first_name, string_last_name, string_email, string_hashed_password, timestamp, timestamp], function (error) {
            if (error) {
                console.error(error)
                return response.status(500).json({ error: "Failed to create user account" })
            }

            // insert their phone number into table_socials, discord if not blank 
            db.run(qstring_insert_socials, [string_email, string_discord_username || null, string_phone_number], function (error) {
                if (error) {
                    console.error(error)
                    return response.status(500).json({ error: "Failed to insert into socials table" })
                }

                return response.status(200).json({ message: "Account created successfully" })
            })
        })
    })
})


// DASHBOARD API 
// get the courses you are in 
app.get("/api/get_courses", (request, response, next) => {
    // can return an object of courses with two main sections, teaching and enrolled based on the role 


    // get request body information (the user)

    // check if user exists in db (redudant)

    // if exists, db.all there courses 
})

// create course 
app.post("/api/create_course", (response, request, next) => {

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
    // SQL Prepared statements
    const qstring_check_course_exists = `SELECT course_uuid FROM table_courses WHERE course_uuid = ?`
    const qstring_get_groups_by_course = `SELECT * FROM table_groups WHERE course_uuid = ?`

    // get request body information
    let string_course_uuid = request.body.course_uuid?.trim()

    // validate request body information 
    if (!string_course_uuid || string_course_uuid.length < 1) {
        return response.status(400).json({ error: "Course UUID must not be blank" })
    }

    // check to make sure course exists
    db.get(qstring_check_course_exists, [string_course_uuid], (error, row) => {
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while checking course existence" })
        }

        if (!row) {
            return response.status(404).json({ error: "Course not found" })
        }

        // Get all groups for this course
        db.all(qstring_get_groups_by_course, [string_course_uuid], (error, rows) => {
            if (error) {
                console.error(error)
                return response.status(500).json({ error: "Failed to retrieve groups for course" })
            }

            return response.status(200).json({ groups: rows })
        })
    })
})


// teacher create group for class
app.post("/api/create_group", (request, response, next) => {
    // SQL Prepared statements
    const qstring_check_course_exists = `SELECT course_uuid FROM table_courses WHERE course_uuid = ?`
    const qstring_check_group_conflict = `SELECT group_name FROM table_groups WHERE group_name = ? AND course_uuid = ?`
    const qstring_insert_group = `INSERT INTO table_groups (group_name, course_uuid, group_uuid) VALUES (?, ?, ?)`

    // get request body information 
    let string_course_uuid = request.body.course_uuid?.trim()
    let string_group_name = request.body.group_name?.trim()

    // validate request body information
    if (!string_course_uuid || string_course_uuid.length < 1) {
        return response.status(400).json({ error: "Course UUID must not be blank" })
    }
    if (!string_group_name || string_group_name.length < 1) {
        return response.status(400).json({ error: "Group name must not be blank" })
    }

    // check course exists
    db.get(qstring_check_course_exists, [string_course_uuid], (error, course_row) => {
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while checking course" })
        }

        if (!course_row) {
            return response.status(404).json({ error: "Course not found" })
        }

        // check if group name already exists in this course
        db.get(qstring_check_group_conflict, [string_group_name, string_course_uuid], (error, group_row) => {
            if (error) {
                console.error(error)
                return response.status(500).json({ error: "Database error while checking group name" })
            }

            if (group_row) {
                return response.status(409).json({ error: "A group with this name already exists in the course" })
            }

            // Generate UUID for group
            const string_group_uuid = uuidv4()

            // insert group into the table
            db.run(qstring_insert_group, [string_group_name, string_course_uuid, string_group_uuid], function (error) {
                if (error) {
                    console.error(error)
                    return response.status(500).json({ error: "Failed to create group" })
                }

                return response.status(200).json({
                    message: "Group created successfully",
                    group_uuid: string_group_uuid
                })
            })
        })
    })
})

// teacher can update a group in a class 
app.post("/api/update_group", (request, response, next) => {
    // get request body information 

    // validation request body information

    // check in database course exists in db (redundant but better safe)

    // check in database if this group conflicts in this course 
    // (group name should be unique basically)

    // do unique updates (name is still unique, etc.)

    // If unqiue and validated successfully, db.run 
})

app.post("/api/join_group", (request, response, next) => {
    
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


const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}/`))