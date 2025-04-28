const express = require("express")
const router = express.Router()
const db = require("../db/db")
const { v4: uuidv4 } = require("uuid")
const { verify_user_token } = require("./jwt")


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
    const qstring_check_course_exists = `SELECT course_uuid FROM table_courses WHERE course_uuid = ?`
    const qstring_check_group_conflict = `SELECT group_name FROM table_groups WHERE group_name = ? AND course_uuid = ?`
    const qstring_insert_group = `INSERT INTO table_groups (group_name, course_uuid, group_uuid) VALUES (?, ?, ?)`

    // request info
    const string_course_uuid = request.params.course_uuid?.trim()
    const string_group_name = request.body.group_name?.trim()


    // validate request 
    if (!string_course_uuid || string_course_uuid.length < 1) {
        return response.status(400).json({ error: "Course UUID must not be blank" })
    }
    if (!string_group_name || string_group_name.length < 1) {
        return response.status(400).json({ error: "Group name must not be blank" })
    }

    // check course exist
    db.get(qstring_check_course_exists, [string_course_uuid], (error, course_row) => {
        // db error 
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while checking course" })
        }

        // course doesnt exist
        if (!course_row) {
            return response.status(404).json({ error: "Course not found" })
        }

        // course exist, check unique group name
        db.get(qstring_check_group_conflict, [string_group_name, string_course_uuid], (error, group_row) => {
            // db error
            if (error) {
                console.error(error)
                return response.status(500).json({ error: "Database error while checking group name" })
            }

            // group not unique
            if (group_row) {
                return response.status(409).json({ error: "Group name already exists in this course" })
            }

            // create group_uuid and insert into db 
            const string_group_uuid = uuidv4()
            db.run(qstring_insert_group, [string_group_name, string_course_uuid, string_group_uuid], function (error) {
                // db error 
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

// join a group (must be in course already)
router.post("/groups/:group_uuid/members", verify_user_token, (request, response, next) => {
    
    // SQL Prepared statements
    const qstring_get_group_info = `SELECT course_uuid FROM table_groups WHERE group_uuid = ?`
    const qstring_check_enrollment = `SELECT enrollment_uuid FROM table_enrollments WHERE course_uuid = ? AND student_uuid = ?`
    const qstring_add_to_group = `INSERT INTO table_group_members (group_uuid, student_uuid) VALUES (?, ?)`
    
    // Request info 
    const string_group_uuid = request.params.group_uuid?.trim()
    const string_student_uuid = request.body.student_uuid?.trim()

    // validate request info 
    if (!string_group_uuid || string_group_uuid.length < 1) {
        return response.status(400).json({ error: "Group UUID must not be blank" })
    }
    if (!string_student_uuid || string_student_uuid.length < 1) {
        return response.status(400).json({ error: "Student UUID must not be blank" })
    }


    // get group info 
    db.get(qstring_get_group_info, [string_group_uuid], (error, group_row) => {
        
        // db error
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while fetching group info" })
        }

        // group not exist
        if (!group_row) {
            return response.status(404).json({ error: "Group not found" })
        }

        // check user enrolled in course
        db.get(qstring_check_enrollment, [group_row.course_uuid, string_student_uuid], (error, enrollment_row) => {
            
            // db error
            if (error) {
                console.error(error)
                return response.status(500).json({ error: "Database error while checking enrollment" })
            }

            // student not in course
            if (!enrollment_row) {
                return response.status(403).json({ error: "Student not enrolled in the course" })
            }
            
            // user in course and group exist, add to group
            db.run(qstring_add_to_group, [string_group_uuid, string_student_uuid], function (error) {
                // db error
                if (error) {
                    console.error(error)
                    return response.status(500).json({ error: "Failed to join group" })
                }

                return response.status(200).json({ message: "Joined group successfully" })
            })
        })
    })
})

// list all members of a group
router.get("/groups/:group_uuid/members", verify_user_token, (request, response, next) => {
  
    // SQL Prepared statement
    const qstring_get_group_members = `
        SELECT table_students.student_uuid, table_students.student_name, table_students.student_email
        FROM table_group_members
        INNER JOIN table_students ON table_group_members.student_uuid = table_students.student_uuid
        WHERE group_uuid = ?
    `

    // Request info
    const string_group_uuid = request.params.group_uuid?.trim()

    // validate request info
    if (!string_group_uuid || string_group_uuid.length < 1) {
        return response.status(400).json({ error: "Group UUID must not be blank" })
    }


    // get group members
    db.all(qstring_get_group_members, [string_group_uuid], (error, rows) => {
        // db error
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while fetching group members" })
        }

        return response.status(200).json({ members: rows })
    })
})

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
    
    // SQL prepared statements
    const qstring_find_student_group = `
        SELECT g.group_uuid, g.group_name
        FROM table_students s
        INNER JOIN table_group_members gm ON s.student_uuid = gm.student_uuid
        INNER JOIN table_groups g ON gm.group_uuid = g.group_uuid
        WHERE s.student_email = ? AND g.course_uuid = ?
    `

    // request info
    const string_course_uuid = request.params.course_uuid?.trim()
    const string_student_email = request.params.student_email?.trim()

    // validate request info 
    if (!string_course_uuid || string_course_uuid.length < 1 || !string_student_email || string_student_email.length < 1) {
        return response.status(400).json({ error: "Course UUID and Student Email must not be blank" })
    }


    // find group for a given student
    db.get(qstring_find_student_group, [string_student_email, string_course_uuid], (error, group_row) => {
        // db error 
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while finding group" })
        }

        // student not in group 
        if (!group_row) {
            return response.status(404).json({ error: "Student is not in any group for this course" })
        }

        return response.status(200).json({ group: group_row })
    })
})

module.exports = router