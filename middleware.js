const ExpressError = require("./utils/ExpressError");
const BaseJoi = require("joi");
const Campground = require("./models/campground");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
    type: "string",
    base: joi.string(),
    messages: {
        "string.escapeHTML": "{{#label}} must not include HTML!"
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error("string.escapeHTML", { value });
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension);

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

module.exports.campValidator = (req, res, next) => {
    const campValidationSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required().escapeHTML(),
            price: Joi.number().required().min(0),
            // image: Joi.string().required(),
            description: Joi.string().required().escapeHTML(),
            location: Joi.string().required().escapeHTML()
        }).required(),
        deleteImages: Joi.array()
    });
    const { error } = campValidationSchema.validate(req.body);
    if (!error) return next();
    const errorMsg = error.details.map(i => i.message).join(",");
    throw new ExpressError(400, errorMsg);
};