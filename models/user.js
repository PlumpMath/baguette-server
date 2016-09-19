var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  //user profile image dir: /public/profile-images/profile-{_id}
  userIDString: String,
  screenName: String,
  password: String,
  quote: String,
  following: Array,
  followers: Array,
  posts: Array,
});

module.exports = mongoose.model('user', userSchema);
