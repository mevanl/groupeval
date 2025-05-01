const express = require("express")
const router = express.Router()
const db = require("../db/db")
const { v4: uuidv4 } = require("uuid")
const { verify_user_token } = require("./jwt")
const nodemailer = require("nodemailer");



// list all groups for a course
router.get("/courses/:course_uuid/groups", verify_user_token, (request, response, next) => {
    
    // SQL Prepared statement
    const qstring_get_groups_by_course = `SELECT * FROM table_groups WHERE course_uuid = ?`

    // request info
    const string_course_uuid = request.params.course_uuid?.trim()

    // validate request info
    if (!string_course_uuid || string_course_uuid.length < 1) {
        return response.status(400).json({ error: "Course UUID must not be blank" })
    }

    // get groups
    db.all(qstring_get_groups_by_course, [string_course_uuid], (error, rows) => {
        // db error
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while fetching groups" })
        }

        return response.status(200).json({ groups: rows })
    })
})


// create new group for course
router.post("/courses/:course_uuid/groups", verify_user_token, (request, response, next) => {
    // SQL Prepared statements
    const qstring_check_course_exists = `SELECT name FROM table_courses WHERE course_uuid = ?`;
    const qstring_check_group_conflict = `SELECT group_name FROM table_groups WHERE group_name = ? AND course_uuid = ?`;
    const qstring_insert_group = `INSERT INTO table_groups (group_name, course_uuid, group_uuid) VALUES (?, ?, ?)`;

    // Request info
    const string_course_uuid = request.params.course_uuid?.trim();
    const string_group_name = request.body.group_name?.trim();
    const array_student_emails = request.body.students; // Array of student emails

    // Validate request
    if (!string_course_uuid || string_course_uuid.length < 1) {
        return response.status(400).json({ error: "Course UUID must not be blank" });
    }
    if (!string_group_name || string_group_name.length < 1) {
        return response.status(400).json({ error: "Group name must not be blank" });
    }
    if (!array_student_emails || array_student_emails.length === 0) {
        return response.status(400).json({ error: "You must select at least one student." });
    }

    // Check if course exists
    db.get(qstring_check_course_exists, [string_course_uuid], (error, course_row) => {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: "Database error while checking course" });
        }

        // Course doesn't exist
        if (!course_row) {
            return response.status(404).json({ error: "Course not found" });
        }

        const string_course_name = course_row.name; // Get the course name

        // Check if group name is unique
        db.get(qstring_check_group_conflict, [string_group_name, string_course_uuid], (error, group_row) => {
            if (error) {
                console.error(error);
                return response.status(500).json({ error: "Database error while checking group name" });
            }

            // Group name not unique
            if (group_row) {
                return response.status(409).json({ error: "Group name already exists in this course" });
            }

            // Create group UUID and insert into database
            const string_group_uuid = uuidv4();

            // Send emails to students
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "group.evaluation.do.no.reply@gmail.com",
                    pass: "nzalvezfboltmbve", // Replace with your app password
                },
            });

            const emailPromises = array_student_emails.map((email) => {
                const mailOptions = {
                    from: "group.evaluation.do.no.reply@gmail.com",
                    to: email,
                    subject: `Invitation to Join Group: ${string_group_name}`,
                    text: `You have been invited to join the group "${string_group_name}" in the "${string_course_name}" class. Use the following group UUID to join: ${string_group_uuid}`,
                };

                return transporter.sendMail(mailOptions);
            });

            Promise.all(emailPromises)
                .then(() => {
                    // Insert the group into the database
                    db.run(qstring_insert_group, [string_group_name, string_course_uuid, string_group_uuid], function (error) {
                        if (error) {
                            console.error(error);
                            return response.status(500).json({ error: "Failed to create group" });
                        }

                        return response.status(200).json({
                            message: "Group created successfully and emails sent to students.",
                            group_uuid: string_group_uuid,
                        });
                    });
                })
                .catch((emailError) => {
                    console.error("Error sending emails:", emailError);
                    return response.status(500).json({ error: "Group created but failed to send emails to students." });
                });
        });
    });
});



