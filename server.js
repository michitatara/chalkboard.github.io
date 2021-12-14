const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/user");
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

mongoose.connect("mongodb://localhost:27017/login-app-db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
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

app.post("/api/register", async (req, res) => {
  const {
    firstname,
    lastname,
    role,
    email,
    password: plainTextPassword,
  } = req.body;
  if (!firstname || typeof firstname !== "string") {
    return res.json({ status: "error", error: "Invalid username" });
  }
  if (!lastname || typeof lastname !== "string") {
    return res.json({ status: "error", error: "Invalid username" });
  }

  if (!email || typeof email !== "string") {
    return res.json({ status: "error", error: "Invalid email" });
  }

  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
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

  try {
    const response = await User.create({
      firstname,
      lastname,
      email,
      role,
      password,
    });
    //console.log('User created successfully: ', response)
  } catch (error) {
    if (error.code === 11000) {
      // duplicate key
      return res.json({ status: "error", error: "Username already in use" });
    }
    throw error;
  }

  res.json({ status: "ok" });
});

// login
app.get("/login", (req, res) => {
  res.render(path.join(__dirname, "/views", "index"));
});

//Post login route

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.send({ error: "enter all the enteries" });
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
            .send({ message: "successfully Logged In", role: user.role });
        }
      }
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// student homepage authriztion route

app.get("/studenthomepage", Auth, (req, res) => {
  res.render(path.join(__dirname, "/views", "StudentHomepage"));
});

// teacher homepage authriztion route

app.get("/teacherhomepage", Auth, (req, res) => {
  res.render(path.join(__dirname, "/views", "TeacherHomepage"));
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
