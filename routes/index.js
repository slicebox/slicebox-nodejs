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
        });
    }).catch(function(error) {
        var err = new Error('Cannot connect to slicebox');
        err.status = 503;
        next(err);
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

router.get('/studies', util.loggedIn, function(req, res, next) {
    var patientId = req.query.patientid
    sbx.findOrCreateImportSessionForUser(req.user.id, next).then(function (sessionId) {
        sbx.listStudiesForPatient(sessionId, patientId, next).then(function (studies) {
            res.json(studies);
        });
    });
});

router.get('/series', util.loggedIn, function(req, res, next) {
    var studyId = req.query.studyid
    sbx.findOrCreateImportSessionForUser(req.user.id, next).then(function (sessionId) {
        sbx.listSeriesForStudy(sessionId, studyId, next).then(function (series) {
            res.json(series);
        });
    });
});

module.exports = router;
