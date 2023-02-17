const mongoose = require("mongoose");
const cities = require("./cities");
const { descriptors, nouns } = require("./seedHelpers");
const Campground = require("../models/campground");
const loremIpsum = require("lorem-ipsum").loremIpsum;

mongoose.connect("mongodb://127.0.0.1:27017/yelpcamp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("db connected");
});

const sample = (arr) => {
    const s = arr[Math.floor(Math.random() * arr.length)];
    return s[0].toUpperCase() + s.slice(1);
};

const seedDB = async () => {
    await Campground.deleteMany({}); // delete all campgrounds
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const c = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(nouns)}`,
            image: "https://source.unsplash.com/collection/1114848",
            description: loremIpsum({ sentenceLowerBound: 5, sentenceUpperBound: 30 }),
            price: (Math.floor(Math.random() * 2999) + 1000) / 100
        });
        await c.save();
    }
};

seedDB().then(() => {
    db.close();
});