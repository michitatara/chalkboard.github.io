const mongoose = require("mongoose");

const assignmentStudSchema = new mongoose.Schema(
  {
    assigmentId: { type: String, required: true },
    studentId: { type: String, required: true },
    question1_option_correct: { type: String, required: true },
    question2_option_correct: { type: String, required: true },
  }
);

const model = mongoose.model('assignmentStud', assignmentStudSchema)

module.exports = model
