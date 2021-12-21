const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    assignmentId: { type: String, required: true, unique: true },
    courseid: { type: String, required: true},
    coursename: { type: String, required: true },
    teacherId:{ type: String, required: true },
    deadline:{ type: String, required: true },
    description: { type: String, required: true },
    }
);

const CreateAssignmet = mongoose.model('createassignment', assignmentSchema)

module.exports = CreateAssignmet;
