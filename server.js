const express = require("express");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");

// Scraping tools
const cheerio = require("cheerio");
const axios = require("axios");

// Require models
var db = require("./models");

// Connect to MongoDB
mongoose.connect("mongodb://localhost/mongooseHwTest", { useNewUrlParser: true });

// Use handlebars and main layout
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

// Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Routes
app.get("/", function(req, res) {
    res.render("index", {
        msg: "Welcome!"
    });
});

app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("http://www.echojs.com/").then(function(response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("article h2").each(function(i, element) {
        // Save an empty result object
        var result = {};

        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this)
            .children("a")
            .text();
        result.link = $(this)
            .children("a")
            .attr("href");

        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
            .then(function(dbArticle) {
                // View the added result in the console
                console.log(dbArticle);
            })
            .catch(function(err) {
                // If an error occurred, log it
                console.log(err);
            });
        });

        // Send a message to the client
        res.send("Scrape Complete");
    });
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    db.Article.find({}).then(function(dbArticle){
        res.json(dbArticle);
    }).catch(function(err) {
        res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with its comments
app.get("/articles/:id", function(req, res) {
    db.Article.findOne({_id: req.params.id})
    .populate("comments")
    .then(function(dbArticle){
        res.json(dbArticle);
    }).catch(function(err) {
        // If an error occurs, send the error back to the client
        res.json(err);
    });
});

// Route for adding comments
app.post("/articles/:id", function(req, res) {
    db.Comment.create(req.body)
    .then(function(dbComment){
        db.Article.updateOne(
            {_id: req.params.id},
            {$push: {comments: dbComment._id}},
            {new: true}
        )
        .then(function(dbArticle){
            res.json(dbArticle);
        });
    }).catch(function(err) {
        res.json(err);
    });
});

app.delete("/comments/:id", function(req, res){
    console.log(req.params.id);
    db.Comment.deleteOne({_id: req.params.id})
    .then(function(dbComment){
        res.json(dbComment);
    }).catch(function(err) {
        res.json(err);
    });
});

// Start server
app.listen(PORT, function() {
    console.log("App running on port 3000!");
});