const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const User = require("./models/user")
const { join } = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews")

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

app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.message = req.flash("success");
    res.locals.error = req.flash("error");
    return next();
});

app.get("/", (req, res) => {
    res.render("home");
});

app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/campgrounds", campgroundRoutes);

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