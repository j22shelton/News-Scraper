var mongoose = require("mongoose");

// Save reference to the Schema constructor

var Schema = mongoose.Schema;

// create new NoteSchema object

var NoteSchema = new Schema({

  // String types

  title: String,
  
  body: String
});

// using mongoose's model method to create model

var Note = mongoose.model("Note", NoteSchema);

// Export the Note model

module.exports = Note;