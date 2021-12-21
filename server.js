const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/user");
const Course = require("./models/course");
const StudentCourse = require("./models/studentcourse");
const Assignment = require("./models/assignment");
const AssignmentStud = require("./models/assignmentStudent");
const AssignmentStudResult = require("./models/assignmentStudResult");
const CreateAssignment = require("./models/createAssignment");
const ejs = require("ejs");
const port = process.env.PORT || 3000;
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
var cookies = require("cookie-parser");
const Auth = require("./middleware/auth");
const router = express.Router();

mongoose.connect(
  "mongodb+srv://mk277:Parachute299@cluster0.mjfk6.mongodb.net/deliv3?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
// app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(cookies());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000/",
    credentials: "true",
  })
);

app.get("/", (req, res) => {
  res.render(path.join(__dirname, "/views", "signup"));
});

const publicDirectoryPath = path.join(__dirname, "/views");
const staticDirectory = express.static(publicDirectoryPath);
app.use(staticDirectory);

const cssDirectoryPath = path.join(__dirname, "/views/css");
const cssDirectory = express.static(cssDirectoryPath);
app.use("/styles/", cssDirectory);
//teacher and student regist
app.post("/api/register", async (req, res) => {
  const {
    firstname,
    lastname,
    rid,
    role,
    email,
    password: plainTextPassword,
  } = req.body;
  if (!firstname || typeof firstname !== "string") {
    return res.json({ status: "error", error: "Invalid First Name" });
  }
  if (!lastname || typeof lastname !== "string") {
    return res.json({ status: "error", error: "Invalid Last Name" });
  }

  if (!email || typeof email !== "string") {
    return res.json({ status: "error", error: "Invalid email" });
  }

  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
  }

  if (!rid || typeof rid !== "string") {
    return res.json({ status: "error", error: "Enter Id" });
  }
  if (!role || typeof role !== "string") {
    return res.json({ status: "error", error: "Role must be choosen" });
  }

  if (plainTextPassword.length < 5) {
    return res.json({
      status: "error",
      error: "Password too small. Should be atleast 6 characters",
    });
  }

  const password = await bcrypt.hash(plainTextPassword, 10);

  const userRec = await User({
    firstname: firstname,
    lastname: lastname,
    email: email,
    rid: rid,
    role: role,
    password: password,
  });
  userRec.save(function (err, User) {
    if (err) return res.json({ status: "Record Not Saved...", error: err });
    else return res.json({ status: "Record Saved..." });
  });
});

//Post login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.send({ error: "enter all enteries" });
    }
    if (email === "admin" && password == "user") {
      const token = await jwt.sign(
        { id: "userisadmin" },
        process.env.SECRET_JWT
      );
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: true,
          maxAge: 1 * 24 * 60 * 60,
        })
        .send({ message: "successfully Logged In", role: "admin" });
    } else {
      const user = await User.findOne({ email });

      if (!user) {
        res.send({ error: "user is not exist please signup first" });
      } else {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          res.send({ error: "invalid credidentials" });
        } else {
          const token = await jwt.sign(
            { id: user._id },
            process.env.SECRET_JWT
          );
          res
            .cookie("token", token, {
              httpOnly: true,
              secure: true,
              sameSite: true,
              maxAge: 1 * 24 * 60 * 60,
            })
            .send({
              message: "successfully Logged In",
              role: user.role,
              id: user.rid,
            });
        }
      }
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

//find teacher or student from userschema
//like this http://localhost:3000/usersrec/student
app.get("/user/:role", async (req, res) => {
  User.find({ role: req.params.role }, function (error, result) {
    return res.json({ data: result });
  });
});
//create course by teacher
app.post("/course", async (req, res) => {
  const { tid, courseId, courseName, subject, capacity } = req.body;

  if (!tid || typeof tid !== "string") {
    return res.json({ status: "error", error: "Enter Teacher Id" });
  }

  if (!courseId || typeof courseId !== "string") {
    return res.json({ status: "error", error: "Enter Course Id" });
  }
  if (!courseName || typeof courseName !== "string") {
    return res.json({ status: "error", error: "Enter Course Name" });
  }

  if (!subject || typeof subject !== "string") {
    return res.json({ status: "error", error: "Enter Subject" });
  }
  if (!capacity || typeof capacity !== "string") {
    return res.json({ status: "error", error: "Enter Course Capacity" });
  }

  const courseRecord = await Course({
    tid,
    courseId,
    courseName,
    subject,
    capacity,
  });
  console.log({ rid: tid });
  User.findOne(
    { $and: [{ rid: tid, role: "teacher" }] },
    function (err, result) {
      console.log(result);
      if (result !== null) {
        courseRecord.save(function (err, Course) {
          if (err)
            return res.json({ status: "Record Not Saved...", error: err });
          else return res.json({ status: "Record Saved..." });
        });
      } else {
        return res.json({ status: "Not a teacher id" });
      }
    }
  );
});

