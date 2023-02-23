const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const { mustLogin, isAuthor, campValidator } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const Review = require("../models/review");
const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

router.get("/", catchAsync(async (req, res) => {
    const camps = await Campground.find({}).sort({ date: "desc" });
    res.render("campgrounds/index", { camps });
}));

router.get("/new", mustLogin, (req, res) => {
    res.render("campgrounds/new");
});

router.get("/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate("author");
    const age = dayjs(camp.date).fromNow();
    const reviews = await Review.find({ campground: { _id: id } }).populate("author");
    res.render("campgrounds/show", { camp, age, reviews });
}));

router.get("/:id/edit", mustLogin, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    res.render("campgrounds/edit", { camp });
}));


router.post("/", mustLogin, campValidator, catchAsync(async (req, res) => {
    const c = new Campground(req.body.campground);
    await c.save();
    req.flash("success", "Successfully created campground.");
    res.redirect(`/campgrounds/${c._id}`);
}));

router.put("/:id", mustLogin, campValidator, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash("success", "Successfully updated campground.");
    res.redirect(`/campgrounds/${id}`);
}));

router.delete("/:id", mustLogin, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground.");
    res.redirect("/campgrounds");
}));

module.exports = router;