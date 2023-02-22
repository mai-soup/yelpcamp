const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Campground", CampgroundSchema);