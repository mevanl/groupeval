const express = require("express")
const router = express.Router()
const db = require("../db/db")
const { v4: uuidv4 } = require("uuid")
const { verify_user_token } = require("./jwt")


// get all peer assessments for a course
router.get("/courses/:course_uuid/assessments", verify_user_token, (request, response, next) => {

    // SQL Prepared statments
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


// create peer review for a course (OWNER)
router.post("/courses/:course_uuid/assessments", verify_user_token, (request, response, next) => {

    // SQL prepared statment
    const qstring_create_assessment = `
        INSERT INTO table_assessments 
        (assessment_uuid, course_uuid, assessment_name, start_date, due_date, array_json_questions) 
        VALUES (?, ?, ?, ?, ?, ?)
    `

    // request info
    const string_course_uuid = request.params.course_uuid?.trim()
    const { assessment_name, start_date, due_date, array_json_questions } = request.body

    // validate request info
    if (!string_course_uuid || string_course_uuid.length < 1 ||
        !assessment_name || !start_date || !due_date || !array_json_questions) {
        return response.status(400).json({ error: "Missing required fields for creating assessment" })
    }

    // create our uuid for assessment
    const assessment_uuid = uuidv4()

    db.run(qstring_create_assessment, [
        assessment_uuid,
        string_course_uuid,
        assessment_name.trim(),
        start_date.trim(),
        due_date.trim(),
        JSON.stringify(array_json_questions)
    ], function (error) {
        // db error
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while creating assessment" })
        }

        return response.status(201).json({ message: "Assessment created successfully", assessment_uuid: assessment_uuid })
    })
})


// get your assigned peer review (STUDENT) 
router.get("/courses/:course_uuid/assessments/assigned", verify_user_token, (request, response, next) => {

    // SQL prepared statements
    const qstring_get_assigned_assessments = `
        SELECT * FROM table_assessments
        WHERE course_uuid = ?
        AND start_date <= CURRENT_TIMESTAMP
        AND due_date >= CURRENT_TIMESTAMP
    `
    // request info
    const string_course_uuid = request.params.course_uuid?.trim()

    // validate request
    if (!string_course_uuid || string_course_uuid.length < 1) {
        return response.status(400).json({ error: "Course UUID must not be blank" })
    }

    // get assessments
    db.all(qstring_get_assigned_assessments, [string_course_uuid], (error, rows) => {
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while fetching assigned assessments" })
        }

        return response.status(200).json({ assigned_assessments: rows })
    })
})


// // TODO: MAKE SURE ONLY THE QUESTIONS WITH PUBLIC GET RETURNED
// //  get public part of peer review submissions for your group (STUDENT GETS THIS, THEY CAN SEE THE PUBLIC SUBMISSIONS OF THEIR GROUP MEMBERS)
// router.get("/courses/:course_uuid/assessments/:assessment_uuid/public_submissions", verify_user_token, (request, response, next) => {

//     // SQL Prepared statements
//     const qstring_get_submissions = `
//         SELECT * FROM table_assessment_submissions
//         WHERE assessment_uuid = ?
//     `

//     // request info
//     const string_assessment_uuid = request.params.assessment_uuid?.trim()

//     // validate request 
//     if (!string_assessment_uuid || string_assessment_uuid.length < 1) {
//         return response.status(400).json({ error: "Assessment UUID must not be blank" })
//     }

//     // get all the submissions
//     db.all(qstring_get_submissions, [string_assessment_uuid], (error, rows) => {
//         // db error
//         if (error) {
//             console.error(error)
//             return response.status(500).json({ error: "Database error while fetching submissions" })
//         }

//         // no submissions 
//         if (!rows || rows.length === 0) {
//             return response.status(404).json({ error: "No submissions found for this assessment" })
//         }

//         // submissions exist, ONLY RETURN PUBLIC 
//         const public_submissions = rows.map(row => {
//             try {
//                 const full_submission = JSON.parse(row.submission_json)

//                 // Copy only public questions
//                 const public_questions = full_submission.questions.filter(q => q.public === true)

//                 const public_submission = {
//                     name: full_submission.name,
//                     start_date: full_submission.start_date,
//                     due_date: full_submission.due_date,
//                     status: full_submission.status,
//                     questions: public_questions,
//                     number_questions: public_questions.length,
//                 }

//                 return {
//                     submission_uuid: row.submission_uuid,
//                     user_email: row.user_email,
//                     date_submitted: row.date_submitted,
//                     public_submission: public_submission
//                 }
//             } catch (parseError) {
//                 console.error("Error parsing submission JSON:", parseError)
//                 return null
//             }
//         }).filter(sub => sub !== null) // Remove any parsing failures

//         // return public submissions
//         return response.status(200).json({ submissions: public_submissions })
//     })
// })


// new get public part of peer review submissions for group
router.get("/courses/:course_uuid/assessments/:assessment_uuid/public_submissions", verify_user_token, (request, response) => {
    const qstring_get_submissions = `
        SELECT * FROM table_assessment_submissions
        WHERE assessment_uuid = ?
    `;

    const string_assessment_uuid = request.params.assessment_uuid?.trim()

    if (!string_assessment_uuid || string_assessment_uuid.length < 1) {
        return response.status(400).json({ error: "Assessment UUID must not be blank" });
    }

    db.all(qstring_get_submissions, [string_assessment_uuid], (error, rows) => {
        if (error) {
            console.error(error);
            return response.status(500).json({ error: "Database error while fetching submissions" });
        }

        if (!rows || rows.length === 0) {
            return response.status(404).json({ error: "No submissions found for this assessment" });
        }

        const public_submissions = rows.map(row => {
            try {
                const full_submission = JSON.parse(row.submission_json)

                const questions = full_submission.responses?.questions || []
                const responses = full_submission.responses?.responses || []

                const public_indexes = questions
                    .map((q, i) => q.public === true ? i : -1)
                    .filter(i => i !== -1)

                const public_questions = public_indexes.map(i => questions[i])
                const public_responses = public_indexes.map(i => responses[i])

                return {
                    public_questions,
                    public_responses
                }
            } catch (parseError) {
                console.error("Error parsing submission JSON:", parseError)
                return null
            }
        }).filter(sub => sub !== null); // Filter out parse failures

        return response.status(200).json({ submissions: public_submissions })
    })
})