//get result from course by course Id
app.get("/course/:cid", async (req, res) => {
  Course.findOne({ courseId: req.params.cid }, function (error, result) {
    //rendere here to go to your page by res.rendere function
    return res.json({ data: result });
  });
});

//delete course from teacher
app.get("/course/delete/:cid", async (req, res) => {
  Course.findOneAndRemove(
    { courseId: req.params.cid },
    function (error, result) {
      return res.json({ data: result });
    }
  );
});

//find all courses
app.get("/all/courses", async (req, res) => {
  Course.find()
    .then((data) =>
      res.render(path.join(__dirname, "/views", "AllCourses"), { data: data })
    )
    .catch((err) => console.log(err));
});

//get course by teacher
app.get("/course/byteacherid/:tid", async (req, res) => {
  StudentCourse.find()
    .then((data) => {
      res.render(path.join(__dirname, "/views", "RequestedCourses"), {
        data: data,
      });
    })
    .catch((err) => console.log(err));
});

//student request to teacher for enroll in course
app.post("/studentenrollrequest", async (req, res) => {
  const { studid, cid } = req.body;

  if (!studid || typeof studid !== "string") {
    return res.json({ status: "error", error: "Select student from list " });
  }
  if (!cid || typeof cid !== "string") {
    return res.json({ status: "error", error: "Select course from list " });
  }
  const isenroll = "f";
  const studentcou = await StudentCourse({
    studid,
    cid,
    isenroll,
  });

  User.findOne(
    { $and: [{ rid: studid, role: "student" }] },
    function (err, result) {
      console.log(result);
      if (result !== null) {
        Course.findOne({ courseId: cid }, function (err, result) {
          console.log(result);
          if (result !== null) {
            studentcou.save(function (err, StudentCourse) {
              if (err)
                return res.json({ status: "Record Not Saved...", error: err });
              else return res.json({ status: "Record Saved..." });
            });
          } else {
            return res.json({ status: "Not a course id" });
          }
        });
      } else {
        return res.json({ status: "Not a student id" });
      }
    }
  );
});

