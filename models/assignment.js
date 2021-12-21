const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    assigmentId: { type: String, required: true, unique: true },
    assigmentName: { type: String, required: true},
    teacherId: { type: String, required: true },
    subjectName:{ type: String, required: true },
    lessionNo:{ type: String, required: true },
    question1: { type: String, required: true },
    question1_option1: { type: String, required: true },
    question1_option2: { type: String, required: true },
    question1_option3: { type: String, required: true },
    question1_option4: { type: String, required: true },
    question1_option_correct: { type: String, required: true },
    question2: { type: String, required: true },
    question2_option1: { type: String, required: true },
    question2_option2: { type: String, required: true },
    question2_option3: { type: String, required: true },
    question2_option4: { type: String, required: true },
    question2_option_correct: { type: String, required: true },
    }
);

const model = mongoose.model('assignment', assignmentSchema)

module.exports = model
