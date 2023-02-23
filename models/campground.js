const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SchemaTypes = mongoose.SchemaTypes;

const CampgroundSchema = new Schema({
    // TODO: update required fields
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String,
    date: {
        type: Date,
        default: Date.now
    },
    author: {
        type: SchemaTypes.ObjectId,
        ref: "User",
        required: true,
    },
});

module.exports = mongoose.model("Campground", CampgroundSchema);