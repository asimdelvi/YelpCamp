const express = require("express");
const reviews = require("../controllers/reviews");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
/* routers does not includes the params of parent in the child routes, 
  so parent and child route params have to be merged using mergeParams */
const router = express.Router({ mergeParams: true });

//Create Review
router.post("/", isLoggedIn, validateReview, reviews.createReview);

//Delete Review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, reviews.deleteReview);

module.exports = router;
