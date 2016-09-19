var colors = require('colors');
var mongoose = require('mongoose');

exports.logError = function(loc, error) {
  if (typeOf(error) == 'string') {
      console.log(('[err] '+loc+': '+error).red);
  } else {
    console.log(('[err] '+loc+': '+error.message).red);
    console.log(error.red);
  }
};
exports.logReq = function(loc) {
  console.log(('[req] '+loc).blue);
};
exports.logOk = function(loc, message) {
  if (message) {
    console.log(('[ok ] '+loc+': '+message).green);
  } else {
    console.log(('[ok ] '+loc).green);
  }
}

//res.status(500).json({result: 0});
/*
console.logError('/upload/content-images/'+req.params.filename, err);
res.status(500).json({result: 0});

    logger.logReq('/upload/content-images/'+req.params.filename);


*/
