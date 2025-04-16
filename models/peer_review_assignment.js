const object_peer_review_assignment = {
    name: "",
    start_date: "",
    due_date: "",
    stauts: "", // open, closed, not open yet
    questions: [],
    number_questions: 0,

    // Initialize an assignment
    initialize_assignment: function (string_name, string_start_date, string_due_date, array_questions)  {
        this.name = string_name
        this.start_date = string_start_date
        this.due_date = string_due_date

        array_questions.forEach(question => {
            this.create_question(question.public, question.question_type, question.question_name, question.mcq_choices)
        }) 
    },

    // Creates a new question and pushes to array, validation is done on frontend 
    create_question: function (bool_pub_pri, string_question_type, string_question_name, array_mcq_choices) {
        const object_new_question = {
            public: bool_pub_pri, 
            question_type: string_question_type,
            question_name: string_question_name,
            mcq_choices: array_mcq_choices,
        }

        this.questions.push(object_new_question)
        this.number_questions++ 

        return object_new_question // if you want this object, not neccessary just for creating however
    },

    
    // if teacher updates assignment, they can remove questions 
    remove_question: function (int_index) {
        if (questions.length > 0) {
            this.questions.splice(int_index, 1)
        } else {
            console.error("questions array is empty, can not remove_question.")
        }
    },
    
    // manages the status of assignment as open, closed, or not open yet 
    update_status: function (string_start_date, string_due_date) {
        
    },

    // if teacher updates assignment, can change dates 
    // validation handled on frontend 
    update_date: function (string_start_date, string_due_date) {
        this.start_date = string_start_date
        this.due_date = string_due_date
    },

}

module.exports = { object_peer_review_assignment } 