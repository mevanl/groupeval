,// question object is defined in peer review assignment obj

// obj peer review submission is sent to db, filter on responses

const object_peer_review_submission = {
    submitter_email: "",
    responses: [],

    // member name is who the feedback is for, questions is question obj
    // from peer_review_assignment.js and answers is answers to questions in orderf
    response_builder: function (string_member_name, array_questions, array_answers) {
        const object_new_response = {
            member_name: string_member_name,
            questions: array_questions,
            answers: array_answers
        }

        this.responses.push(object_new_response)
    },
}

module.exports = {object_peer_review_submission}