// get all submissions for a course (MUST BE OWNER OF THE COURSE)
router.get("/courses/:course_uuid/assessments/submissions", verify_user_token, (request, response, next) => {

    // SQL Prepared statements
    const qstring_get_owner_email = `SELECT owner_email FROM table_courses WHERE course_uuid = ?`
    const qstring_get_submissions = `
            SELECT s.*
            FROM table_assessment_submissions s
            JOIN table_assessments a ON s.assessment_uuid = a.assessment_uuid
            WHERE a.course_uuid = ?
        `

    // Request info
    const string_course_uuid = request.params.course_uuid?.trim()
    const string_owner_email = request.user.user_email

    // validate request
    if (!string_course_uuid || string_course_uuid.length < 1) {
        return response.status(400).json({ error: "Course UUID must not be blank" })
    }


    // verify ownership
    db.get(qstring_get_owner_email, [string_course_uuid], (error, row) => {
        // db error
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while checking course ownership" })
        }

        // no course found
        if (!row) {
            return response.status(404).json({ error: "Course not found" })
        }

        // they are not the owner 
        if (row.owner_email !== string_owner_email) {
            return response.status(403).json({ error: "Unauthorized access - not course owner" })
        }

        // this is the owner, get submissions
        db.all(qstring_get_submissions, [string_course_uuid], (error, rows) => {
            //db error
            if (error) {
                console.error(error)
                return response.status(500).json({ error: "Database error while fetching submissions" })
            }

            return response.status(200).json({ submissions: rows })
        })
    })

})


// get specific submission (USER MUST BE OWNER OF THE COURSE, UNLESS ITS YOUR SUBMISSION)
router.get("/courses/:course_uuid/assessments/:assessment_uuid/submissions/:submission_uuid", verify_user_token, (request, response, next) => {

    // SQL prepared statement
    const qstring_get_submission = `
        SELECT * FROM table_assessment_submissions
        WHERE submission_uuid = ?
    `
    const qstring_get_owner_email = `
        SELECT owner_email FROM table_courses
        WHERE course_uuid = ?
    `

    // request info
    const string_submission_uuid = request.params.submission_uuid?.trim()
    const string_course_uuid = request.params.course_uuid?.trim()
    const string_user_email = request.user.user_email

    // validate request 
    if (!string_submission_uuid || string_submission_uuid.length < 1) {
        return response.status(400).json({ error: "Submission UUID must not be blank" })
    }
    if (!string_course_uuid || string_course_uuid.length < 1) {
        return response.status(400).json({ error: "Course UUID must not be blank" })
    }

    // get submission 
    db.get(qstring_get_submission, [string_submission_uuid], (error, submission_row) => {
        // db error
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while fetching submission" })
        }

        // no submission
        if (!submission_row) {
            return response.status(404).json({ error: "Submission not found" })
        }

        // user is the one who submitted it
        if (submission_row.user_email === string_user_email) {
            return response.status(200).json({ submission: submission_row })
        }

        // course owner
        db.get(qstring_get_owner_email, [string_course_uuid], (error, owner_row) => {
            // db error
            if (error) {
                console.error(error)
                return response.status(500).json({ error: "Database error while checking course owner" })
            }

            // not owner, no access
            if (!owner_row) {
                return response.status(404).json({ error: "Course not found" })
            }

            // if this isnt the owner making request 
            if (owner_row.owner_email !== string_user_email) {
                return response.status(403).json({ error: "Unauthorized access - not submitter or course owner" })
            }

            // owner verified
            return response.status(200).json({ submission: submission_row })
        })
    })
})



// student submits their peer assessment
router.post("/courses/:course_uuid/assessments/:assessment_uuid/submit", verify_user_token, (request, response, next) => {

    // SQL Prepared statements
    const qstring_submit_assessment = `
        INSERT INTO table_assessment_submissions
        (submission_uuid, assessment_uuid, user_email, submission_json, date_submitted)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `
    // ^ unsure if date_submitted was missed here or meant to be added later, check back later to test

    // request info
    const string_course_uuid = request.params.course_uuid?.trim()
    const string_assessment_uuid = request.params.assessment_uuid?.trim()
    const { submission_json } = request.body
    const user_email = request.user?.email
    //const date_submitted = new Date().toISOString().replace("Z", ""); Check back later on this

    // validate request
    if (!string_course_uuid || !string_assessment_uuid || !submission_json || !user_email || !date_submitted) { //check back to see if date_submitted is correct
        return response.status(400).json({ error: "Missing required fields for submission" })
    }

    // create uuid
    const submission_uuid = uuidv4()

    // add to db 
    db.run(qstring_submit_assessment, [
        submission_uuid,
        string_assessment_uuid,
        user_email,
        JSON.stringify(submission_json),
        // date_submitted check back later on this
    ], function (error) {
        if (error) {
            console.error(error)
            return response.status(500).json({ error: "Database error while submitting assessment" })
        }

        return response.status(201).json({ message: "Assessment submitted successfully", submission_uuid: submission_uuid })
    })
})


module.exports = router