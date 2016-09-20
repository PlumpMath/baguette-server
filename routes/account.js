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

  //GET /api/user/login
  app.post('/api/user/login', function(req, res) {
    reqAddr = '/api/user/login';
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
      if (User.password != req.body.password) {
        logger.logError(reqAddr, 'Password wring');
        return res.status(404).json({
          result: 0
        });
      }
      logger.logOk(reqAddr);
      return res.status(200).json({
        result: 1,
        "user": User
      });
    });
  });

  //POST /api/user/add
  app.post('/api/user/add', function(req, res) {
    reqAddr = '/api/user/add';
    logger.logReq(reqAddr);
    var newUser = new User();
    newUser.userIDString = req.body.userIDString;
    newUser.screenName = req.body.screenName;
    newUser.password = req.body.password;
    newUser.quote = req.body.quote;
    newUser.following = new Array;
    newUser.followers = new Array;
    newUser.posts = new Array;
    if (req.body.userIDString == undefined || req.body.screenName == undefined || req.body.password == undefined || req.body.quote == undefined) {
      logger.logError(reqAddr, MISSING_MESSAGE);
      return res.status(400).json({
        result: 0
      });
    }
    User.find({
      "userIDString": req.body.userIDString
    }, function(err, users) {
      if (users[0]) {
        logger.logError(reqAddr, 'User already exists');
        return res.status(400).json({
          result: 0
        });
      }
      newUser.save(function(err) {
        if (err) {
          logger.logError(reqAddr, err);
          return res.status(500).json({
            result: 0
          });
        } else {
          User.find({
            "userIDString": req.body.userIDString
          }, function(err, users) {
            fs.createReadStream(__dirname + "/../public/profile_default.png").pipe(fs.createWriteStream(__dirname + "/../public/profile-images/image-" + users[0]._id + ".png"));
            fs.createReadStream(__dirname + "/../public/background_default.png").pipe(fs.createWriteStream(__dirname + "/../public/background-images/image-" + users[0]._id + ".png"));
            logger.logOk(reqAddr);
            return res.status(200).json({
              result: 1
            });
          });
        }
      });
    });
  });

  //GET /api/user/:userIDString/stream
  app.get('/api/user/:userIDString/stream', function(req, res) {
    reqAddr = '/api/user/' + req.params.userIDString + '/stream';
    logger.logReq(reqAddr);
    if (req.params.userIDString == undefined) {
      logger.logError(reqAddr, MISSING_MESSAGE);
      return res.status(400).json({
        result: 0
      });
    }
    User.findOne({
      userIDString: req.params.userIDString
    }, function(err, user) {
      if (!user) {
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
      console.log(user.following);
      Post.find({
        'uploader': {
          $in: user.following,
          $in: user._id
        }
      }, function(err, posts) {
        if (err) {
          logger.logError(reqAddr, err);
          return res.status(500).json({
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

  //GET /api/user/:user_id_string
  app.get('/api/user/:user_id_string', function(req, res) {
    reqAddr = '/api/user/' + req.params.user_id_string;
    logger.logReq(reqAddr);
    User.find({
        userIDString: req.params.user_id_string
      }, {
        userIDString: 1,
        screenName: 1,
        quote: 1,
        followers: 1,
        following: 1,
        posts: 1
      },
      function(err, usr) {
        if (err) {
          logger.logError(reqAddr, err);
          return res.status(500).json({
            result: 0
          });
        }
        if (!usr) {
          logger.logError(reqAddr, NO_USER_MESSAGE);
          return res.status(404).json({
            result: 0
          });
        }
        logger.logOk(reqAddr);
        return res.status(200).json(usr);
      });
  });

  //GET /api/user/search/:user_id_string
  app.get('/api/user/search/:user_id_string', function(req, res) {
    reqAddr = '/api/user/search' + req.params.user_id_string;
    logger.logReq(reqAddr);
    User.find({
        screenName: {
          "$regex": req.params.user_id_string
        }
      }, {
        userIDString: 1,
        screenName: 1
      },
      function(err, usr) {
        if (err) {
          logger.logError(reqAddr, err);
          return res.status(500).json({
            result: 0
          });
        }
        if (!usr) {
          logger.logError(reqAddr, NO_USER_MESSAGE);
          return res.status(404).json({
            result: 0
          });
        }
        logger.logOk(reqAddr);
        return res.status(200).json(usr);
      });
  });


    //POST /api/user/:user_id_string/follow
    app.post('/api/user/:user_id_string/follow', function(req, res) {
      reqAddr = '/api/user/' + req.params.user_id_string + '/follow';
      logger.logReq(reqAddr);
      User.find({
          userIDString: req.params.user_id_string
        },
        function(err, followingUsr) {
          if (err) {
            logger.logError(reqAddr, err);
            return res.status(500).json({
              result: 0
            });
          }
          if (!followingUsr[0]) {
            logger.logError(reqAddr, NO_USER_MESSAGE);
            return res.status(404).json({
              result: 0
            });
          }
          User.find({
              userIDString: req.body.followerUserIDString
            },
            function(err, followerUsr) {
              if (err) {
                logger.logError(reqAddr, err);
                return res.status(500).json({
                  result: 0
                });
              }
              if (!followerUsr[0]) {
                logger.logError(reqAddr, NO_USER_MESSAGE);
                return res.status(404).json({
                  result: 0
                });
              }
              User.collection.update({
                "_id": followerUsr[0]._id
              }, {
                "$addToSet": {
                  "following": followingUsr[0]._id
                }
              }, function(err, output) {
                if (err) {
                  logger.logError(reqAddr, err);
                  return res.status(500).json({
                    result: 0
                  });
                } else {
                  User.collection.update({
                    "_id": followingUsr[0]._id
                  }, {
                    "$addToSet": {
                      "followers": followerUsr[0]._id
                    }
                  }, function(err, output) {
                    if (err) {
                      logger.logError(reqAddr, err);
                      return res.status(500).json({
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
        });
    });

    //POST /api/user/:user_id_string/unfollow
    app.post('/api/user/:user_id_string/unfollow', function(req, res) {
      reqAddr = '/api/user/' + req.params.user_id_string + '/unfollow';
      logger.logReq(reqAddr);
      User.find({
          userIDString: req.params.user_id_string
        },
        function(err, followingUsr) {
          if (err) {
            logger.logError(reqAddr, err);
            return res.status(500).json({
              result: 0
            });
          }
          if (!followingUsr[0]) {
            logger.logError(reqAddr, NO_USER_MESSAGE);
            return res.status(404).json({
              result: 0
            });
          }
          User.find({
              userIDString: req.body.followerUserIDString
            },
            function(err, followerUsr) {
              if (err) {
                logger.logError(reqAddr, err);
                return res.status(500).json({
                  result: 0
                });
              }
              if (!followerUsr[0]) {
                logger.logError(reqAddr, NO_USER_MESSAGE);
                return res.status(404).json({
                  result: 0
                });
              }
              User.collection.update({
                "_id": followerUsr[0]._id
              }, {
                "$pull": {
                  "following": followingUsr[0]._id
                }
              }, function(err, output) {
                if (err) {
                  logger.logError(reqAddr, err);
                  return res.status(500).json({
                    result: 0
                  });
                } else {
                  User.collection.update({
                    "_id": followingUsr[0]._id
                  }, {
                    "$pull": {
                      "followers": followerUsr[0]._id
                    }
                  }, function(err, output) {
                    if (err) {
                      logger.logError(reqAddr, err);
                      return res.status(500).json({
                        result: 0
                      });
                    } else {
                      logger.logOk(reqAddr, err);
                      return res.status(200).json({
                        result: 1
                      });
                    }
                  });
                }
              });
            });
        });
    });

}
