var express = require('express'),
  router = express.Router(),
  db = require('../models');
  
var multer = require('multer');
var upload = multer({dest:'./img/uploads/'});
var friendlyUrl = require('friendly-url');
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'fabianrios', 
  api_key: '993579761283834', 
  api_secret: 'rkFGhUYg0shUm4m7Qtnb1qWSlEQ' 
});

//passport
var flash = require('express-flash');
var session = require('express-session');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
  


passport.serializeUser(function(user, done) {
  console.log("serializeUser");
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log("deserializeUser");
  User.findOne(id).success(function(user) { done(null, user); });
});

  
passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log("username",username);
    db.User.findById(1).then(function (user) {
      console.log("user",user);
      if (!user) {
        console.log("Incorrect username");
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password !== password) {
        console.log("Incorrect password");
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    })
  }
));
/// passport

var http = require('http');
var path = require('path');
var assert = require('assert');

var enviroment = process.env.NODE_ENV || 'development';
if (enviroment == 'development'){
  var env = require('node-env-file');
  env(path.dirname(require.main.filename) + '/.env');
}

var AWS_ACCESS_KEY =  process.env.S3_ACCESS_KEY;
var AWS_SECRET_KEY =process.env.S3_SECRET_ACCESS_KEY;
var S3_BUCKET = process.env.S3_BUCKET_NAME;

module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
    res.locals = {
      pageTitle: "map",
      background: true,
      logo: "group-2.png"
    };
    res.render('index', {
      title: 'root'
    });
});

router.get('/login', function (req, res, next) {
    res.render('login', {
      title: 'Inicio de sesión',
      logo: "group-2.png"
    });
});


router.post('/login', 
  passport.authenticate('local', { successRedirect : '/blog', failureRedirect: '/login',failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  }
);

router.get('/country/create',authorize, function (req, res, next) {
    res.render('create_country', {
      title: 'Crear nuevo país',
      logo: "group-2.png"
    });
});

router.get('/country/:id/edit', function (req, res, next) {
  var id = req.params.id
  db.Country.findById(id).then(function (country) {
    res.render('edit_country', {
      title: "Edición de país",
      country: country,
      logo: "group-2.png"
    });
  });
});

router.post('/country/:id/editar', upload.single('image_upload'), function (req, res, next) {
  var id = req.params.id
  var body = req.body
  var urlbody = friendlyUrl(body.title);
  var file = req.file;
  console.log("body",body, parseFloat(body.lat));
  db.Country.findById(id).then(function (country) {
    if(typeof file !== 'undefined'){
    cloudinary.uploader.upload(file.path, function(result) {
      country.update({ title: body.pais, text: body.texto, url: urlbody, cover: result.public_id, version: result.version, vip: body.vip, incognito: body.incognito, corporate: body.corporate, lat: body.lat, long: body.long }).then(function () {
       res.redirect('/countries_search');
      });
    },{ public_id: article.cover_version, invalidate: true });
    } else{
      country.update({ title: body.pais, text: body.texto, url: urlbody, vip: body.vip, incognito: body.incognito, corporate: body.corporate, lat: body.lat, long: body.long }).then(function () {
       res.redirect('/countries_search');
      });
    }
  });
});

router.post('/countries',upload.single('image_upload'), function (req, res, next) {
  var body = req.body;
  var urlbody = friendlyUrl(body.pais);
  if(typeof req.file !== 'undefined'){
    cloudinary.uploader.upload(req.file.path, function(result) {
      db.Country.create({ title: body.pais, text: body.texto, url: urlbody, cover: result.public_id, version: result.version, vip: body.vip, incognito: body.incognito, corporate: body.corporate }).then(function () {
       res.redirect('/countries_search');
      });
    });
  }else{
    db.Country.create({title: body.pais, text: body.texto, url: urlbody, vip: body.vip, incognito: body.incognito, corporate: body.corporate}).then(function () {
     res.redirect('/countries_search');
    });
  }
});

router.get('/countries_search', function (req, res, next) {
  db.Country.findAll().then(function (countries) {
    
    res.render('countries_search', {
      title: 'Buscador de paises',
      countries: countries,
      logo: "group-2.png"
    });
    
  });
});

router.get('/countries_all', function (req, res, next) {
  db.Country.findAll().then(function (countries) {
    info = [];
    for (var i = 0; i < countries.length; i++){
      
      info.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [countries[i].long,countries[i].lat]
            },
            properties: {
              title: countries[i].title,
              description: countries[i].text,
              cover: countries[i].cover,
              version: countries[i].version
            } 
      });
    }
    var json = JSON.stringify(info);
      
    res.write(json);
    res.end();
  });
});

