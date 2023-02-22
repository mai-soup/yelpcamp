module.exports.mustLogin = (req, res, next) => {
    if (req.isAuthenticated()) return next();

    req.flash("error", "You must log in to access this page.");
    return res.redirect("/login");
};