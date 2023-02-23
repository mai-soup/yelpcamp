const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SchemaTypes = mongoose.SchemaTypes;

const ReviewSchema = new Schema({
    rating: {
        type: Number,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    author: {
        type: SchemaTypes.ObjectId,
        ref: "User",
        required: true,
    },
    campground: {
        type: SchemaTypes.ObjectId,
        ref: "Campground",
        required: true
    }
});

module.exports = mongoose.model("Review", ReviewSchema);