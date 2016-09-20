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
}

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
