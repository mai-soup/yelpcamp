const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SchemaTypes = mongoose.SchemaTypes;

const ImageSchema = new Schema({
    filename: {
        type: String,
        required: true
    },
    original_url: {
        type: String,
        required: true
    }
});

ImageSchema.virtual("thumbnail").get(function () {
    return this.original_url.replace("/upload", "/upload/c_fill,h_200,w_261");
});

ImageSchema.virtual("url").get(function () {
    return this.original_url.replace("/upload", "/upload/c_fill,h_400,w_600");
});

const CampgroundSchema = new Schema({
    // TODO: update required fields
    title: String,
    price: Number,
    description: String,
    location: String,
    images: [ImageSchema],
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