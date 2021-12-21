const mongoose = require("mongoose");

module.exports = mongoose.model('StudentCourse', new mongoose.Schema(
  {
    studid: { type: String, required: true },
    cid: { type: String, required: true },
    isenroll: { type: String, required: true,default: 'f'},//use for check is teacher allow or not for enrolled course to student
  }
))
