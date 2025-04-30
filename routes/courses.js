const express = require("express")
const router = express.Router()
const db = require("../db/db")
const { v4: uuidv4 } = require("uuid")
const { verify_user_token } = require("./jwt")
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "group.evaluation.do.no.reply@gmail.com", 
        pass: "nzalvezfboltmbve", // Place the APP PASSWORD here 
    },
})


// get courses a user is teacher (owner) of
router.get("/user/:email/courses/teaching", verify_user_token, (request, response, next) => {
    
    // SQL prepared statements
    const qstring_check_user_exists = `SELECT email FROM table_users WHERE email = ?`
    const qstring_get_teaching_courses = `SELECT name, course_uuid FROM table_courses WHERE owner_email = ?`

    // get request info
    const string_email = request.params.email?.trim().toLowerCase()

    // validate request info 
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_regex.test(string_email)) {
        return response.status(400).json({ error: "You must provide a valid email address" });
    }

    // Confirm this user exists 
    db.get(qstring_check_user_exists, [string_email], (error, row) => {

        // db error
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while checking user" })
        }

        // if the user doesnt exist
        if (!row) {
            return response.status(404).json({ error: "User not found" })
        }

        // user exists, get courses they teach
        db.all(qstring_get_teaching_courses, [string_email], (error, rows) => {

            // db error
            if (error) {
                console.error(error)
                return response.status(500).json({ error: "Failed to get teaching courses" })
            }

            return response.status(200).json({ teaching_courses: rows  || [] })
        })
    })
})      


// get courses a user is enrolled (student) in
router.get("/user/:email/courses/enrolled", verify_user_token, (request, response, next) => {

    // SQL Prepared statements
    const qstring_check_user_exists = `SELECT email FROM table_users WHERE email = ?`
    const qstring_get_enrolled_courses = `
        SELECT c.name, c.course_uuid
        FROM table_courses c
        JOIN table_course_enrollments e ON c.course_uuid = e.course_uuid
        WHERE e.user_email = ? AND c.owner_email != ?
    `

    // get request info
    const string_email = request.params.email?.trim().toLowerCase()

    // validate request info 
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_regex.test(string_email)) {
        return response.status(400).json({ error: "You must provide a valid email address" });
    }


    // confirm user exists
    db.get(qstring_check_user_exists, [string_email], (error, row) => {
        // db error
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while confirming user existence" })
        }

        // if they do not exist
        if (!row) {
            return response.status(404).json({ error: "User not found" })
        }

        // User exists, get enrolled courses 
        db.all(qstring_get_enrolled_courses, [string_email, string_email], (error, rows) => {
            // db error
            if (error) {
                console.error(error)
                return response.status(500).json({ error: "Failed to retrieve enrolled courses" })
            }

            // return enrolled courses 
            return response.status(200).json({ enrolled_courses: rows })
        })
    })
})


