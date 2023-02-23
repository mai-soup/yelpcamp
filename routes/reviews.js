const express = require("express");
const router = express.Router({ mergeParams: true });
const { mustLogin } = require("../middleware");
const catchAsync = require("../utils/catchAsync");
const reviews = require("../controllers/reviews");

router.post("/", mustLogin, catchAsync(reviews.create));

router.delete("/:reviewId", mustLogin, catchAsync(reviews.delete));

module.exports = router;