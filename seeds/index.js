const mongoose = require("mongoose");
const cities = require("./cities");
const { descriptors, nouns } = require("./seedHelpers");
const Campground = require("../models/campground");
const User = require("../models/user")
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
    const author = await User.findById("63f68614766d371556975a13");
    if (!author) console.error("NO USER WITH THAT ID FOUND");
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const locationString = `${cities[random1000].city}, ${cities[random1000].state}`;
        const coords = [cities[random1000].longitude, cities[random1000].latitude];
        const c = new Campground({
            location: locationString,
            title: `${sample(descriptors)} ${sample(nouns)}`,
            images: [
                {
                    filename: 'YelpCamp/xfstmyh2qzk3i5dyo7mo',
                    original_url: 'https://res.cloudinary.com/dmivfa33d/image/upload/v1677188764/YelpCamp/xfstmyh2qzk3i5dyo7mo.jpg',
                },
                {
                    filename: 'YelpCamp/pyrukgy6ozvgyhqwlbqf',
                    original_url: 'https://res.cloudinary.com/dmivfa33d/image/upload/v1677188766/YelpCamp/pyrukgy6ozvgyhqwlbqf.jpg',
                }
            ],
            description: loremIpsum({ sentenceLowerBound: 5, sentenceUpperBound: 30 }),
            price: (Math.floor(Math.random() * 2999) + 1000) / 100,
            author,
            geometry: {
                type: "Point",
                coordinates: coords
            }
        });
        await c.save();
    }
};

seedDB().then(() => {
    db.close();
});