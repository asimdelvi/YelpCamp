const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
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
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
};

//TODO: add returnTo thing to every page, not just while using new campground.
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back");
  // to redirect to previously visited url
  const redirectUrl = req.session.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  // req.logOut(): Inbuilt middleware by passport
  req.logOut();
  req.flash("success", "Goodbye");
  res.redirect("/campgrounds");
};
