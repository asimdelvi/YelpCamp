const express = require("express");
const { reviewSchema } = require("../schemas");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const Review = require("../models/review");

/* routers does not includes the params of parent in the child routes, 
  so parent and child route params have to be merged using mergeParams */
const router = express.Router({ mergeParams: true });

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(",");
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};

//Create Review
router.post("/", validateReview, async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id);
    const review = await new Review(req.body.review);
    await campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Created new review");
    res.redirect(`/campgrounds/${campground.id}`);
  } catch (error) {
    next(error);
  }
});

//Delete Review
router.delete("/:reviewId", async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review");
    res.redirect(`/campgrounds/${id}`);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
