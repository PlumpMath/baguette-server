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
  //PUT /api/user/change/screenname
  app.put('/api/user/change/screenname', function(req, res) {
    reqAddr = '/api/user/change/screenname';
    logger.logReq(reqAddr);
    if (req.body.userIDString == undefined) {
      logger.logError(reqAddr, MISSING_MESSAGE);
      return res.status(400).json({
        result: 0
      });
    }
    User.findOne({
      userIDString: req.body.userIDString
    }, function(err, User) {
      if (!User) {
        logger.logError(reqAddr, NO_USER_MESSAGE);
        return res.status(404).json({
          result: 0
        });
      }
      if (err) {
        logger.logError(reqAddr, err);
        return res.status(500).json({
          result: 0
        });
      }
      User.collection.update({
        "_id": User._id
      }, {
        $set: {
          "screenName": req.body.newScreenName
        }
      }, function(err, output) {
        if (err) {
          logger.logError(reqAddr, err);
          return res.status(500).json({
            result: 0
          });
        } else if (!output.result.n) {
          logger.logError(reqAddr, NO_USER_MESSAGE);
          return res.status(404).json({
            result: 0
          });
        } else {
          logger.logOk(reqAddr);
          return res.status(200).json({
            result: 1
          });
        }
      });
    });
  });

  //PUT /api/user/change/password
  app.put('/api/user/change/password', function(req, res) {
    reqAddr = '/api/user/change/password';
    logger.logReq(reqAddr);
    if (req.body.password == undefined) {
      logger.logError(reqAddr, MISSING_MESSAGE);
      return res.status(400).json({
        result: 0
      });
    }
    User.findOne({
      userIDString: req.body.userIDString
    }, function(err, User) {
      if (!User) {
        logger.logError(reqAddr, NO_USER_MESSAGE);
        return res.status(404).json({
          result: 0
        });
      }
      if (err) {
        logger.logError(reqAddr, err);
        return res.status(500).json({
          result: 0
        });
      }
      User.collection.update({
        "_id": User._id
      }, {
        $set: {
          "password": req.body.password
        }
      }, function(err, output) {
        if (err) {
          logger.logError(reqAddr, err);
          return res.status(500).json({
            result: 0
          });
        } else if (!output.result.n) {
          logger.logError(reqAddr, NO_USER_MESSAGE);
          return res.status(404).json({
            result: 0
          });
        } else {
          logger.logOk(reqAddr);
          return res.status(200).json({
            result: 1
          });
        }
      });
    });
  });

  //PUT /api/user/change/quote
  app.put('/api/user/change/quote', function(req, res) {
    reqAddr = '/api/user/change/quote';
    logger.logReq(reqAddr);
    if (req.body.quote == undefined) {
      logger.logError(reqAddr, MISSING_MESSAGE);
      return res.status(400).json({
        result: 0
      });
    }
    User.findOne({
      userIDString: req.body.userIDString
    }, function(err, User) {
      if (!User) {
        logger.logError(reqAddr, NO_USER_MESSAGE);
        return res.status(404).json({
          result: 0
        });
      }
      if (err) {
        logger.logError(reqAddr, err);
        return res.status(500).json({
          result: 0
        });
      }
      User.collection.update({
        "_id": User._id
      }, {
        $set: {
          "quote": req.body.quote
        }
      }, function(err, output) {
        if (err) {
          logger.logError(reqAddr, err);
          return res.status(500).json({
            result: 0
          });
        } else if (!output.result.n) {
          logger.logError(reqAddr, NO_USER_MESSAGE);
          return res.status(404).json({
            result: 0
          });
        } else {
          logger.logOk(reqAddr);
          return res.status(200).json({
            result: 1
          });
        }
      });
    });
  });
}
