var express = require('express'),
  router = express.Router(),
  db = require('../models');
  
var friendlyUrl = require('friendly-url');

var easyimg = require('easyimage');
var http = require('http');
var path = require('path');
var aws = require('aws-sdk');
var assert = require('assert');
var env = require('node-env-file');
env(path.dirname(require.main.filename) + '/.env');

var AWS_ACCESS_KEY =  process.env.S3_ACCESS_KEY;
var AWS_SECRET_KEY =process.env.S3_SECRET_ACCESS_KEY;
var S3_BUCKET = process.env.S3_BUCKET_NAME;

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  db.Article.findAll().then(function (articles) {
    // console.log(articles);
    res.render('index', {
      title: 'root',
      articles: articles
    });
  });
});

router.get('/crop', function(req, res){
  easyimg.info(req.query.file_name).then(
    function(file) {
      console.log(file);
      res.write(JSON.stringify(file));
      res.end();
    }, function (err) {
      console.log(err);
    }
  );
});

router.get('/sign_s3', function(req, res){
    aws.config.update({accessKeyId: AWS_ACCESS_KEY, secretAccessKey: AWS_SECRET_KEY});
    var s3 = new aws.S3();
    var s3_params = {
        Bucket: S3_BUCKET,
        Key: req.query.file_name,
        Expires: 60,
        ContentType: req.query.file_type,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3_params, function(err, data){
        if(err){
            console.log("sign_err",err);
        }
        else{
            var return_data = {
                signed_request: data,
                url: 'https://'+S3_BUCKET+'.s3.amazonaws.com/'+req.query.file_name
            };
            res.write(JSON.stringify(return_data));
            res.end();
        }
    });
});

router.get('/article/create', function (req, res, next) {
    res.render('create', {
      title: 'Create new article',
    });
});

router.get('/experiences', function (req, res, next) {
    res.render('experiences', {
      title: 'Experiencias',
    });
});

router.get('/contact', function (req, res, next) {
    res.render('contact', {
      title: 'Contacto',
    });
});

router.get('/article/:id', function (req, res, next) {
  var id = req.params.id
  db.Article.findById(id).then(function (article) {
    // console.log(article);
    res.render('show', {
      title: "Pantalla individual",
      article: article
    });
  });
});



router.get('/article/:id/edit', function (req, res, next) {
  var id = req.params.id
  db.Article.findById(id).then(function (article) {
    res.render('edit', {
      title: "Edición",
      article: article
    });
  });
});


router.post('/articles', function (req, res, next) {
  var body = req.body
  var urlbody = friendlyUrl(body.title);
  db.Article.create({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category }).then(function () {
   res.redirect('/');
  });
});

router.post('/article/:id/editar', function (req, res, next) {
  var id = req.params.id
  var body = req.body
  var urlbody = friendlyUrl(body.title);
  console.log(urlbody);
  db.Article.findById(id).then(function (article) {
    article.update({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category }).then(function () {
     res.redirect('/');
    });
  });
});

router.get('/article/:id/destroy', function (req, res, next) {
  db.Article.destroy({
      where: {
        id: req.params.id
      }
    }).then(function() {
      res.redirect('/');
    });
});
