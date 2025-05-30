// Login and registration routes 

const express = require("express")
const router = express.Router()
const db = require("../db/db")
const { v4: uuidv4 } = require("uuid")
const bcrypt = require("bcrypt")
const IMask = require("imask") 
const { generate_user_token } = require("./jwt")
const int_salt = 10

// router.post("/login", (request, response, next) => {

//     // SQL preparted statements
//     const qstring_get_account = `SELECT email, password from table_users WHERE email = ?`
//     const qstring_update_last_logged_in = `UPDATE table_users SET last_logged_in = ? WHERE email = ?`


//     // get request body information (email and password)
//     let string_email = request.body.email.trim().toLowerCase()
//     let string_password = request.body.password


//     // Email validation using regex
//     const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!email_regex.test(string_email)) {
//         return response.status(400).json({ error: "You must provide a valid email addresponses" });
//     }


//     // Password validation based on NIST standards
//     if (string_password.length < 8 ||
//         !/[A-Z]/.test(string_password) ||
//         !/[a-z]/.test(string_password) ||
//         !/[0-9]/.test(string_password) ||
//         !/[!@#$%^&*(),.?":{}|<>]/.test(string_password)) {
//         return response.status(400).json({ error: "Password must meet complexity requirements" });
//     }

//     // check if account is in account 
//     db.get(qstring_get_account, [string_email], (error, row) => {
//         // if cant access db or other issue
//         if (error) {
//             console.error(error)
//             return response.status(500).json({ error: "Database error" })
//         }

//         // If no user
//         if (!row) {
//             return response.status(401).json({ error: "Invalid email or password" })
//         }

//         // check password 
//         const bool_password_match = bcrypt.compareSync(string_password, row.password)
//         if (!bool_password_match) {
//             return response.status(401).json({ error: "Invalid email or password" })
//         }

//         // generate jwt token, send user email
//         const string_token = generate_user_token(row.email)

//         // email and password are valid and matched, update last_logged_in
//         const timestamp = new Date().toISOString()

//         db.run(qstring_update_last_logged_in, [timestamp, string_email], function (error) {
//             // if couldnt update
//             if (error) {
//                 console.error(error)
//                 return response.status(500).json({ error: "Failed to update last login" })
//             }

//             return response.status(200).json({ message: "Login successful", token: string_token })
//         })
//     })
// })

router.post("/login", (request, response, next) => {
    const qstring_get_account = `SELECT email, password FROM table_users WHERE email = ?`;
    const qstring_update_last_logged_in = `UPDATE table_users SET last_logged_in = ? WHERE email = ?`;

    let string_email = request.body.email.trim().toLowerCase();
    let string_password = request.body.password;

    // Email validation using regex
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_regex.test(string_email)) {
        return response.status(400).json({ error: "You must provide a valid email address" });
    }

    // Password validation based on NIST standards
    if (string_password.length < 8 ||
        !/[A-Z]/.test(string_password) ||
        !/[a-z]/.test(string_password) ||
        !/[0-9]/.test(string_password) ||
        !/[!@#$%^&*(),.?":{}|<>]/.test(string_password)) {
        return response.status(400).json({ error: "Password must meet complexity requirements" });
    }

    // Check if account exists
    db.get(qstring_get_account, [string_email], (error, row) => {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: "Database error" });
        }

        if (!row) {
            return response.status(401).json({ error: "Invalid email or password" });
        }

        // Check password
        const bool_password_match = bcrypt.compareSync(string_password, row.password);
        if (!bool_password_match) {
            return response.status(401).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const string_token = generate_user_token(row.email);

        // Update last_logged_in timestamp
        const timestamp = new Date().toISOString();
        db.run(qstring_update_last_logged_in, [timestamp, string_email], function (error) {
            if (error) {
                console.error(error);
                return response.status(500).json({ error: "Failed to update last login" });
            }

            // Return token and email
            return response.status(200).json({
                message: "Login successful",
                token: string_token,
                user_email: row.email
            });
        });
    });
});

// router.post("/register", (request, response, next) => {
    
//     // SQL Prepared statements
//     const qstring_check_email_exists = `SELECT email FROM table_users WHERE email = ?`
//     const qstring_insert_account = `INSERT INTO table_users (firstname, lastname, email, password, created_at, last_logged_in) VALUES (?, ?, ?, ?, ?, ?)`
//     const qstring_insert_socials = `INSERT INTO table_socials (email, discord, phone) VALUES (?, ?, ?)`


//     // get request body information 
//     let string_email = request.body.email.trim().toLowerCase()
//     let string_password = request.body.password
//     let string_first_name = request.body.first_name
//     let string_last_name = request.body.last_name
//     let string_phone_number = request.body.phone_number
//     let string_discord_username = request.body.discord_username


//     // Email validation using regex
//     const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!email_regex.test(string_email)) {
//         return response.status(400).json({ error: "You must provide a valid email addresponses" });
//     }


//     // Password validation based on NIST standards
//     if (string_password.length < 8 ||
//         !/[A-Z]/.test(string_password) ||
//         !/[a-z]/.test(string_password) ||
//         !/[0-9]/.test(string_password) ||
//         !/[!@#$%^&*(),.?":{}|<>]/.test(string_password)) {
//         return response.status(400).json({ error: "Password must meet complexity requirements" });
//     }


