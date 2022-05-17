const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");

// Register Form
router.get("/register", (req, res) => {
  res.render("users/register");
});

// Creates user
router.post("/register", async (req, res, next) => {
  try {
    try {
      const { username, email, password } = req.body;
      const user = new User({ username, email });
      // User.register(user, password): Inbuilt method by passport-local-mongoose
      const registeredUser = await User.register(user, password);
      // req.login(registeredUser, callback function): Inbuilt method by passport
      // to keep the user logged in after registration
      // By default after successfully registering, user won't be logged in.
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Yelp camp");
        res.redirect("/campgrounds");
      });
    } catch (error) {
      req.flash("error", error.message);
      res.redirect("/register");
    }
  } catch (error) {
    next(error);
  }
});

// Login Form
router.get("/login", (req, res) => {
  res.render("users/login");
});

// Logs in the user
router.post(
  "/login",
  // passport.authenticate('local', config): Inbuilt middleware by passport
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", "Welcome back");
    // to redirect to previously visited url
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);

// Logout the user
router.get("/logout", (req, res) => {
  // req.logOut(): Inbuilt middleware by passport
  req.logOut();
  req.flash("success", "Goodbye");
  res.redirect("/campgrounds");
});

module.exports = router;