// Create a new course, the user who creates is the owner/teacher
router.post("/courses", verify_user_token, (request, response, next) => {
    // SQL Prepared statements
    const qstring_check_user_exists = `SELECT email FROM table_users WHERE email = ?`;
    const qstring_check_unique_course_name_for_owner = `SELECT course_uuid FROM table_courses WHERE name = ? AND owner_email = ?`;
    const qstring_insert_new_course = `INSERT INTO table_courses (course_uuid, name, owner_email) VALUES (?, ?, ?)`;

    // Get request info
    const string_course_name = request.body.course_name?.trim();
    const string_owner_email = request.body.owner_email?.trim().toLowerCase();
    const array_student_emails = request.body.student_emails?.split(",").map(email => email.trim().toLowerCase());

    // Debugging: Log the request data
    console.log("Request Body:", request.body);

    // Validate request info
    if (!string_course_name || string_course_name.length === 0) {
        return response.status(400).json({ error: "Course name cannot be empty" });
    }

    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_regex.test(string_owner_email)) {
        return response.status(400).json({ error: "You must provide a valid email address for the course owner" });
    }

    if (!array_student_emails || array_student_emails.length === 0 || !array_student_emails.every(email => email_regex.test(email))) {
        return response.status(400).json({ error: "You must provide at least one valid student email address" });
    }

    // Check if the owner exists
    db.get(qstring_check_user_exists, [string_owner_email], (error, row) => {
        if (error) {
            console.error("Error checking owner existence:", error);
            return response.status(500).json({ error: "Error when validating email exists in DB" });
        }

        if (!row) {
            return response.status(404).json({ error: "Owner email not found" });
        }

        // Check if the course name is unique for the owner
        db.get(qstring_check_unique_course_name_for_owner, [string_course_name, string_owner_email], (error, row) => {
            if (error) {
                console.error("Error checking unique course name:", error);
                return response.status(500).json({ error: "Error when validating unique course in DB" });
            }

            if (row) {
                return response.status(409).json({ error: "You already own a course with this name" });
            }

            // Insert the course
            const string_course_uuid = uuidv4();
            db.run(qstring_insert_new_course, [string_course_uuid, string_course_name, string_owner_email], (error) => {
                if (error) {
                    console.error("Error inserting new course:", error);
                    return response.status(500).json({ error: "Database error when creating course" });
                }

                // Send emails to students with the enrollment code
                const emailPromises = array_student_emails.map(email => {
                    const mailOptions = {
                        from: "group.evaluation.do.no.reply@gmail.com",
                        to: email,
                        subject: "Class Enrollment Invitation",
                        text: `You have been invited to join the class "${string_course_name}". Use the following code to enroll: ${string_course_uuid}`,
                    };

                    return transporter.sendMail(mailOptions);
                });

                Promise.all(emailPromises)
                    .then(() => {
                        return response.status(201).json({
                            message: "Course created successfully. Emails sent to students with the enrollment code.",
                            course: {
                                name: string_course_name,
                                course_uuid: string_course_uuid,
                                owner_email: string_owner_email,
                                students: array_student_emails,
                            },
                        });
                    })
                    .catch((emailError) => {
                        console.error("Error sending emails:", emailError);
                        return response.status(500).json({
                            error: "Course created but failed to send emails to students",
                        });
                    });
            });
        });
    });
});


// Enroll a user in a course 
router.post("/courses/:course_uuid/enroll", verify_user_token, (request, response, next) => {

    //SQL prepared statements
    const qstring_check_user_exists = `SELECT email FROM table_users WHERE email = ?`
    const qstring_check_course_exists = `SELECT course_uuid FROM table_courses WHERE course_uuid = ?`
    const qstring_check_already_enrolled = `SELECT * FROM table_course_enrollments WHERE course_uuid = ? AND user_email = ?`
    const qstring_insert_enrollment = `INSERT INTO table_course_enrollments (course_uuid, user_email) VALUES (?, ?)`


    // request info 
    const string_course_uuid = request.params.course_uuid?.trim()
    const string_user_email = request.body.user_email?.trim().toLowerCase()


    // validate request info
    const uuid_regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!string_course_uuid || !uuid_regex.test(string_course_uuid)) {
        return response.status(400).json({ error: "Invalid course UUID format" })
    }

    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!string_user_email || !email_regex.test(string_user_email)) {
        return response.status(400).json({ error: "Invalid user email address" })
    }

    // check course exist 
    db.get(qstring_check_course_exists, [string_course_uuid], (error, course_row) => {
        // db error
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while checking course existence" })
        }

        // no course found
        if (!course_row) {
            return response.status(404).json({ error: "Course not found" })
        }

        // course exists, check user next
        db.get(qstring_check_user_exists, [string_user_email], (error, user_row) => {
            // db error
            if (error) {
                console.error(error)
                return response.status(500).json({ error: "Database error while checking user existence" })
            }

            // no user found
            if (!user_row) {
                return response.status(404).json({ error: "User not found" })
            }

            // user exist, check if that user is enrolled in this course yet
            db.get(qstring_check_already_enrolled, [string_course_uuid, string_user_email], (error, row) => {
                // db error
                if (error) {
                    console.error(error)
                    return response.status(500).json({ error: "Database error while checking if user enrolled" })
                }

                // no user found
                if (row) {
                    return response.status(409).json({ error: "User is already enrolled in the course" })
                }

                // enroll user in db
                db.run(qstring_insert_enrollment, [string_course_uuid, string_user_email], (error) => {
                    if (error) {
                        return response.status(500).json({ error: "Database error when enrolling new user" })
                    }

                    return response.status(201).json({ message: "User enrolled successfully" })
                })
            })
        })
    })
})


