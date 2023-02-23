const express = require("express");
const router = express.Router({ mergeParams: true });
const Campground = require("../models/campground");
const { mustLogin } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const Review = require("../models/review");

router.post("/", mustLogin, catchAsync(async (req, res) => {
    const { id } = req.params;
    const r = new Review(req.body.review);
    r.campground = await Campground.findById(id);
    r.author = req.user;
    await r.save();
    req.flash("success", "Successfully added review");
    res.redirect(`/campgrounds/${id}`)
}));

router.delete("/:reviewId", mustLogin, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    const r = await Review.findById(reviewId);
    if (r.author.equals(req.user._id)) {
        await Review.deleteOne({ _id: reviewId });
        req.flash("success", "Successfully deleted review");

    } else {
        req.flash("error", "You don't have the permissions to do that.");
    }
    res.redirect(`/campgrounds/${id}`)
}));

module.exports = router;