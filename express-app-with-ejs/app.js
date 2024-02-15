const express = require("express");
require("dotenv").config();

const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index", {
        title: "Home Page"
    });
});

module.exports = app;
