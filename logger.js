var colors = require('colors');
var mongoose = require('mongoose');

exports.logError = function(loc, error) {
  console.log(('[err] '+loc+': '+error.message).red);
  console.log(error.red);
};
exports.logReq = function(loc) {
  console.log(('[req] '+loc).blue);
};
exports.logOk = function(loc) {
  console.log(('[ok ] '+loc).green);
}

//res.status(500).json({result: 0});
/*
console.logError('/upload/content-images/'+req.params.filename, err);
res.status(500).json({result: 0});

    logger.logReq('/upload/content-images/'+req.params.filename);


*/