//teacher enroll accept or reject
app.post("/studentenrollrequest/update", async (req, res) => {
  const { studid, cid, isenroll } = req.body;

  console.log([{ studid: studid }, { cid: cid }]);
  StudentCourse.findOne(
    { $and: [{ studid: studid }, { cid: cid }] },
    function (error, result) {
      //rendere here to go to your page by res.rendere function
      if (isenroll === "t") {
        console.log("Test - > " + isenroll);

        StudentCourse.updateOne(
          { $set: { isenroll: "t" } },
          function (error, result) {
            return res.json({ data: "Student subect enrolled successfully" });
          }
        );
      } else {
        StudentCourse.findOneAndRemove(
          { $and: [{ studid: studid }, { cid: cid }] },
          function (error, result) {
            return res.json({ data: "Subect enrolled request rejected" });
          }
        );
      }
    }
  );
});
//Create Assignmet
app.post("/createassignmet", async (req, res) => {
  const {
    assignmentId,
    courseid,
    coursename,
    teacherId,
    deadline,
    description,
  } = req.body;
  const createAssignmet = await CreateAssignment({
    assignmentId,
    courseid,
    coursename,
    teacherId,
    deadline,
    description,
  });
  createAssignmet
    .save()
    .then((data) => {
      res.json({ status: "Record Saved...", data });
    })
    .catch((err) => console.log(err));
});
//create Assignment
app.post("/assignment", async (req, res) => {
  const {
    assigmentId,
    assigmentName,
    teacherId,
    cid,
    subjectName,
    lessionNo,
    question1,
    question1_option1,
    question1_option2,
    question1_option3,
    question1_option4,
    question1_option_correct,

    question2,
    question2_option1,
    question2_option2,
    question2_option3,
    question2_option4,
    question2_option_correct,
  } = req.body;

  if (!assigmentId || typeof assigmentId !== "string") {
    return res.json({ status: "error", error: "Enter Assigment Id " });
  }
  if (!assigmentName || typeof assigmentName !== "string") {
    return res.json({ status: "error", error: "Enter Assigment Name " });
  }
  if (!teacherId || typeof teacherId !== "string") {
    return res.json({ status: "error", error: "Enter Teacher Id" });
  }

  if (!subjectName || typeof subjectName !== "string") {
    return res.json({ status: "error", error: "Enter Subject Name" });
  }

  if (!lessionNo || typeof lessionNo !== "string") {
    return res.json({ status: "error", error: "Enter Lession Number" });
  }
  if (!question1 || typeof question1 !== "string") {
    return res.json({ status: "error", error: "Enter Question Number 1" });
  }

  if (!question1_option1 || typeof question1_option1 !== "string") {
    return res.json({
      status: "error",
      error: "Enter Question Number 1 Option Number 1",
    });
  }

  if (!question1_option2 || typeof question1_option2 !== "string") {
    return res.json({
      status: "error",
      error: "Enter Question Number 1 Option Number 2",
    });
  }

  if (!question1_option3 || typeof question1_option3 !== "string") {
    return res.json({
      status: "error",
      error: "Enter Question Number 1 Option Number 3",
    });
  }

  if (!question1_option4 || typeof question1_option4 !== "string") {
    return res.json({
      status: "error",
      error: "Enter Question Number 1 Option Number 4",
    });
  }

  if (
    !question1_option_correct ||
    typeof question1_option_correct !== "string"
  ) {
    return res.json({
      status: "error",
      error: "Select Question Number 1 Correct Option Number",
    });
  }

  if (!question2 || typeof question2 !== "string") {
    return res.json({ status: "error", error: "Enter Question Number 2" });
  }

  if (!question2_option1 || typeof question2_option1 !== "string") {
    return res.json({
      status: "error",
      error: "Enter Question Number 2 Option Number 1",
    });
  }

  if (!question2_option2 || typeof question2_option2 !== "string") {
    return res.json({
      status: "error",
      error: "Enter Question Number 2 Option Number 2",
    });
  }

  if (!question2_option3 || typeof question2_option3 !== "string") {
    return res.json({
      status: "error",
      error: "Enter Question Number 2 Option Number 3",
    });
  }

  if (!question2_option4 || typeof question2_option4 !== "string") {
    return res.json({
      status: "error",
      error: "Enter Question Number 2 Option Number 4",
    });
  }

  if (
    !question2_option_correct ||
    typeof question2_option_correct !== "string"
  ) {
    return res.json({
      status: "error",
      error: "Select Question Number 2 Correct Option Number",
    });
  }
  const assignments = await Assignment({
    assigmentId,
    assigmentName,
    teacherId,
    subjectName,
    lessionNo,
    question1,
    question1_option1,
    question1_option2,
    question1_option3,
    question1_option4,
    question1_option_correct,

    question2,
    question2_option1,
    question2_option2,
    question2_option3,
    question2_option4,
    question2_option_correct,
  });
  Course.findOne(
    { $and: [{ tId: teacherId, courseId: cid }] },
    function (err, result) {
      if (result !== null) {
        assignments.save(function (err, result) {
          if (err)
            return res.json({ status: "Record Not Saved...", error: err });
          else return res.json({ status: "Record Saved..." });
        });
      }
    }
  );
});

//student attempt assignment
app.post("/assignmentStud", async (req, res) => {
  const {
    assigmentId,
    studentId,
    question1_option_correct,
    question2_option_correct,
  } = req.body;

  if (!assigmentId || typeof assigmentId !== "string") {
    return res.json({ status: "error", error: "Enter Assigment Id " });
  }
  if (!studentId || typeof studentId !== "string") {
    return res.json({ status: "error", error: "Enter Student Id" });
  }
  if (
    !question1_option_correct ||
    typeof question1_option_correct !== "string"
  ) {
    return res.json({
      status: "error",
      error: "Select Question Number 1 Correct Option Number",
    });
  }
  if (
    !question2_option_correct ||
    typeof question2_option_correct !== "string"
  ) {
    return res.json({
      status: "error",
      error: "Select Question Number 2 Correct Option Number",
    });
  }
  const assignmentStud = await AssignmentStud({
    assigmentId,
    studentId,
    question1_option_correct,
    question2_option_correct,
  });
  assignmentStud.save(function (err, result) {
    if (err) return res.json({ status: "Record Not Saved...", error: err });
    else return res.json({ status: "Record Saved..." });
  });
});

