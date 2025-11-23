const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  subjectCode: String,
  filename: String,
  filePath: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Note', noteSchema);
