var express = require('express');
var request = require('request');

var router = express.Router();

router.get('/login', function(req, res) {
    res.render('login');
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
});

router.get('/', loggedIn, function(req, res, next) {
    listPatients(function(error, response, data) {
        if (!error && response.statusCode === 200) {
            res.render('index', {patients: data, photos: req.user.photos});
        } else {
            res.send("Error: " + error + ", response: " + JSON.stringify(response));
        }
    });
});

router.get('/test', loggedIn, function (req, res, next) {
    res.send('Test page');
});

function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        req.session.returnTo = req.path;
        res.redirect('/login');
    }
}

function listPatients(handler) {
    return request({
        url: 'http://localhost:5000/api/metadata/patients?count=-1',
        auth: { user: 'admin', password: 'admin' },
        json: true
    }, handler);
}
module.exports = router;
