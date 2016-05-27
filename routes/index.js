var express = require('express');
var multer = require('multer');
var sbx = require('./slicebox');
var util = require('./util');

var storage = multer.memoryStorage()
var upload = multer({ storage: storage })

var router = express.Router();

router.get('/', util.loggedIn, function(req, res, next) {
    sbx.findOrCreateImportSessionForUser(req.user.id, next).then(function (sessionId) {
        sbx.listPatients(sessionId, next).then(function (patients) {
            res.render('index', {patients: patients, photoUrl: req.user.photoUrl});
        }).catch(function(error) {
            var err = new Error('Cannot connect to slicebox');
            err.status = 503;
            next(err);
        });
    });
});

router.post('/upload', util.loggedIn, upload.array('files'), function (req, res, next) {
    sbx.findOrCreateImportSessionForUser(req.user.id, next).then(function (sessionId) {
        var uploadPromises = req.files.map(function (file) {
            return sbx.uploadFile(sessionId, file.buffer, next);
        });
        return Promise.all(uploadPromises);
    }).then(function() {
        res.redirect('/');
    });
});

router.get('/test', util.loggedIn, function (req, res, next) {
    res.send('Test page');
});

module.exports = router;
