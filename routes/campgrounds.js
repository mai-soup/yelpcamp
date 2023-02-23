const express = require("express");
const router = express.Router();
const { mustLogin, isAuthor, campValidator } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const campgrounds = require("../controllers/campgrounds");

router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(mustLogin, campValidator, catchAsync(campgrounds.createNew));

router.get("/new", mustLogin, campgrounds.showNewForm);

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(mustLogin, campValidator, catchAsync(campgrounds.update))
    .delete(mustLogin, catchAsync(campgrounds.delete));

router.get("/:id/edit", mustLogin, isAuthor, catchAsync(campgrounds.showEditForm));

module.exports = router;