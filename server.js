var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var hbs = require("handlebars");

// Scraping tools

var axios = require("axios");
var cheerio = require("cheerio");

// Require models

var db = require("./models");

// Initialize Express

var app = express();

// set up middleware

app.use(logger("dev"));

// Use body-parser for handling form submissions

app.use(bodyParser.urlencoded({ extended: false }));

// Use express.static to serve the public folder as a static directory

app.use(express.static(process.cwd() + "/public"));
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


var PORT = process.env.PORT || 3000;
mongoose.Promise = Promise;
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoScraper";
mongoose.connect(MONGODB_URI);

// Route for getting all saved Articles from the db

app.get("/", function(req, res) {
  db.Article
    .find({saved: false})
    .then(function(dbArticle) {
      var hbsObject = {
        articles: dbArticle
      };
      res.render("index", hbsObject);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// A GET route for scraping  website

app.get("/scrape", function(req, res) {
  var counter = 0;
 
  axios.get("https://www.cnn.com/specials/us/energy-and-environment").then(function(response) {

    var $ = cheerio.load(response.data);
   
    $(".cd__wrapper").each(function(i, element) {



      var result = {};

      result.link = $(this).children(".cd__content").children("h3").children("a").attr("href");
      result.title = $(this).children(".cd__content").children("h3").text().trim();
      // result.summary = $(this).children(".cd__content").children("h3").children("a").children("span").text().trim();
      // result.summary = $(this).children("cd__headline-text").text().trim();
      // // result.summary = $(this).find("p.summary").text();
      // result.summary = $(this).find("p.summary").text();
    
      result.saved = false;

      console.log (result);

      if (result.title && result.link && result.summary) {
        counter++;
        db.Article
        .create(result)
        .then(function(dbArticle) {
          res.send("You've scraped " + counter + " articles!");
        })
        .catch(function(err) {
          res.json(err);
        });
      };
    });
  });
});

// Route for grabbing a specific Article by id, update status to "saved"

app.post("/save/:id", function(req, res) {
  db.Article
    .update({ _id: req.params.id }, { $set: {saved: true}})
    .then(function(dbArticle) {
      res.json("dbArticle");
    })
    .catch(function(err) {
      res.json(err);
    });
});

//Route to render articles to handlebars and populate with saved articles

app.get("/saved", function(req, res) {
  db.Article
  .find({ saved: true })
  .then(function(dbArticles) {
    var hbsObject = {
      articles: dbArticles
    };
    res.render("saved", hbsObject);
  })
  .catch(function(err){
    res.json(err);
  });
});


//get route to retrieve all notes for a particlular article

app.get('/getNotes/:id', function (req,res){
  db.Article
    .findOne({ _id: req.params.id })
    .populate('note')
    .then(function(dbArticle){
      res.json(dbArticle);
    })
    .catch(function(err){
      res.json(err);
    });
});

//post route to create a new note in the database

app.post('/createNote/:id', function (req,res){
  db.Note
    .create(req.body)
    .then(function(dbNote){
      return db.Article.findOneAndUpdate( {_id: req.params.id }, { note: dbNote._id }, { new:true });
  
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//route to delete note

app.post("/delete/:id", function (req, res) {
  Note.remove({
    "_id":req.params.id
  }).exec(function (error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      console.log("note deleted");
      res.redirect("/" );
    }

  });
});

// Start the server

app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});