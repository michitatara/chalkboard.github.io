const mongoose = require("mongoose");

const assignmentStudResultSchema = new mongoose.Schema(
  {
    assigmentId: { type: String, required: true },
    studentId: { type: String, required: true },
    marks: { type: String, required: true },
    grade: { type: String, required: true },
    feedback: { type: String, required: true },
  }
);

const model = mongoose.model('assignmentStudResult', assignmentStudResultSchema)

module.exports = model