// join a group (must be in course already)
router.post("/groups/:group_uuid/members", verify_user_token, (request, response, next) => {
    const qstring_get_group_info = `SELECT course_uuid FROM table_groups WHERE group_uuid = ?`;
    const qstring_check_enrollment = `SELECT * FROM table_course_enrollments WHERE course_uuid = ? AND user_email = ?`;
    const qstring_add_to_group = `INSERT INTO table_group_membership (group_uuid, user_email) VALUES (?, ?)`;

    const string_group_uuid = request.params.group_uuid?.trim();
    const string_user_email = request.body.user_email?.trim(); // Use email instead of UUID

    if (!string_group_uuid || string_group_uuid.length < 1) {
        return response.status(400).json({ error: "Group UUID must not be blank" });
    }

    if (!string_user_email || string_user_email.length < 1) {
        return response.status(400).json({ error: "User email must not be blank" });
    }

    // Get group info
    db.get(qstring_get_group_info, [string_group_uuid], (error, group_row) => {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: "Database error while fetching group info" });
        }

        if (!group_row) {
            return response.status(404).json({ error: "Group not found" });
        }

        const string_course_uuid = group_row.course_uuid;

        // Check if the user is enrolled in the course
        db.get(qstring_check_enrollment, [string_course_uuid, string_user_email], (error, enrollment_row) => {
            if (error) {
                console.error(error);
                return response.status(500).json({ error: "Database error while checking enrollment" });
            }

            if (!enrollment_row) {
                return response.status(403).json({ error: "You are not enrolled in the course for this group" });
            }

            // Add the user to the group
            db.run(qstring_add_to_group, [string_group_uuid, string_user_email], function (error) {
                if (error) {
                    console.error(error);
                    return response.status(500).json({ error: "Failed to join group" });
                }

                return response.status(200).json({ message: "Joined group successfully" });
            });
        });
    });
});

// list all members of a group
router.get("/groups/:group_uuid/members", verify_user_token, (request, response, next) => {
    const qstring_get_group_members = `
        SELECT 
            u.firstname || ' ' || u.lastname AS full_name,
            u.email,
            s.phone,
            s.discord
        FROM table_group_membership gm
        INNER JOIN table_users u ON gm.user_email = u.email
        LEFT JOIN table_socials s ON u.email = s.email
        WHERE gm.group_uuid = ?
    `;

    const string_group_uuid = request.params.group_uuid?.trim();

    if (!string_group_uuid || string_group_uuid.length < 1) {
        return response.status(400).json({ error: "Group UUID must not be blank" });
    }

    db.all(qstring_get_group_members, [string_group_uuid], (error, rows) => {
        if (error) {
            console.error("Database error:", error);
            return response.status(500).json({ error: "Database error while fetching group members" });
        }

        return response.status(200).json({ members: rows });
    });
});

// remove student from group
router.delete("/groups/:group_uuid/members/:student_uuid", verify_user_token, (request, response, next) => {
    
    // SQL prepared statement
    const qstring_remove_student = `DELETE FROM table_group_members WHERE group_uuid = ? AND student_uuid = ?`

    // request info
    const string_group_uuid = request.params.group_uuid?.trim()
    const string_student_uuid = request.params.student_uuid?.trim()

    // validate request info
    if (!string_group_uuid || string_group_uuid.length < 1 || !string_student_uuid || string_student_uuid.length < 1) {
        return response.status(400).json({ error: "Group UUID and Student UUID must not be blank" })
    }

    // remove from group 
    db.run(qstring_remove_student, [string_group_uuid, string_student_uuid], function (error) {
        // db error
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Failed to remove student from group" })
        }

        // user was never even in group 
        if (this.changes === 0) {
            return response.status(404).json({ error: "Student not found in group" })
        }


        // success 
        return response.status(200).json({ message: "Student removed from group successfully" })
    })
})

// get a given student's group in a course
router.get("/courses/:course_uuid/:student_email/group", verify_user_token, (request, response, next) => {
    const qstring_find_student_group = `
        SELECT g.group_uuid, g.group_name
        FROM table_group_membership gm
        INNER JOIN table_groups g ON gm.group_uuid = g.group_uuid
        WHERE gm.user_email = ? AND g.course_uuid = ?
    `;

    const string_course_uuid = request.params.course_uuid?.trim();
    const string_student_email = request.params.student_email?.trim();

    if (!string_course_uuid || string_course_uuid.length < 1 || !string_student_email || string_student_email.length < 1) {
        return response.status(400).json({ error: "Course UUID and Student Email must not be blank" });
    }

    db.get(qstring_find_student_group, [string_student_email, string_course_uuid], (error, group_row) => {
        if (error) {
            console.error("Database error:", error); // Log the error for debugging
            return response.status(500).json({ error: "Database error while finding group" });
        }

        if (!group_row) {
            return response.status(404).json({ error: "Student is not in any group for this course" });
        }

        return response.status(200).json({ group: group_row });
    });
});

module.exports = router