const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.create = async (req, res) => {
    const { id } = req.params;
    const r = new Review(req.body.review);
    r.campground = await Campground.findById(id);
    r.author = req.user;
    await r.save();
    req.flash("success", "Successfully added review");
    res.redirect(`/campgrounds/${id}`)
};

module.exports.delete = async (req, res) => {
    const { id, reviewId } = req.params;
    const r = await Review.findById(reviewId);
    if (r.author.equals(req.user._id)) {
        await Review.deleteOne({ _id: reviewId });
        req.flash("success", "Successfully deleted review");

    } else {
        req.flash("error", "You don't have the permissions to do that.");
    }
    res.redirect(`/campgrounds/${id}`)
};