// Get all enrolled students for a course 
router.get("/courses/:course_uuid/students", verify_user_token, (request, response, next) => {
    
    // SQL prepared statements
    const qstring_check_course_exists = `SELECT course_uuid FROM table_courses WHERE course_uuid = ?`
    const qstring_get_students = `
        SELECT u.firstname, u.lastname, u.email
        FROM table_course_enrollments e
        JOIN table_users u ON e.user_email = u.email
        WHERE e.course_uuid = ?
    `

    // request info 
    const string_course_uuid = request.params.course_uuid?.trim()


    // validate request info
    const uuid_regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuid_regex.test(string_course_uuid)) {
        return response.status(400).json({ error: "Invalid course UUID format" })
    }


    // check course exist
    db.get(qstring_check_course_exists, [string_course_uuid], (error, course_row) => {
        // db error
        if (error) {
            return response.status(500).json({ error: "Database error while checking course existence" })
        }

        // course doesnt exist
        if (!course_row) {
            return response.status(404).json({ error: "Course not found" })
        }

        // course exist, get all users
        db.all(qstring_get_students, [string_course_uuid], (error, student_rows) => {
            // db error
            if (error) {
                return response.status(500).json({ error: "Database error while getting all students" })
            }

            // return students
            return response.status(200).json({
                course_uuid: string_course_uuid,
                students: student_rows // each: { firstname, lastname, email }
            })
        })
    })
})


router.get("/user/:email", (request, response, next) => {
    const qstring_get_user_info = `
        SELECT firstname, lastname 
        FROM table_users 
        WHERE email = ?
    `;

    const string_email = request.params.email?.trim().toLowerCase();

    // Validate email format
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_regex.test(string_email)) {
        return response.status(400).json({ error: "Invalid email format" });
    }

    // Fetch user info
    db.get(qstring_get_user_info, [string_email], (error, row) => {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: "Database error while fetching user info" });
        }

        if (!row) {
            return response.status(404).json({ error: "User not found" });
        }

        return response.status(200).json({
            firstname: row.firstname,
            lastname: row.lastname,
        });
    });
});

router.get("/courses/:course_uuid", verify_user_token, (request, response, next) => {
    const qstring_get_course_details = `
    SELECT c.name, c.owner_email,
           u.firstname AS teacher_firstname,
           u.lastname AS teacher_lastname,
           s.email AS teacher_email,
           s.phone AS teacher_phone
    FROM table_courses c
    JOIN table_users u ON c.owner_email = u.email
    JOIN table_socials s ON u.email = s.email
    WHERE c.course_uuid = ?
    `;

    const string_course_uuid = request.params.course_uuid?.trim();

    // Validate course UUID
    const uuid_regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuid_regex.test(string_course_uuid)) {
        return response.status(400).json({ error: "Invalid course UUID format" });
    }

    // Fetch course details
    db.get(qstring_get_course_details, [string_course_uuid], (error, row) => {
        if (error) {
            console.error("Database error:", error);
            return response.status(500).json({ error: "Database error while fetching course details" });
        }

        if (!row) {
            return response.status(404).json({ error: "Course not found" });
        }

        return response.status(200).json({ course: row });
    });
});


// Unenroll a user [NOT MVP]
router.delete("/courses/:course_uuid/unenroll", verify_user_token, (request, response, next) => {

})


// Rename a course [NOT MVP]
router.patch("/courses/:course_uuid", verify_user_token, (request, response, next) => {

})


module.exports = router