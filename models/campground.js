const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const SchemaTypes = mongoose.SchemaTypes;

const CampgroundSchema = new Schema({
    // TODO: update required fields
    title: String,
    price: Number,
    description: String,
    location: String,
    images: [
        {
            filename: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
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