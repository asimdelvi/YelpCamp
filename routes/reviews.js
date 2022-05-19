const express = require("express");
const Campground = require("../models/campground");
const Review = require("../models/review");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
/* routers does not includes the params of parent in the child routes, 
  so parent and child route params have to be merged using mergeParams */
const router = express.Router({ mergeParams: true });

//Create Review
router.post("/", isLoggedIn, validateReview, async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id);
    const review = await new Review(req.body.review);
    review.author = req.user.id;
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
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  async (req, res, next) => {
    try {
      const { id, reviewId } = req.params;
      await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
      await Review.findByIdAndDelete(reviewId);
      req.flash("success", "Successfully deleted review");
      res.redirect(`/campgrounds/${id}`);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
