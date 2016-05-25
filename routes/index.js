var express = require('express');
var request = require('request-promise');
var multer = require('multer');

var storage = multer.memoryStorage()
var upload = multer({ storage: storage })

var router = express.Router();

router.get('/login', function(req, res) {
    res.render('login');
});

router.get('/logout', function(req, res){
    req.logout();
    delete req.session.returnTo;
    res.redirect('/login');
});

router.get('/', loggedIn, function(req, res, next) {
    findOrCreateImportSessionForUser(req.user.id, next).then(function (sessionId) {
        listPatients(sessionId, next).then(function (patients) {
            res.render('index', {patients: patients, photoUrl: req.user.photoUrl});
        }).catch(function(error) {
            var err = new Error('Cannot connect to slicebox');
            err.status = 503;
            next(err);
        });
    });
});

router.post('/upload', upload.array('files'), function (req, res, next) {
    findOrCreateImportSessionForUser(req.user.id, next).then(function (sessionId) {
        var uploadPromises = req.files.map(function (file) {
            return sbxRequest(sbxPost('/import/sessions/' + sessionId + '/images', file.buffer, false), next);
        });
        return Promise.all(uploadPromises);
    }).then(function() {
        res.redirect('/');
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

var sbxBaseUrl = 'http://localhost:5000/api';

function sbxGet(url) {
    return {
        method: 'GET',
        uri: sbxBaseUrl + url,
        auth: { user: 'admin', password: 'admin' },
        json: true
    };
}

function sbxPost(url, entity, json) {
    return {
        method: 'POST',
        uri: sbxBaseUrl + url,
        auth: { user: 'admin', password: 'admin' },
        body: entity,
        json: json !== undefined ? json : true
    };
}

function sbxRequest(options, next) {
    return request(options).catch(function(msg) {
        var error = new Error('Cannot connect to slicebox: ' + msg);
        error.status = 503;
        next(error);
    });
}

function listPatients(sessionId, next) {
    return sbxRequest(sbxGet('/metadata/patients?count=-1&sources=import:' + sessionId), next);
}

function listSources(next) {
    return sbxRequest(sbxGet('/sources'), next);
}

function findOrCreateImportSessionForUser(userId, next) {
    return findImportIdForUser(userId, next).catch(function () {
            return createImportSessionForUser(userId, next).then(function (session) {
                return session.id;
            });
    });
}

function findImportIdForUser(userId, next) {
    return listSources(next)
        .then(function (sources) {
            var importSources = sources.filter(function (source) {
                return source.sourceType === 'import' && source.sourceName === userId;
            });
            if (importSources.length === 0) {
                throw "No import found for user " + userId;
            } else {
                return importSources[0].sourceId;
            }
        });
}

function createImportSessionForUser(userId, next) {
    var session = {
        "id": -1, "name": userId, "userId": -1, "user": "", "filesImported": 0,
        "filesAdded": 0, "filesRejected": 0, "created": 0, "lastUpdated": 0 };
    return sbxRequest(sbxPost('/import/sessions', session), next);
}

module.exports = router;
