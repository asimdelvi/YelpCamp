const express = require("express");
const campgrounds = require("../controllers/campgrounds");
const { isLoggedIn } = require("../middleware");
const { validateCampground, isAuthor } = require("../middleware");
const multer = require("multer");
// Nodejs automatically search for index.js in /cloudinary
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const router = express.Router();

router
  .route("/")
  .get(campgrounds.index) //Index
  .post(
    isLoggedIn,
    // FIXME: cannot validate before uploading the image, bcz multer gives the req.body after uploading.w
    upload.array("image"),
    validateCampground,
    campgrounds.createCampground
  ); //Create

router.get("/new", isLoggedIn, campgrounds.renderNewForm); //New

router
  .route("/:id")
  .get(campgrounds.showCampground) //Show
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    campgrounds.updateCampground
  ) //Update
  .delete(isAuthor, isLoggedIn, campgrounds.deleteCampground); //Delete

router.get("/:id/edit", isLoggedIn, isAuthor, campgrounds.renderEditForm); //Edit

module.exports = router;
