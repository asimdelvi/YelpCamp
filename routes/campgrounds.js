const express = require("express");
const Campground = require("../models/campground");
const { isLoggedIn } = require("../middleware");
const { validateCampground, isAuthor } = require("../middleware");
const router = express.Router();

//Index
router.get("/", async (req, res, next) => {
  try {
    const campgrounds = await Campground.find();
    res.render("campgrounds/index", { campgrounds });
  } catch (error) {
    next(error);
  }
});

//New
router.get("/new", isLoggedIn, async (req, res, next) => {
  try {
    res.render("campgrounds/new");
  } catch (error) {
    next(error);
  }
});

//Create
router.post("/", isLoggedIn, validateCampground, async (req, res, next) => {
  try {
    const campground = new Campground(req.body.campground);
    campground.author = req.user.id;
    await campground.save();
    req.flash("success", "Successfully created a new campground");
    res.redirect(`/campgrounds/${campground.id}`);
  } catch (error) {
    next(error);
  }
});

//Show
router.get("/:id", async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id)
      // for scalability, we don't need to store the author's info, instead we just can store author's name.
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("author");
    console.log(campground);
    if (!campground) {
      req.flash("error", "Cannot find that campground");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  } catch (error) {
    next(error);
  }
});

//Edit
router.get("/:id/edit", isLoggedIn, isAuthor, async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash("error", "Cannot find that campground");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  } catch (error) {
    next(error);
  }
});

//Update
router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validateCampground,
  async (req, res, next) => {
    try {
      // if (!req.body.campground)
      // throw new ExpressError("Enter all the required fields", 400);
      const campground = await Campground.findByIdAndUpdate(
        req.params.id,
        req.body.campground
      );
      req.flash("success", "Successfully updated campground");
      res.redirect(`/campgrounds/${campground.id}`);
    } catch (error) {
      next(error);
    }
  }
);

//Delete
router.delete("/:id", isAuthor, isLoggedIn, async (req, res, next) => {
  try {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