//create student from teacher
app.post("/assignmentStudResult", async (req, res) => {
  const { assigmentId, studnetId, marks, grade, feedback } = req.body;

  if (!assigmentId || typeof assigmentId !== "string") {
    return res.json({ status: "error", error: "Enter Assigment Id " });
  }
  if (!studnetId || typeof studnetId !== "string") {
    return res.json({ status: "error", error: "Enter Student Id" });
  }
  if (!marks || typeof marks !== "string") {
    return res.json({ status: "error", error: "Enter marks" });
  }
  if (!grade || typeof grade !== "string") {
    return res.json({ status: "error", error: "Enter grade" });
  }
  const assignmentStudResult = await AssignmentStudResult({
    assigmentId,
    studnetId,
    marks,
    grade,
    feedback,
  });
  assignmentStudResult.save(function (err, result) {
    if (err) return res.json({ status: "Record Not Saved...", error: err });
    else return res.json({ status: "Record Saved..." });
  });
});
//get result of student assignment
app.get("/assignmentResult/:assignmentId/:studentId", async (req, res) => {
  const assigmentId = req.params.assignmentId;
  const studentId = req.params.studentId;

  if (!assigmentId || typeof assigmentId !== "string") {
    return res.json({ status: "error", error: "Enter Assigment Id " });
  }
  if (!studentId || typeof studentId !== "string") {
    return res.json({ status: "error", error: "Enter Student Id" });
  }

  AssignmentStud.find(
    { $and: [{ assigmentId: assigmentId }, { studentId: studentId }] },
    function (err, result) {
      Assignment.find({ assigmentId: assigmentId }, function (error, results) {
        const answer1_student = result[0].question1_option_correct;
        const answer2_student = result[0].question2_option_correct;

        const answer1 = results[0].question1_option_correct;
        const answer2 = results[0].question2_option_correct;
        var marks = 0;
        if (answer1 === answer1_student) {
          marks += 10;
        }
        if (answer2 === answer2_student) {
          marks += 10;
        }
        var grade = "FAIL";
        if (marks === 10) {
          grade = "B";
        } else if (marks === 20) {
          grade = "A";
        }
        res.json({ marks: marks, grade: grade });
      });
    }
  );
});

// login
app.get("/login", (req, res) => {
  res.render(path.join(__dirname, "/views", "index"));
});

// student homepage authriztion route

app.get("/studenthomepage/:id", Auth, (req, res) => {
  Course.find()
    .then((data) => {
      res.render(path.join(__dirname, "/views", "StudentHomepage"), {
        data: data,
      });
    })
    .catch((err) => console.log(err));
});

// teacher homepage authriztion route

app.get("/teacherhomepage/:id", Auth, (req, res) => {
  Course.find({ tid: req.params.id })
    .then((data) =>
      res.render(path.join(__dirname, "/views", "TeacherHomepage"), {
        data: data,
      })
    )
    .catch((err) => console.log(err));
});

//teacher certain class
app.get("/teachercertainclass", (req, res) => {
  res.render(path.join(__dirname, "/views", "TeacherCertainClass"));
});

//create assignment
app.get("/createassignment", (req, res) => {
  res.render(path.join(__dirname, "/views", "CreateAssignment"));
});

//create class
app.get("/createclass", (req, res) => {
  res.render(path.join(__dirname, "/views", "CreateClass"));
});

//GradeAssignment
app.get("/gradeassignment", (req, res) => {
  res.render(path.join(__dirname, "/views", "GradeAssignment"));
});

//History Quiz
app.get("/historyquiz", (req, res) => {
  res.render(path.join(__dirname, "/views", "HistoryQuiz"));
});

//Past Query
app.get("/pastquery", (req, res) => {
  res.render(path.join(__dirname, "/views", "PastQuery"));
});

app.get("/pendingapplications", (req, res) => {
  res.render(path.join(__dirname, "/views", "PendingApplications"));
});

app.get("/querypage", (req, res) => {
  res.render(path.join(__dirname, "/views", "QueryPage"));
});
//Student1
app.get("/student1", (req, res) => {
  res.render(path.join(__dirname, "/views", "Student1"));
});

//student certain class
app.get("/studentcertainclass", (req, res) => {
  res.render(path.join(__dirname, "/views", "StudentCertainClass"));
});

//Student Search Class
app.get("/studentsearchclass", (req, res) => {
  res.render(path.join(__dirname, "/views", "StudentSearchClass"));
});

//Student Success enroll
app.get("/studentsuccessenroll", (req, res) => {
  res.render(path.join(__dirname, "/views", "StudentSuccessEnroll"));
});

//Student success submit
app.get("/studentsuccesssubmit", (req, res) => {
  res.render(path.join(__dirname, "/views", "StudentSuccessSubmit"));
});

// logout
//not sure if i changed somthing accidentally
app.get("/logout", (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .send();
});

//admin home page
app.get("/adminhomepage", Auth, (req, res) => {
  User.find()
    .then((data) => {
      res.render("AdminHomePage", { data: data });
    })
    .catch((err) => console.log(err));
});

var fetchRouter = require("./routes/fetch-route");
app.use("/", fetchRouter);

app.listen(port, () => {
  console.log(`Server up at ${port}`);
});
module.exports = router;
