const Campground = require("./models/campground");

module.exports.mustLogin = (req, res, next) => {
    if (req.isAuthenticated()) return next();

    req.session.redirectTo = req.originalUrl;
    req.flash("error", "You must log in to access this page.");
    return res.redirect("/login");
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params
    const camp = await Campground.findById(id);
    if (camp.author.equals(req.user._id)) return next();

    req.flash("error", "You don't have the permissions to do that.");
    return res.redirect(`/campgrounds/${id}`);
};