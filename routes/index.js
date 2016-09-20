var Post = require('../models/post');
var User = require('../models/user');
var colors = require('colors');
var mongoose = require('mongoose');
var multer = require('multer');
var fs = require('fs');
var logger = require('./logger');
var ImageUpload = multer({
  dest: '/upload'
});

const MISSING_MESSAGE = 'Someting is missing';
const NO_USER_MESSAGE = 'No such user';
const NO_POST_MESSAGE = 'Post not found';

module.exports = function(app) {
  app.post('/upload/content-images/:filename', ImageUpload.single('image'), function(req, res) {
    uploadFile(req, res, '/upload/content-images/' + req.params.filename);
  });

  app.post('/upload/profile-images/:filename', ImageUpload.single('image'), function(req, res, next) {
    uploadFile(req, res, '/upload/profile-images/' + req.params.filename);
  });

  app.post('/upload/background-images/:filename', ImageUpload.single('image'), function(req, res, next) {
    uploadFile(req, res, '/upload/background-images/' + req.params.filename);
  });

  app.post('/upload/voices/:filename', ImageUpload.single('voice'), function(req, res, next) {
    uploadFile(req, res, '/upload/voices/' + req.params.filename);
  });

  app.get('/', function(req, res) {
    res.render('index.html');
  });

  app.get('/api/user/:userIDString/stream', function(req, res) {
    console.log(("[req] /api/user" + req.params.userIDString + "/stream").blue);
    if (req.params.userIDString == undefined) {
      console.error(("[req] /api/user" + req.params.userIDString + "/stream: field userIDString is empty").red);
      return res.json({
        result: 0
      });
    }
    User.findOne({
      userIDString: req.params.userIDString
    }, function(err, user) {
      if (!user) {
        console.log("[req] /api/user" + req.params.userIDString + "/stream: User not found".red);
        return res.status(404).json({
          error: 'user not found'
        });
      }
      if (err) {
        console.log("[req] /api/user" + req.params.userIDString + "/stream".red);
        console.log(err);
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
          console.log(user.following);
          console.log("[req] /api/user" + req.params.userIDString + "/stream".red);
          console.log(err);
          return res.status(500).json({
            result: 0
          });
        } else return res.status(200).json({
          result: 1,
          posts: posts
        });
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

  //GET /api/user/:userIDString/stream
  app.get('/api/user/:userIDString/stream', function(req, res) {
    reqAddr = '/api/user' + req.params.userIDString + '/stream';
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

  //POST /api/user/:user_id_string
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

  //POST /api/user/search/:user_id_string
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

  function uploadFile(req, res, fileDir) {
    logger.logReq(fileDir);
    fs.readFile(req.file.path, function(err, data) {
      if (err) {
        logger.logError(fileDir, err);
        return res.status(500).json({
          result: 0
        });
      } else {
        var newPath = __dirname + '/..' + fileDir.replace('upload', 'public');
        fs.writeFile(newPath, data, function(err) {
          if (err) {
            logger.logError(fileDir, err);
            return res.status(500).json({
              result: 0
            });
          } else {
            logger.logOk(fileDir);
            return res.status(200).json({
              result: 1,
              fileLocation: '/content-images/' + req.params.filename
            });
          }
        });
      }
    });
  }
}
