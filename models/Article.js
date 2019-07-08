var mongoose = require("mongoose");

// Save reference to constructor

var Schema = mongoose.Schema;

// create new object

var ArticleSchema = new Schema({

  //string types

  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true
  },

  summary: {
    type: String,
    required: true
  },

  image: {
    type: String,
    required: true
  },

  saved: {
		type: Boolean
  },
  
  // ref property links ObjectId 
 
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// creates model from the above schema

var Article = mongoose.model("Article", ArticleSchema);

// Export Article model

module.exports = Article;