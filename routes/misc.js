var Post = require('../models/post');
var User = require('../models/user');
var colors = require('colors');
var mongoose = require('mongoose');
var multer = require('multer');
var fs = require('fs');
var logger = require('./logger');

const MISSING_MESSAGE = 'Someting is missing';
const NO_USER_MESSAGE = 'No such user';
const NO_POST_MESSAGE = 'Post not found';

module.exports = function(app) {
  //POST /api/user/idfromCode/:id
  app.get('/api/user/idfromCode/:id', function(req, res) {
    reqAddr = '/api/user/idfromCode/' + req.params.id;
    logger.logReq(reqAddr);
    User.find({
      _id: req.params.id
    }, function(err, targetUser) {
      console.log(targetUser);
      if (!targetUser[0]) {
        logger.logError(reqAddr, err);
        res.status(404).json({
          result: 0
        });
      }
      if (err) {
        logger.logError(reqAddr, err);
        res.status(500).json({
          result: 0
        });
      } else {
        logger.logOk(reqAddr);
        return res.status(200).json(targetUser[0].userIDString);
      }
    });
  });
}
