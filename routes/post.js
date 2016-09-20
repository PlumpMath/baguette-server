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
  //GET /api/post/:post_id
  app.get('/api/post/:post_id', function(req, res) {
    reqAddr = '/api/post' + req.params.post_id;
    logger.logReq(reqAddr);
    if (req.params.post_id == undefined) {
      logger.logError(reqAddr, MISSING_MESSAGE);
      return res.status(400).json({
        result: 0
      });
    }
    Post.find({
      "_id": req.params.post_id
    }, function(error, posts) {
      if (error) {
        logger.logError(reqAddr, err);
        return res.status(500).json({
          result: 0
        });
      } else if (!posts[0]) {
        logger.logError(reqAddr, NO_POST_MESSAGE);
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

  //POST /api/post/write
  app.post('/api/post/write', function(req, res) {
    reqAddr = '/api/post/write';
    logger.logReq(reqAddr);
    if (req.body.uploaderID == undefined) {
      logger.logError(reqAddr, MISSING_MESSAGE);
      return res.status(400).json({
        result: 0
      });
    }
    var post = new Post();
    post.uploader = req.body.uploaderID;
    if (req.body.explanation != undefined) {
      post.explanation = req.body.explanation;
    }
    post.title = req.body.title;
    post.comments = new Array();

    User.findOne({
      _id: req.body.uploaderID
    }, function(err, User) {
      if (!User) {
        logger.logError(reqAddr, 'User not found');
        return res.status(404).json({
          result: 0
        });
      }
      post.uploaderName = User.screenName;
      post.save(function(err, post) {
        if (err) {
          logger.logError(reqAddr, err);
          return res.status(500).json({
            result: 0
          });
        } else {
          logger.logOk(reqAddr);
          return res.status(200).json({
            result: 1,
            postid: post._id
          });
        }
      });
    });
  });

  //POST /api/post/:post_id/comment
  app.post('/api/post/:post_id/comment', function(req, res) {
    reqAddr = '/api/post/' + req.params.post_id + '/comment';
    logger.logReq(reqAddr);
    if (req.body.user_id == undefined || req.body.content == undefined) {
      logger.logError(reqAddr, MISSING_MESSAGE);
      return res.status(400).json({
        result: 0
      });
    }
    User.find({
      _id: req.body.user_id
    }, function(err, Users) {
      if (err) {
        logger.logError(reqAddr, err);
        return res.status(500).json({
          result: 0
        });
      }
      if (!Users[0]) {
        logger.logError(reqAddr, 'User not found');
        return res.status(404).json({
          result: 0
        });
      }
      Post.find({
        "_id": mongoose.Types.ObjectId(req.params.post_id)
      }, function(err, post) {
        if (err) {
          logger.logError(reqAddr, err);
          return res.status(500).json({
            result: 0
          });
        } else if (!post[0]) {
          logger.logError(reqAddr, NO_POST_MESSAGE);
          return res.status(404).json({
            result: 0
          });
        } else {
          Post.update({
            "_id": mongoose.Types.ObjectId(req.params.post_id)
          }, {
            "$push": {
              "comments": {
                "uploader": req.body.user_id,
                "uploaderID": Users[0].userIDString,
                "uploaderUsername": Users[0].screenName,
                "content": req.body.content,
                "uploadTime": Date.now
              }
            }
          }, function(err, output) {
            if (err) {
              logger.logError(reqAddr, err);
              return res.status(500).json({
                result: 0
              });
            } else if (!output.n) {
              logger.logError(reqAddr, NO_POST_MESSAGE);
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
        }
      });
    });

    //POST /api/post/:post_id/like
    app.post('/api/post/:post_id/like', function(req, res) {
      reqAddr = '[req] /api/post/' + req.params.post_id + '/like';
      logger.logReq(reqAddr);
      if (req.body.user_id == undefined) {
        logger.logError(reqAddr, MISSING_MESSAGE);
        return res.status(400).json({
          result: 0
        });
      }
      Post.update({
        "_id": mongoose.Types.ObjectId(req.params.post_id)
      }, {
        "$addToSet": {
          "likes": req.body.user_id
        }
      }, function(err, output) {
        if (err) {
          logger.logError(reqAddr, err);
          return res.status(500).json({
            result: 0
          });
        } else if (!output.n) {
          logger.logError(reqAddr, NO_POST_MESSAGE);
          return res.status(404).json({
            result: 0
          });
        } else if (output.nModified == 0) {
          logger.logOk(reqAddr, 'Already liked');
          return res.status(200).json({
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

    //POST /api/post/:post_id/unlike
    app.post('/api/post/:post_id/unlike', function(req, res) {
      reqAddr = '[req] /api/post/' + req.params.post_id + '/unlike';
      logger.logReq(reqAddr);
      if (req.body.user_id == undefined) {
        logger.logError(reqAddr, MISSING_MESSAGE);
        return res.status(400).json({
          result: 0
        });
      }
      Post.update({
        "_id": mongoose.Types.ObjectId(req.params.post_id)
      }, {
        "$pull": {
          "likes": req.body.user_id
        }
      }, function(err, output) {
        if (err) {
          logger.logError(reqAddr, err);
          return res.status(500).json({
            result: 0
          });
        } else if (!output.n) {
          logger.logError(reqAddr, NO_POST_MESSAGE);
          return res.status(404).json({
            result: 0
          });
        } else if (output.nModified == 0) {
          logger.logOk(reqAddr, 'Not liked');
          return res.status(200).json({
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

    //GET /api/post/user/:user_id_string
    app.get('/api/post/user/:user_id_string', function(req, res) {
      reqAddr = '/api/post/user/' + req.params.user_id_string;
      logger.logReq(reqAddr);
      User.find({
        userIDString: req.params.user_id_string
      }, function(err, targetUser) {
        if (err) {
          logger.logError(reqAddr, err);
          res.status(500).json({
            result: 0
          });
        } else if (!targetUser[0]) {
          logger.logError(reqAddr, err);
          res.status(404).json({
            result: 0
          });
        } else {
          Post.find({
            uploader: targetUser[0]._id
          }, function(err, post) {
            if (err) {
              logger.logError(reqAddr, err);
              res.status(500).json({
                result: 0
              });
            } else {
              logger.logOk(reqAddr);
              return res.status(200).json({
                result: 1,
                "posts": post
              });
            }
          });
        }
      });
    });
  });
}
