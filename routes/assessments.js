const express = require("express")
const router = express.Router()
const db = require("../db/db")
const { v4: uuidv4 } = require("uuid")
const { verify_user_token } = require("./jwt")


// for a given course uuid, get all peer review assessment from db (stores as text, its json)
router.get("/course/:course_uuid/assessments", verify_user_token, (request, response, next) => {

    // SQL Prepared statement
    const qstring_get_assessments_by_course = `SELECT * FROM table_assessments WHERE course_uuid = ?`

    // request info
    const string_course_uuid = request.params.course_uuid?.trim()

    // validate request info
    if (!string_course_uuid || string_course_uuid.length < 1) {
        return response.status(400).json({ error: "Course UUID must not be blank" })
    }

    // get assessments
    db.all(qstring_get_assessments_by_course, [string_course_uuid], (error, rows) => {
        // db error
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while fetching assessments" })
        }

        return response.status(200).json({ assessments: rows })
    })
    
})


// for a given course, create a peer review assessment and store in db as text (json object)
router.post("/course/:course_uuid/assessments", verify_user_token, (request, response, next) => {

    // SQL Prepared statements
    const qstring_check_course_exists = `SELECT course_uuid FROM table_courses WHERE course_uuid = ?`
    const qstring_insert_assessment = `INSERT INTO table_assessments (assessment_uuid, course_uuid, assessment_name, assessment_json) VALUES (?, ?, ?, ?)`

    // request info
    const string_course_uuid = request.params.course_uuid?.trim()
    const string_assessment_name = request.body.assessment_name?.trim()
    const string_assessment_json = JSON.stringify(request.body.assessment_json)

    // validate request info
    if (!string_course_uuid || string_course_uuid.length < 1) {
        return response.status(400).json({ error: "Course UUID must not be blank" })
    }
    if (!string_assessment_name || string_assessment_name.length < 1) {
        return response.status(400).json({ error: "Assessment name must not be blank" })
    }
    if (!string_assessment_json || string_assessment_json.length < 1) {
        return response.status(400).json({ error: "Assessment JSON must not be blank" })
    }

    // check if course exists
    db.get(qstring_check_course_exists, [string_course_uuid], (error, course_row) => {
        // db error
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while checking course" })
        }

        // course doesn't exist
        if (!course_row) {
            return response.status(404).json({ error: "Course not found" })
        }

        // create assessment UUID and insert into DB
        const string_assessment_uuid = uuidv4()
        db.run(qstring_insert_assessment, [string_assessment_uuid, string_course_uuid, string_assessment_name, string_assessment_json], function (error) {
            // db error
            if (error) {
                console.error(error)
                return response.status(500).json({ error: "Failed to create assessment" })
            }

            return response.status(200).json({
                message: "Assessment created successfully",
                assessment_uuid: string_assessment_uuid
            })
        })
    })

})


// get assigned assessments for a student in a course
router.get("/courses/:course_uuid/assessments/assigned", verify_user_token, (request, response, next) => {

    // SQL Prepared statement
    const qstring_get_assigned_assessment = `
        SELECT a.assessment_uuid, a.assessment_name, a.assessment_json
        FROM table_assessments a
        INNER JOIN table_student_assessments sa ON a.assessment_uuid = sa.assessment_uuid
        WHERE a.course_uuid = ? AND sa.student_uuid = ?
    `

    // request info
    const string_course_uuid = request.params.course_uuid?.trim()
    const string_student_uuid = request.query.student_uuid?.trim()

    // validate request info
    if (!string_course_uuid || string_course_uuid.length < 1 || !string_student_uuid || string_student_uuid.length < 1) {
        return response.status(400).json({ error: "Course UUID and Student UUID must not be blank" })
    }

    // get assigned assessments
    db.all(qstring_get_assigned_assessment, [string_course_uuid, string_student_uuid], (error, rows) => {
        // db error
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while fetching assigned assessments" })
        }

        return response.status(200).json({ assessments: rows })
    })
})

// get public peer review feedback for a given assessment
router.get("/courses/:course_uuid/assessments/:assessment_uuid/public", verify_user_token, (request, response, next) => {

    // SQL Prepared statement
    const qstring_get_public_feedback = `
        SELECT feedback_json
        FROM table_assessments
        WHERE assessment_uuid = ? AND feedback_visibility = 'public'
    `

    // request info
    const string_assessment_uuid = request.params.assessment_uuid?.trim()

    // validate request info
    if (!string_assessment_uuid || string_assessment_uuid.length < 1) {
        return response.status(400).json({ error: "Assessment UUID must not be blank" })
    }

    // get public feedback
    db.get(qstring_get_public_feedback, [string_assessment_uuid], (error, row) => {
        // db error
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while fetching public feedback" })
        }

        // no public feedback found
        if (!row) {
            return response.status(404).json({ error: "No public feedback found for this assessment" })
        }

        return response.status(200).json({ feedback: row.feedback_json })
    })
})

// list all submissions for a course
router.get("/courses/:course_uuid/assessments/submissions", verify_user_token, (request, response, next) => {

    // SQL Prepared statement
    const qstring_get_submissions = `SELECT assessment_uuid, student_uuid, submission_json FROM table_assessments WHERE course_uuid = ?`

    // request info
    const string_course_uuid = request.params.course_uuid?.trim()

    // validate request info
    if (!string_course_uuid || string_course_uuid.length < 1) {
        return response.status(400).json({ error: "Course UUID must not be blank" })
    }

    // get submissions
    db.all(qstring_get_submissions, [string_course_uuid], (error, rows) => {
        // db error
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while fetching submissions" })
        }

        return response.status(200).json({ submissions: rows })
    })
})

// get a specific assessment submission for a course
router.get("/courses/:course_uuid/assessments/:assessment_uuid/submission", verify_user_token, (request, response, next) => {

    // SQL Prepared statement
    const qstring_get_submission = `SELECT * FROM table_assessments WHERE assessment_uuid = ? AND course_uuid = ?`

    // request info
    const string_assessment_uuid = request.params.assessment_uuid?.trim()
    const string_course_uuid = request.params.course_uuid?.trim()

    // validate request info
    if (!string_assessment_uuid || string_assessment_uuid.length < 1 || !string_course_uuid || string_course_uuid.length < 1) {
        return response.status(400).json({ error: "Assessment UUID and Course UUID must not be blank" })
    }

    // get submission
    db.get(qstring_get_submission, [string_assessment_uuid, string_course_uuid], (error, row) => {
        // db error
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while fetching submission" })
        }

        // no submission found
        if (!row) {
            return response.status(404).json({ error: "Submission not found" })
        }

        return response.status(200).json({ submission: row })
    })
})

module.exports = router