router.get('/blog', function (req, res, next) {
  db.Article.findAll().then(function (articles) {
    // console.log(articles);
    res.render('blog', {
      title: 'blog',
      articles: articles,
      logo: "group-2.png"
    });
  });
});

router.get('/article/create', function (req, res, next) {
    res.render('create', {
      title: 'Crear nuevo articulo',
      logo: "group-2.png"
    });
});


router.get('/experiences', function (req, res, next) {
    res.render('experiences', {
      title: 'Experiencias',
      logo: "group-2.png"
    });
});

router.get('/contact', function (req, res, next) {
    res.render('contact', {
      title: 'Contacto',
      logo: "group-2.png"
    });
});

router.get('/article/:id', function (req, res, next) {
  var id = req.params.id
  db.Article.findById(id).then(function (article) {
    // console.log(article)
    
    res.locals = {
      pageTitle: "articles",
      background: true,
      logo: "group-2.png"
    };
    
    res.render('show', {
      title: article.title,
      article: article,
      logo: "logo_white.png"
    });
  });
});



router.get('/article/:id/edit', function (req, res, next) {
  var id = req.params.id
  db.Article.findById(id).then(function (article) {
    res.render('edit', {
      title: "Edición",
      article: article,
      logo: "group-2.png"
    });
  });
});


router.post('/article/like', function (req, res, next) {
  var id = req.body.id
  db.Article.findById(id).then(function (article) {
   var like = article.like || 0
   like++;
   article.update({like: like }).then(function () {
      res.write(JSON.stringify(like));
      res.end();
   });
  });
});


router.post('/articles',upload.single('image_upload'), function (req, res, next) {
  var body = req.body;
  var urlbody = friendlyUrl(body.title);
  if(typeof req.file !== 'undefined'){
    cloudinary.uploader.upload(req.file.path, function(result) {
      db.Article.create({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category, cover: result.public_id, version: result.version, vip: body.vip, incognito: body.incognito, corporate: body.corporate }).then(function () {
       res.redirect('/blog');
      });
    });
  }else{
    db.Article.create({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category, vip: body.vip, incognito: body.incognito, corporate: body.corporate }).then(function () {
     res.redirect('/blog');
    });
  }
});

router.post('/article/:id/editar', upload.single('image_upload'), function (req, res, next) {
  var id = req.params.id
  var body = req.body
  var urlbody = friendlyUrl(body.title);
  var file = req.file;
  db.Article.findById(id).then(function (article) {
    if(typeof file !== 'undefined'){
    cloudinary.uploader.upload(file.path, function(result) {
      article.update({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category, cover: result.public_id, version: result.version, vip: body.vip, incognito: body.incognito, corporate: body.corporate }).then(function () {
       res.redirect('/blog');
      });
    },{ public_id: article.cover_version, invalidate: true });
    } else{
      article.update({ title: body.title, text: body.text, url: urlbody, fulltext: body.fulltext, category: body.category, vip: body.vip, incognito: body.incognito, corporate: body.corporate }).then(function () {
       res.redirect('/blog');
      });
    }
  });
});

router.get('/article/:id/destroy', function (req, res, next) {
  db.Article.destroy({
      where: {
        id: req.params.id
      }
    }).then(function() {
      res.redirect('/blog');
    });
});

