const express = require("express");
const methodOverride = require("method-override");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const Campground = require("./models/campground");
const ExpressError = require("./utils/ExpressError");
const { campgroundSchema, reviewSchema } = require("./schemas");
const Review = require("./models/review");
const campground = require("./models/campground");

mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
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

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  res.render("home");
});

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(",");
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(",");
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};

//Index
app.get("/campgrounds", async (req, res, next) => {
  try {
    const campgrounds = await Campground.find();
    res.render("campgrounds/index", { campgrounds });
  } catch (error) {
    next(error);
  }
});

//New
app.get("/campgrounds/new", async (req, res, next) => {
  try {
    res.render("campgrounds/new");
  } catch (error) {
    next(error);
  }
});

//Create
app.post("/campgrounds", validateCampground, async (req, res, next) => {
  try {
    const createCampground = await Campground.create(req.body.campground);
    res.redirect(`/campgrounds/${createCampground.id}`);
  } catch (error) {
    next(error);
  }
});

//Show
app.get("/campgrounds/:id", async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    res.render("campgrounds/show", { campground });
  } catch (error) {
    next(error);
  }
});

//Edit
app.get("/campgrounds/:id/edit", async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground });
  } catch (error) {
    next(error);
  }
});

//Update
// TODO: why not joi validation in update request
app.put("/campgrounds/:id", validateCampground, async (req, res, next) => {
  try {
    if (!req.body.campground)
      throw new ExpressError("Enter all the required fields", 400);
    const campground = await Campground.findByIdAndUpdate(
      req.params.id,
      req.body.campground
    );
    res.redirect(`/campgrounds/${campground.id}`);
  } catch (error) {
    next(error);
  }
});

//Delete
app.delete("/campgrounds/:id", async (req, res, next) => {
  try {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect("/campgrounds");
  } catch (error) {
    next(error);
  }
});

//Create Review
app.post("/campgrounds/:id/review", validateReview, async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id);
    const review = await new Review(req.body.review);
    await campground.reviews.push(review);
    await review.save();
    await campground.save();
    console.log(campground);
    res.redirect(`/campgrounds/${campground.id}`);
  } catch (error) {
    next(error);
  }
});

//Delete Review
// TODO: why campground id
app.delete("/campgrounds/:id/reviews/:reviewId", async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  } catch (error) {
    next(error);
  }
});

app.all("*", (req, res, next) => {
  next(new ExpressError("Not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  // if we write default message value as destructured value above,
  // we cannot access the message in the template as we are passing whole err object to the template
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error", { err });
});

app.listen(3080, () => console.log("listening on port 3080"));
