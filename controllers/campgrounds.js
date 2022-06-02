const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res, next) => {
  try {
    const campgrounds = await Campground.find();
    res.render("campgrounds/index", { campgrounds });
  } catch (error) {
    next(error);
  }
};

module.exports.renderNewForm = async (req, res, next) => {
  try {
    res.render("campgrounds/new");
  } catch (error) {
    next(error);
  }
};

module.exports.createCampground = async (req, res, next) => {
  try {
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
    campground.author = req.user.id;
    await campground.save();
    req.flash("success", "Successfully created a new campground");
    res.redirect(`/campgrounds/${campground.id}`);
  } catch (error) {
    next(error);
  }
};

module.exports.showCampground = async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id)
      // for scalability, we don't need to store the author's info, instead we just can store author's name.
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("author");
    if (!campground) {
      req.flash("error", "Cannot find that campground");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  } catch (error) {
    next(error);
  }
};

module.exports.renderEditForm = async (req, res, next) => {
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
};

module.exports.updateCampground = async (req, res, next) => {
  try {
    // if (!req.body.campground)
    // throw new ExpressError("Enter all the required fields", 400);
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(
      req.params.id,
      req.body.campground
    );
    images = req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }));
    campground.images.push(...images);
    await campground.save();
    if (req.body.deleteImages) {
      for (const image of req.body.deleteImages) {
        cloudinary.uploader.destroy(image);
      }
      await campground.updateOne({
        $pull: { images: { filename: { $in: req.body.deleteImages } } },
      });
    }
    req.flash("success", "Successfully updated campground");
    res.redirect(`/campgrounds/${campground.id}`);
  } catch (error) {
    next(error);
  }
};

module.exports.deleteCampground = async (req, res, next) => {
  try {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash("success", "Successfully deleted campground");
    res.redirect("/campgrounds");
  } catch (error) {
    next(error);
  }
};
