const express = require("express");
const router = express.Router();
const passport = require("passport");
const users = require("../controllers/users");

router
  .route("/register")
  .get(users.renderRegisterForm) // Register Form
  .post(users.register); // Creates user

router
  .route("/login")
  .get(users.renderLoginForm) // Login Form
  .post(
    //Inbuilt middleware by passport
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  ); // Logs in the user

router.get("/logout", users.logout); // Logout the user

module.exports = router;
