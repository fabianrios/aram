var express = require('express'),
  router = express.Router(),
  db = require('../models');
  
var friendlyUrl = require('friendly-url');

var path = require('path');
var papercut = require('papercut');
var multer  = require('multer');
var upload = multer({ dest: 'img/uploads/' });

papercut.configure(function(){
  papercut.set('storage', 'file');
  papercut.set('directory', path.join(__dirname, '/../img/uploads'));
  papercut.set('url', '/uploads');
});

papercut.configure('production', function(){
  papercut.set('storage', 's3')
  papercut.set('S3_KEY', process.env.S3_ACCESS_KEY)
  papercut.set('S3_SECRET', process.env.S3_SECRET_ACCESS_KEY)
  papercut.set('bucket', process.env.S3_BUCKET_NAME)
});

AvatarUploader = papercut.Schema(function(schema){
  schema.version({
    name: 'small',
    size: '300x176',
    process: 'crop'
  });
  schema.version({
    name: 'large',
    size: '1600x768',
    process: 'resize'
  });
  schema.version({
    name: 'origin',
    process: 'copy'
  });
});

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

var imageId = 0;

router.post('/articles', upload.single('images'), function (req, res, next) {
  var body = req.body;
  var urlbody = friendlyUrl(body.title);
  
  var uploader;
  var the_images;
  uploader = new AvatarUploader();
  
  // console.log("req.file: ",req.file,"body: ",body);
  
  uploader.process("" + (imageId++), req.file.path, function(err, images) {
    the_images = images;
    console.log("large",images.large, "small",images.small, "origin",images.origin);
    res.redirect('/');
  });
  // db.Article.create({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category, images: the_images }).then(function () {
  //  res.redirect('/');
  // });
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

