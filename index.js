const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("HEYO FROM YELPCAMP");
})

app.listen(3000, () => {
    console.log("servin on 3000");
});