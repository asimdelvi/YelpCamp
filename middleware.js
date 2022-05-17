// Checks if the user is logged in,
// if yes, next()
// if not, store the present url, redirect to the login page, display the error flash message.
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first");
    return res.redirect("/login");
    // TODO: add a feature such that after login, the page should redirect to previous route not /login
  }
  next();
};
