const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    tid: { type: String, required: true },
    courseId:{ type: String, required: true,unique: true },
    courseName: { type: String, required: true },
    subject: { type: String, required: true },
    capacity: { type: String, required: true },
  }
);

const model = mongoose.model('course', courseSchema)

module.exports = model
