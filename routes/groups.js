const express = require("express")
const router = express.Router()
const db = require("../db/db")
const { v4: uuidv4 } = require("uuid")


// get groups for a given course 
router.get("/get_course_groups", (response, request, next) => {

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


// Create a group for a given course 
router.post("/create_course_group", (request, response, next) => {

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


// Join a group for a given course you are enrolled in already 
router.post("/join_course_group", (request, response, next) => {
    
})

module.exports = router