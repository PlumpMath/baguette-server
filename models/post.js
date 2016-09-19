var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postSchema = new Schema({
  uploader: Schema.ObjectId , //User document ID string
  uploaderName: String,
  title: String,
  uploadTime: { type: Date, default: Date.now},
  explanation: String,
  likes: Array,
  comments: Array
});

module.exports = mongoose.model('post', postSchema);