//     // First and last name not blank 
//     if (!string_first_name || string_first_name.length < 1) {
//         return response.status(400).json({ error: "First name must not be blank" })
//     }
//     if (!string_last_name || string_last_name.length < 1) {
//         return response.status(400).json({ error: "Last name must not be blank" })
//     }

//     // Phone validation 
//     const phoneRegex = /^\+1\(\d{3}\) \d{3}-\d{4}$/; // Regex for +1(XXX) XXX-XXXX format
//     if (!phoneRegex.test(string_phone_number)) {
//     return response.status(400).json({ error: "Invalid phone number format. Expected format: +1(XXX) XXX-XXXX" });
// }


//     // Discord Validation, can be empty 
//     // if empty, igore 
//     if (string_discord_username.length < 1) {
//         string_discord_username = null
//     }


//     const string_hashed_password = bcrypt.hashSync(string_password, int_salt)
//     const timestamp = new Date().toISOString()


//     // check email exists x 
//     db.get(qstring_check_email_exists, [string_email], (error, row) => {

//         // if cant access db or other issue
//         if (error) {
//             console.error(error)
//             return response.status(500).json({ error: "Database error" })
//         }

//         // if this row exists, account with this email already is made
//         if (row) {
//             return response.status(409).json({ error: "An account with this email already exists." })
//         }

//         // account doesnt exists, insert account information into the tables
//         db.run(qstring_insert_account, [string_first_name, string_last_name, string_email, string_hashed_password, timestamp, timestamp], function (error) {
//             if (error) {
//                 console.error(error)
//                 return response.status(500).json({ error: "Failed to create user account" })
//             }

//             // insert their phone number into table_socials, discord if not blank 
//             db.run(qstring_insert_socials, [string_email, string_discord_username || null, string_phone_number], function (error) {
//                 if (error) {
//                     console.error(error)
//                     return response.status(500).json({ error: "Failed to insert into socials table" })
//                 }

//                 const string_token = generate_user_token(string_email)

//                 return response.status(200).json({ message: "Account created successfully", token: string_token })
//             })
//         })
//     })
// })

router.post("/register", (request, response, next) => {
    const qstring_check_email_exists = `SELECT email FROM table_users WHERE email = ?`;
    const qstring_insert_account = `INSERT INTO table_users (firstname, lastname, email, password, created_at, last_logged_in) VALUES (?, ?, ?, ?, ?, ?)`;
    const qstring_insert_socials = `INSERT INTO table_socials (email, discord, phone) VALUES (?, ?, ?)`;

    let string_email = request.body.email.trim().toLowerCase();
    let string_password = request.body.password;
    let string_first_name = request.body.first_name;
    let string_last_name = request.body.last_name;
    let string_phone_number = request.body.phone_number;
    let string_discord_username = request.body.discord_username;

    // Email validation using regex
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_regex.test(string_email)) {
        return response.status(400).json({ error: "You must provide a valid email address" });
    }

    // Password validation based on NIST standards
    if (string_password.length < 8 ||
        !/[A-Z]/.test(string_password) ||
        !/[a-z]/.test(string_password) ||
        !/[0-9]/.test(string_password) ||
        !/[!@#$%^&*(),.?":{}|<>]/.test(string_password)) {
        return response.status(400).json({ error: "Password must meet complexity requirements" });
    }

    // First and last name validation
    if (!string_first_name || string_first_name.length < 1) {
        return response.status(400).json({ error: "First name must not be blank" });
    }
    if (!string_last_name || string_last_name.length < 1) {
        return response.status(400).json({ error: "Last name must not be blank" });
    }

    // Phone validation
    const phoneRegex = /^\+1\(\d{3}\) \d{3}-\d{4}$/;
    if (!phoneRegex.test(string_phone_number)) {
        return response.status(400).json({ error: "Invalid phone number format. Expected format: +1(XXX) XXX-XXXX" });
    }

    // Discord validation
    if (string_discord_username.length < 1) {
        string_discord_username = null;
    }

    const string_hashed_password = bcrypt.hashSync(string_password, int_salt);
    const timestamp = new Date().toISOString();

    // Check if email already exists
    db.get(qstring_check_email_exists, [string_email], (error, row) => {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: "Database error" });
        }

        if (row) {
            return response.status(409).json({ error: "An account with this email already exists." });
        }

        // Insert account information
        db.run(qstring_insert_account, [string_first_name, string_last_name, string_email, string_hashed_password, timestamp, timestamp], function (error) {
            if (error) {
                console.error(error);
                return response.status(500).json({ error: "Failed to create user account" });
            }

            // Insert phone and discord into socials table
            db.run(qstring_insert_socials, [string_email, string_discord_username || null, string_phone_number], function (error) {
                if (error) {
                    console.error(error);
                    return response.status(500).json({ error: "Failed to insert into socials table" });
                }

                // Generate JWT token
                const string_token = generate_user_token(string_email);

                // Return token and email
                return response.status(200).json({
                    message: "Account created successfully",
                    token: string_token,
                    user_email: string_email
                });
            });
        });
    });
});


module.exports = router