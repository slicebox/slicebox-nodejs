var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hogan = require('hogan-express');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var Sequelize = require('sequelize');

var userRoutes = require('./routes/user');
var indexRoutes = require('./routes/index');

var app = express();

// db setup
var sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',

    pool: {
        max: 5,
        min: 0,
        idle: 10000
    },

    storage: 'db.sqlite'
});
//var sequelize = new Sequelize('sqlite://db.sqlite');

var User = sequelize.define('user', {
    id: { type: Sequelize.STRING, primaryKey: true },
    name: Sequelize.STRING,
    photoUrl: Sequelize.STRING
});

User.sync();

// view engine setup
app.set('view engine', 'hjs'); // use .hjs extension for templates
app.enable('view cache');
app.engine('html', hogan);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
        clientID: "99967977588-c2967bf2lcupmhmdeqrak0pnul133tp9.apps.googleusercontent.com",
        clientSecret: "GHyzJ_n23S5tumztUlh5YPaw",
        callbackURL: "http://localhost:3000/auth/google/callback"
    }, function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ where: { id: profile.id }, defaults: { name: profile.displayName, photoUrl: profile.photos[0].value } })
            .spread(function (user) {
                return done(null, user);
            }).catch(function (err) {
                return done(err, null);
            });
    }
));

passport.serializeUser(function(user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
    User.findById(id)
        .then(function (user) {
            cb(null, user.dataValues);
        }).catch(function (err) {
            cb(err, null);
        });
});

app.use('/', indexRoutes);
app.use('/', userRoutes);

app.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect(req.session.returnTo || '/');
        delete req.session.returnTo;
    });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
