var Post = require('../models/post');
var User = require('../models/user');
var colors = require('colors');
var mongoose = require('mongoose');
var multer = require('multer');
var fs = require('fs');

var ImageUpload = multer({ dest: '/upload' })

module.exports = function(app) {

  app.post('/upload/content-images/:filename', ImageUpload.single('image'), function (req, res, next) {
    console.log(('[req] /upload/content-images/'+req.params.filename).blue);
    console.log(req.file);
    fs.readFile(req.file.path, function (err, data) {
      if (err) {
        console.log(('[err] /upload/content-images/'+req.params.filename).red);
        console.log(err);
        res.status(500).json({result: 0});
      }
      else {
        var newPath = __dirname + "/../public/content-images/"+req.params.filename;
        fs.writeFile(newPath, data, function(err) {
          if (err) {
            console.log(('[err] /upload/content-images/'+req.params.filename).red);
            console.log(err);
            res.status(500).json({result: 0});
          }
          else {
            console.log(('[ok ] /upload/content-images/'+req.params.filename).green);
            res.status(200).json({result: 1, fileLocation: "/content-images/"+req.params.filename });
          }
        });
      }
    });
  });

  app.post('/upload/profile-images/:filename', ImageUpload.single('image'), function (req, res, next) {
    console.log(('[req] /upload/profile-images/'+req.params.filename).blue);
    console.log(req.file);
    fs.readFile(req.file.path, function (err, data) {
      if (err) {
        console.log(('[err] /upload/profile-images/'+req.params.filename).red);
        console.log(err);
        res.status(500).json({result: 0});
      }
      else {
        var newPath = __dirname + "/../public/profile-images/"+req.params.filename;
        fs.writeFile(newPath, data, function(err) {
          if (err) {
            console.log(('[err] /upload/profile-images/'+req.params.filename).red);
            console.log(err);
            res.status(500).json({result: 0});
          }
          else {
            console.log(('[ok ] /upload/profile-images/'+req.params.filename).green);
            res.status(200).json({result: 1, fileLocation: "/profile-images/"+req.params.filename });
          }
        });
      }
    });
  });

  app.post('/upload/background-images/:filename', ImageUpload.single('image'), function (req, res, next) {
    console.log(('[req] /upload/background-images/'+req.params.filename).blue);

    console.log(req.file);
    fs.readFile(req.file.path, function (err, data) {
      if (err) {
        console.log(('[err] /upload/background-images/'+req.params.filename).red);
        console.log(err);
        res.status(500).json({result: 0});
      }
      else {
        var newPath = __dirname + "/../public/background-images/"+req.params.filename;
        fs.writeFile(newPath, data, function(err) {
          if (err) {
            console.log(('[err] /upload/background-images/'+req.params.filename).red);
            console.log(err);
            res.status(500).json({result: 0});
          }
          else {
            console.log(('[ok ] /upload/background-images/'+req.params.filename).green);
            res.status(200).json({result: 1, fileLocation: "/background-images/"+req.params.filename });
          }
        });
      }
    });
  });

  app.post('/upload/voices/:filename', ImageUpload.single('voice'), function (req, res, next) {
    console.log(('[req] /upload/voices/'+req.params.filename).blue);
    console.log(req.file);
    fs.readFile(req.file.path, function (err, data) {
      if (err) {
        console.log(('[err] /upload/voices/'+req.params.filename).red);
        console.log(err);
        res.status(500).json({result: 0});
      }
      else {
        var newPath = __dirname + "/../public/voices/"+req.params.filename;
        fs.writeFile(newPath, data, function(err) {
          if (err) {
            console.log(('[err] /upload/voices/'+req.params.filename).red);
            console.log(err);
            res.status(500).json({result: 0});
          }
          else {
            console.log(('[ok ] /upload/voices/'+req.params.filename).green);
            res.status(200).json({result: 1, fileLocation: "/voices/"+req.params.filename });
          }
        });
      }
    });
  });

  app.get('/', function(req, res) {
    res.render('index.html');
  });

  //POST /api/user/
  app.post('/api/user/', function(req, res) {
    console.log(("[req] /api/user/").blue);
    if (req.body.userIDString==undefined || req.body.password==undefined) {
      console.error("[err] /api/user/: something is empty".red);
      return res.status(400).json({result: 0});
    }
    console.log(req.body);
    User.find({userIDString: req.body.userIDString}, function(err,User) {
      if (err) {
        console.log("[err] /api/user/".red);
        console.log(err);
        return res.status(500).json( {result: 0});
      }
      else if (!User[0]) {
        console.log("[err] /api/user/: user not found".red);
        return res.status(404).json({ result: 0, error: 'User not found' });
      }
      else if (req.body.password != User[0].password)
        return res.status(400).json({ result: 0, error: 'Password incorrect'});
      else return res.status(200).json({ result: 1, user: User[0]});
    });
    console.log("[ok ] /api/user/".blue);
  });

  app.post('/api/user/add', function(req,res) {
    console.log("[req] /api/user/add".blue);
    var newUser = new User();
    newUser.userIDString = req.body.userIDString;
    newUser.screenName = req.body.screenName;
    newUser.password = req.body.password;
    newUser.quote = req.body.quote;
    newUser.following = new Array;
    newUser.followers = new Array;
    newUser.posts = new Array;
    if (req.body.userIDString==undefined || req.body.screenName==undefined || req.body.password==undefined || req.body.quote==undefined) {
      console.log("[ok ] /api/user/add: something is empty".green);
      return res.status(400).json({result: 0});
    }
    User.find({"userIDString": req.body.userIDString}, function(err, users) {
      if (users[0]) {
        console.log("[ok ] /api/user/add: User already exists".green);
        return res.status(400).json({result: 0});
      }
      newUser.save(function(err) {
        if (err) {
          console.error("[err] /api/user/add");
          console.error(err);
          res.json({result: 0});
        }
        else
        {
          User.find({"userIDString": req.body.userIDString}, function(err, users) {
            fs.createReadStream(__dirname + "/../public/profile_default.png").pipe(fs.createWriteStream(__dirname + "/../public/profile-images/image-"+users[0]._id+".png"));
            fs.createReadStream(__dirname + "/../public/background_default.png").pipe(fs.createWriteStream(__dirname + "/../public/background-images/image-"+users[0]._id+".png"));
            console.log("[ok ] /api/user/add".green);
            return res.status(200).json({result: 1});
          });
        }
      });
    });
  });
  app.post('/api/user/login', function(req, res) {
    User.findOne({userIDString: req.body.userIDString}, function(err,User) {
      if (!User){
        console.log("[err] /api/user/login: User not found".red);
        return res.status(404).json({ error: 'user not found' });
      }
      if (User.password != req.body.password) {
        console.log("[err] /api/user/login: Password is wrong");
        return res.status(400).json({ result: 0});
      }
      console.log("[ok ] /api/user/login".green);
      return res.status(200).json({ result: 1, "user": User});
      });
    });

  app.get('/api/user/:userIDString/stream', function(req, res) {
    console.log(("[req] /api/user"+req.params.userIDString+"/stream").blue);
    if (req.params.userIDString == undefined) {
      console.error(("[req] /api/user"+req.params.userIDString+"/stream: field userIDString is empty").red);
      return res.json({result: 0});
    }
    User.findOne({userIDString: req.params.userIDString}, function(err,user) {
      if (!user){
        console.log("[req] /api/user"+req.params.userIDString+"/stream: User not found".red);
        return res.status(404).json({ error: 'user not found' });
      }
      if (err) {
        console.log("[req] /api/user"+req.params.userIDString+"/stream".red);
        console.log(err);
        return res.status(500).json({result: 0});
      }
      console.log(user.following);
      Post.find({'uploader': { $in : user.following, $in : user._id  }}, function (err, posts) {
        if (err) {
          console.log(user.following);
          console.log("[req] /api/user"+req.params.userIDString+"/stream".red);
          console.log(err);
          return res.status(500).json({result: 0});
        }
        else return res.status(200).json({result: 1, posts: posts });
      });
    });
  });

  app.put('/api/user/change/screenname', function(req,res) {
    console.log("[req] /api/user/change/screenname".blue);
    if (req.body.userIDString == undefined) {
      console.error("/api/user/change/screenname: field userIDString is empty");
      return res.json({result: 0});
    }
    User.findOne({userIDString: req.body.userIDString}, function(err,User) {
      if (!User){
        console.log("[err] /api/user/change/screenname: User not found".red);
        return res.json({ error: 'user not found' });
      }
      if (err) {
        console.log("[err] /api/user/change/screenname".red);
        console.log(err);
        return res.status(500).json({result: 0});
      }
      User.collection.update({"_id": User._id}, {$set: {"screenName": req.body.newScreenName} }, function(err, output) {
        if (err) {
          console.log("[err] /api/user/change/screenname: Server error".red);
          console.log(err);
          return res.status(500).json({result: 0});
        }
        else if (!output.result.n) {
          console.log("/api/user/change/screenname: User not found");
          return res.status(404).json({result: 0});
        }
        else {
          return res.status(200).json({message:"Screenname updated"});
        }
      });
    });
      console.log("[ok ] /api/user/change/screenname".green);
  });


    app.put('/api/user/change/password', function(req,res) {
      console.log("[req] /api/user/change/password".blue);
      if (req.body.password == undefined) {
        console.error("/api/user/change/password: field userIDString is empty");
        return res.status(400).json({result: 0});
      }
      User.findOne({userIDString: req.body.userIDString}, function(err,User) {
        if (!User){
          console.log("[err] /api/user/change/password: User not found".red);
          return res.json({ error: 'user not found' });
        }
        if (err) {
          console.log("[err] /api/user/change/password".red);
          console.log(err);
          return res.status(500).json({result: 0});
        }
        User.collection.update({"_id": User._id}, {$set: {"password": req.body.password} }, function(err, output) {
          if (err) {
            console.log("[err] /api/user/change/password: Server error".red);
            console.log(err);
            return res.status(500).json({result: 0});
          }
          else if (!output.result.n) {
            console.log("/api/user/change/password: User not found");
            return res.status(404).json({result: 0});
          }
          else {
            return res.status(200).json({result: 1, message:"password updated"});
          }
        });
      });
        console.log("[ok ] /api/user/change/password".green);
    });

    app.put('/api/user/change/quote', function(req,res) {
      console.log("[req] /api/user/change/quote".blue);
      if (req.body.quote == undefined) {
        console.error("/api/user/change/quote: field userIDString is empty");
        return res.status(400).json({result: 0});
      }
      User.findOne({userIDString: req.body.userIDString}, function(err,User) {
        if (!User){
          console.log("[err] /api/user/change/quote: User not found".red);
          return res.json({ error: 'user not found' });
        }
        if (err) {
          console.log("[err] /api/user/change/quote".red);
          console.log(err);
          return res.status(500).json({result: 0});
        }
        User.collection.update({"_id": User._id}, {$set: {"quote": req.body.quote} }, function(err, output) {
          if (err) {
            console.log("[err] /api/user/change/quote: Server error".red);
            console.log(err);
            return res.status(500).json({result: 0});
          }
          else if (!output.result.n) {
            console.log("/api/user/change/quote: User not found");
            return res.status(404).json({result: 0});
          }
          else {
            return res.status(200).json({result: 1, message:"quote updated"});
          }
        });
      });
        console.log("[ok ] /api/user/change/quote".green);
    });

  app.get('/api/user/:user_id_string', function(req, res) {
    console.log(("[req] /api/user/"+req.params.user_id_string).blue);
    User.find({userIDString: req.params.user_id_string}, {userIDString: 1, screenName: 1, quote: 1, followers: 1, following: 1, posts: 1},
      function(err, usr) {
        if (err) {
          console.error(("[err] /api/user/"+req.params.user_id_string+": "+err.message).red);
          console.error(err);
          return res.status(500).json({result: 0});
        }
        if (!usr) {
          console.error(("[err] /api/user/"+req.params.user_id_string+": No such user").red);
          return res.status(404).json({result: 0});
        }
        res.json(usr);
        console.log(("[ok ] /api/user/"+req.params.user_id_string).green);
    });
  });
  app.get('/api/user/search/:user_id_string', function(req, res) {
    console.log(("[req] /api/user/search").blue);
    User.find({screenName: { "$regex": req.params.user_id_string} }, {userIDString: 1, screenName: 1 },
      function(err, usr) {
        if (err) {
          console.error(("[err] /api/user/search: "+err.message).red);
          console.error(err);
          return res.status(500).json({result: 0});
        }
        if (!usr) {
          console.error(("[err] /api/user/search: No such user").red);
          return res.status(404).json({result: 0});
        }
        res.json(usr);
        console.log(("[ok ] /api/user/search").green);
    });
  });

  app.post('/api/user/:user_id_string/follow', function(req, res) {
    console.log(("[req] /api/user/"+req.params.user_id_string+"/follow").blue);
    User.find({userIDString: req.params.user_id_string},
      function(err, followingUsr) {
        if (err) {
          console.error(("[err] /api/user/"+req.params.user_id_string+"/follow: "+err.message).red);
          console.error(err);
          return res.status(500).json({success: false});
        }
        if (!followingUsr[0]) {
          console.error(("[err] /api/user/"+req.params.user_id_string+"/follow: No such user").red);
          return res.status(404).json({message: "No such user"});
        }
        //user to follow found
        User.find({userIDString: req.body.followerUserIDString},
          function(err, followerUsr) {
            if (err) {
              console.error(("[err] /api/user/"+req.body.user_id_string+": "+err.message).red);
              console.error(err);
            }
            if (!followerUsr[0]) {
              console.error(("[err] /api/user/"+req.body.user_id_string+": No such user"+req.body.followerUserIDString).red);
              return res.status(404).json({message: "no such user"});
            }
            //user following found
            User.collection.update({"_id": followerUsr[0]._id}, { "$addToSet" : { "following" : followingUsr[0]._id } }, function(err, output) {
              if (err) {
                console.log(err);
                return res.json({error: "database failure"});
              }
              else {
                User.collection.update({"_id": followingUsr[0]._id}, { "$addToSet" : { "followers" : followerUsr[0]._id } }, function(err, output) {
                  if (err) {
                    console.log(err);
                    return res.json({error: "database failure"});
                  }
                  else {
                    return res.json({message:"follow complete"});
                  }
                });
              }
            });
            console.log(("[ok ] /api/user/"+req.params.user_id_string+"/follow").green);
        });
    });
  });

  app.post('/api/user/:user_id_string/unfollow', function(req, res) {
    console.log(("[req] /api/user/"+req.params.user_id_string+"/unfollow").blue);
    User.find({userIDString: req.params.user_id_string},
      function(err, followingUsr) {
        if (err) {
          console.error(("[err] /api/user/"+req.params.user_id_string+"/unfollow: "+err.message).red);
          console.error(err);
        }
        if (!followingUsr[0]) {
          console.error(("[err] /api/user/"+req.params.user_id_string+"/unfollow: No such user").red);
          return res.status(404).json({message: "no such user"});
        }
        //user to follow found
        User.find({userIDString: req.body.followerUserIDString},
          function(err, followerUsr) {
            if (err) {
              console.error(("[err] /api/user/"+req.params.user_id_string+": "+err.message).red);
              console.error(err);
            }
            if (!followerUsr[0]) {
              console.error(("[err] /api/user/"+req.params.user_id_string+": No such user"+req.body.followerUserIDString).red);
              return res.status(404).json({message: "no such user"});
            }
            //user following found
            User.collection.update({"_id": followerUsr[0]._id}, { "$pull" : { "following" : followingUsr[0]._id } }, function(err, output) {
              if (err) {
                console.log(err);
                return res.json({error: "database failure"});
              }
              else {
                User.collection.update({"_id": followingUsr[0]._id}, { "$pull" : { "followers" : followerUsr[0]._id } }, function(err, output) {
                  if (err) {
                    console.log(err);
                    return res.json({error: "database failure"});
                  }
                  else {
                    return res.json({message:"unfollow complete"});
                  }
                });
              }
            });
            console.log(("[ok ] /api/user/"+req.params.user_id_string+"/unfollow").green);
        });
    });
  });

  app.get('/api/post/:post_id', function(req, res) {
    console.log(("[req] /api/post"+req.params.post_id).blue);
    if (req.params.post_id==undefined) {
      console.error(("[req] /api/post"+req.params.post_id+": something is empty").red);
      return res.status(400).json({result:0});
    }
    Post.find({"_id": req.params.post_id}, function(error, posts) {
      if (error) {
        console.error(("[err] /api/post"+req.params.post_id).red);
        console.error(error);
        return res.status(500).json({result: 0});
      }
      else if (!posts[0]) {
        console.error(("[ok ] /api/post"+req.params.post_id).green);
        return res.status(404).json({result: 0});
      }
      else return res.status(200).json({result: 1, post: posts[0]})
    });
  });

  //POST /api/post/write
  app.post('/api/post/write', function(req, res) {
    console.log(("[req] /api/post/write").blue);
    console.log(req.body);
    if (req.body.uploaderID==undefined) {
      console.error("[err] /api/post/write: something is empty");
      return res.status(404).json({result: 0});
    }
    var post = new Post();
    post.uploader = req.body.uploaderID;
    if (req.body.explanation != undefined)
      post.explanation = req.body.explanation;
    post.title = req.body.title;
    post.comments = new Array();

    User.findOne({_id: req.body.uploaderID}, function(err,User) {
      if (!User){
        console.log("[err] /api/post/write: user not found".red);
        return res.json({ error: 'user not found' });
      }
      post.uploaderName = User.screenName;
      post.save(function(err, post) {
        if (err) {
          console.error("error");
          return res.status(500).json({result: 0});
        }
        else return res.status(200).json({result: 1, postid: post._id});
      });
    });
    console.log("[ok ] /api/post/write".blue);
  });

  //POST /api/post/:post_id/comment
  app.post('/api/post/:post_id/comment', function(req, res) {
    console.log(('[req] /api/post/'+req.params.post_id+"/comment").blue);
    if (req.body.user_id==undefined || req.body.content==undefined) {
      console.error(('[err] /api/post/'+req.params.post_id+"/comment: Something is missing").red);
      return res.status(400).json({result: 0});
    }
    User.find({ _id: req.body.user_id }, function(err, Users) {
      if (err) {
        console.error(('[err] /api/post/'+req.params.post_id+"/comment").red);
        return res.status(500).json({result: 0});
      }
      if (!Users[0]) {
        console.error(('[err] /api/post/'+req.params.post_id+"/comment: User not found").red);
        return res.status(404).json({result: 0});
      }
      Post.find({ "_id": mongoose.Types.ObjectId(req.params.post_id) }, function(err, post) {
      if (err) {
        console.error(('[err] /api/post/'+req.params.post_id+"/comment").red);
        console.error(err);
        return res.status(500).json({result: 0});
      }
      else if (!post[0]) {
        console.error(('[err] /api/post/'+req.params.post_id+"/comment: Post not found").red);
        return res.status(404).json({result: 0});
      }
      else Post.update({ "_id": mongoose.Types.ObjectId(req.params.post_id) }, {"$push": {"comments": { "uploader": req.body.user_id, "uploaderID": Users[0].userIDString, "uploaderUsername": Users[0].screenName, "content": req.body.content, "uploadTime": Date.now } } }, function(err, output) {
       if (err) {
         console.error(('[err] /api/post/'+req.params.post_id+"/comment").red);
         console.error(err);
         return res.status(500).json({result: 0});
       }
       else if (!output.n) {
         console.error(('[err] /api/post/'+req.params.post_id+"/comment: Post not found").red);
         return res.status(404).json({result: 0});
       }
       else {
         console.log(('[ok ] /api/post/'+req.params.post_id+"/comment").green)
         return res.status(200).json({result: 1});
       }
     });
    });
    });
  });

  //POST /api/post/:post_id/like
  app.post('/api/post/:post_id/like', function(req, res) {
    console.log(('[req] /api/post/'+req.params.post_id+"/like").blue);
    if (req.body.user_id==undefined) {
      console.error(('[req] /api/post/'+req.params.post_id+"/like: Something is empty").red);
    }
     Post.update({ "_id": mongoose.Types.ObjectId(req.params.post_id) }, {"$addToSet": {"likes": req.body.user_id}}, function(err, output) {
      if (err) {
        console.error(('[err] /api/post/'+req.params.post_id+"/like").red);
        console.error(err);
        return res.status(500).json({result: 0});
      }
      else if (!output.n) {
        console.error(('[err] /api/post/'+req.params.post_id+"/like: Post not found").red);
        return res.status(500).json({result: 0});
      }
      else if (output.nModified == 0) {
        console.log(('[ok ] /api/post/'+req.params.post_id+"/like: Already liked").green);
        return res.status(200).json({result: 1});
      }
      else {
        console.log(('[ok ] /api/post/'+req.params.post_id+"/like").green)
        return res.status(200).json({result: 1});
      }
    });
  });

  //POST /api/post/:post_id/unlike
  app.post('/api/post/:post_id/unlike', function(req, res) {
    console.log(('[req] /api/post/'+req.params.post_id+"/unlike").blue);
    if (req.body.user_id==undefined) {
      console.error(('[req] /api/post/'+req.params.post_id+"/unlike: Something is empty").red);
    }
     Post.update({ "_id": mongoose.Types.ObjectId(req.params.post_id) }, {"$pull": {"likes": req.body.user_id}}, function(err, output) {
      if (err) {
        console.error(('[err] /api/post/'+req.params.post_id+"/unlike").red);
        console.error(err);
        return res.status(500).json({result: 0});
      }
      else if (!output.n) {
        console.error(('[err] /api/post/'+req.params.post_id+"/unlike: Post not found").red);
        return res.status(500).json({result: 0});
      }
      else if (output.nModified == 0) {
        console.log(('[ok ] /api/post/'+req.params.post_id+"/unlike: Not liked").green);
        return res.status(200).json({result: 1});
      }
      else {
        console.log(('[ok ] /api/post/'+req.params.post_id+"/unlike").green)
        return res.status(200).json({result: 1});
      }
    });
  });
  app.get('/api/user/idfromCode/:id', function(req, res) {
    console.log(("[req] /api/user/idfromCode"+req.params.id).blue);
    User.find({ _id: req.params.id }, function(err, targetUser) {
      console.log(targetUser);
      if (!targetUser[0]) {
        console.error()
        return res.status(404).json( { "result": 0 } );
      }
      if (err) {
        console.error(('[err] /api/post/'+req.params.id).red);
        console.error(err);
        return res.status(500).json( { "result": 0 } );
      }
      else return res.status(200).json( targetUser[0].userIDString );
    });
  });

  //GET /api/post/:user_id_string
  app.get('/api/post/user/:user_id_string', function(req, res) {
    console.log(('[req] /api/post/user/'+req.params.user_id_string).blue);
    User.find({userIDString: req.params.user_id_string}, function(err, targetUser) {
      if (err) {
        console.error(('[err] /api/post/'+req.params.user_id_string).red);
        console.error(err);
        return res.status(500).json("\"result\": 0");
      }
      else if (!targetUser[0]) {
        console.error(('[err] /api/post/'+req.params.user_id_string+": User not found").red);
        return res.status(404).json("\"result\": 0");
      }
      else {
        //get posts by user
        Post.find({uploader: targetUser[0]._id}, function(err, post) {
          if (err) {
            console.error(('[err] /api/post/'+req.params.user_id_string).red);
            console.error(err);
            return res.status(500).json({result: 0});
          }
          else {
            console.log(('[ok ] /api/post/'+req.params.user_id_string).green);
            return res.status(200).json({result: 1, "posts": post });
          }
        });
      }
    });
  });
}