const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const Joi = require("joi");
const Campground = require("./models/campground");
const Review = require("./models/review");
const User = require("./models/user")
const { join } = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const { mustLogin, isAuthor } = require("./middleware");
const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
const review = require("./models/review");
dayjs.extend(relativeTime);

mongoose.set("strictQuery", false);

mongoose.connect("mongodb://127.0.0.1:27017/yelpcamp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("db connected");
});

const app = express();

// sessions
app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        },
    })
);

// flash msgs
app.use(flash());

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('views', path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

const validator = (req, res, next) => {
    const campValidationSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            description: Joi.string().required(),
            location: Joi.string().required()
        }).required()
    });
    const { error } = campValidationSchema.validate(req.body);
    if (!error) return next();
    const errorMsg = error.details.map(i => i.message).join(",");
    throw new ExpressError(400, errorMsg);
};

app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.message = req.flash("success");
    res.locals.error = req.flash("error");
    return next();
});

app.get("/", (req, res) => {
    res.render("home");
})

app.get("/campgrounds", catchAsync(async (req, res) => {
    const camps = await Campground.find({}).sort({ date: "desc" });
    res.render("campgrounds/index", { camps });
}));

app.get("/campgrounds/new", mustLogin, (req, res) => {
    res.render("campgrounds/new");
});

app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate("author");
    const age = dayjs(camp.date).fromNow();
    const reviews = await Review.find({ campground: { _id: id } }).populate("author");
    res.render("campgrounds/show", { camp, age, reviews });
}));

app.get("/campgrounds/:id/edit", mustLogin, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    res.render("campgrounds/edit", { camp });
}));

app.post("/campgrounds/:id/reviews", mustLogin, catchAsync(async (req, res) => {
    const { id } = req.params;
    const r = new review(req.body.review);
    r.campground = await Campground.findById(id);
    r.author = req.user;
    await r.save();
    req.flash("success", "Successfully added review");
    res.redirect(`/campgrounds/${id}`)
}));

app.delete("/campgrounds/:id/reviews/:reviewId", mustLogin, catchAsync(async (req, res) => {
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

app.post("/campgrounds", mustLogin, validator, catchAsync(async (req, res) => {
    const c = new Campground(req.body.campground);
    await c.save();
    req.flash("success", "Successfully created campground.");
    res.redirect(`/campgrounds/${c._id}`);
}));

app.put("/campgrounds/:id", mustLogin, validator, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash("success", "Successfully updated campground.");
    res.redirect(`/campgrounds/${id}`);
}));

app.delete("/campgrounds/:id", mustLogin, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted campground.");
    res.redirect("/campgrounds");
}));

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", catchAsync(async (req, res) => {
    const { email, username, password } = req.body.user;
    const user = new User({ email, username });
    const newUser = await User.register(user, password);
    req.login(newUser, err => {
        if (err) return next(err);

        req.flash("Welcome to YelpCamp!");
        return res.redirect("/campgrounds");
    });
}));

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login", keepSessionInfo: true }),
    catchAsync(async (req, res) => {
        const redirectUrl = req.session.redirectTo || "/campgrounds";
        delete req.session.redirectTo;
        req.flash("success", "Welcome back!");
        res.redirect(redirectUrl);
    }));

app.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) return next(err);
        req.flash("success", "See you!");
        res.redirect("/campgrounds");
    });

});

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    const { status = 500 } = err;
    if (!err.message) err.message = "Server Error";
    res.status(status).render("error", { err });
});

app.listen(3001, () => {
    console.log("servin on 3001");
});