const Campground = require("../models/campground");
const Review = require("../models/review");
const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
const { cloudinary } = require("../cloudinary");
dayjs.extend(relativeTime);


module.exports.index = async (req, res) => {
    const camps = await Campground.find({}).sort({ date: "desc" });
    res.render("campgrounds/index", { camps });
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate("author");
    const age = dayjs(camp.date).fromNow();
    const reviews = await Review.find({ campground: { _id: id } }).populate("author");
    res.render("campgrounds/show", { camp, age, reviews });
};

module.exports.showEditForm = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate("images");
    res.render("campgrounds/edit", { camp });
};

module.exports.showNewForm = (req, res) => {
    res.render("campgrounds/new");
};

module.exports.createNew = async (req, res) => {
    const c = new Campground(req.body.campground);
    c.author = req.user._id;
    c.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    console.log(c);
    await c.save();
    req.flash("success", "Successfully created campground.");
    res.redirect(`/campgrounds/${c._id}`);
};

module.exports.update = async (req, res) => {
    const { id } = req.params;
    const c = await Campground.findByIdAndUpdate(id, { ...req.body.campground });

    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    c.images.push(...imgs);
    await c.save();

    if (req.body.deleteImages) {
        for (let img of req.body.deleteImages) {
            cloudinary.uploader.destroy(img);
        }
        await c.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }

    // TODO: default image if there are none

    req.flash("success", "Successfully updated campground.");
    res.redirect(`/campgrounds/${id}`);
};

module.exports.delete = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground.");
    res.redirect("/campgrounds");
};