const { request } = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Auth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ errorMessage: "unauthorized User" });
  }
  const verified = jwt.verify(token, process.env.SECRET_JWT);
  req.user = verified.user;

  next();
};

module.exports = Auth;
