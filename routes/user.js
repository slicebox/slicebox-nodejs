var express = require('express');
var passport = require('passport');
var router = express.Router();

router.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/users/login' }), function(req, res) {
    res.redirect(req.session.returnTo || '/');
    delete req.session.returnTo;
});

router.get('/login', function(req, res) {
    res.render('login');
});

router.get('/logout', function(req, res){
    req.logout();
    delete req.session.returnTo;
    res.redirect('/users/login');
});

module.exports = router;
