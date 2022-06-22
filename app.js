if (process.env.NODE_ENV !== "Production") {
  // dotenv will add all the .env file data into process.env object so we can use process.env in different files.
  require("dotenv").config();
  // TODO: know about dotenv
}

const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
// const helmet = require("helmet");
const MongoStore = require("connect-mongo");

// const LocalStrategy = require("passport-local");

const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";

mongoose
  .connect(dbUrl)
  .then(console.log("DB connected"))
  .catch((e) => console.log(e));

//TODO: what is mongoose.connection.on and mongoose.connection.once, din't understand at all.
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error"));
// db.once("open", () => {
//   console.log('Database Connected');
// });

const app = express();

//TODO: app.engine() vs app.set(), what is their use.

app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// * Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const secret = process.env.SECRET || "highSecurity";
// * Session and Flash
// using mongoDB to store session data.
const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
});

const sessionConfig = {
  store,
  // it's better to change name of the session id, to prevent hackers to recognize.
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    // TODO: what is http only
    httpOnly: true,
    // for https have to use below code,
    // secure: true,
    expires: Date.now() * 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

// * Security
// It prevents the mongo injections
// it eliminates the special characters like $ from the query/param object
app.use(mongoSanitize());
// TODO:Add helmet
// Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
// app.use(
//   helmet({
//     contentSecurityPolicy: false,
//     crossOriginResourcePolicy: false,
//   })
// );

// * Passport
app.use(passport.initialize());
app.use(passport.session());
// passport.use(new LocalStrategy(User.authenticate()));
passport.use(User.createStrategy());

// Specifies how data will be stored in session and retrieved from the session.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Locals which can be accessed by all of the templates.
app.use((req, res, next) => {
  // for Login, register, logout page display toggle
  // user will be automatically added in the req object, when logged in.
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// * Routers
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Not found", 404));
});

// * Error Handling
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  // if we write default message value as destructured value above,
  // we cannot access the message in the template as we are passing whole err object to the template
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error", { err });
});

// Heroku will have its default port
const port = process.env.PORT || 3090;
app.listen(port, () => console.log(`listening on port ${port}`));

// TODO: Integrate infinite scroll or pagination to the index.ejs
