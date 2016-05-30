var express = require('express');
var sbx = require('./slicebox');
var util = require('./util');

var router = express.Router();

router.get('/', util.loggedIn, function(req, res, next) {
    var seriesId = req.query.seriesid;
    sbx.findOrCreateImportSessionForUser(req.user.id, next).then(function (sessionId) {
        sbx.listImagesForSeries(sessionId, seriesId, next).then(function (images) {
            Promise.all(images.map(function(image) {
                return sbx.imageInformation(sessionId, image.id, next).then(function (info) {
                    var frames = new Array(info.numberOfFrames);
                    for (var i = 0; i < frames.length; i++) {
                        frames[i] = i + 1;
                    }
                    return { id: image.id, frames: frames };
                });
            })).then(function(idsAndFrames) {
                res.render('images', { seriesId: seriesId, images: idsAndFrames });
            });
        });
    }).catch(function(error) {
        var err = new Error('Cannot connect to slicebox');
        err.status = 503;
        next(err);
    });
});

router.get('/:imageId/png', util.loggedIn, function(req, res, next) {
    var imageId = req.params.imageId;
    var frameNumber = req.query.framenumber;
    var imageHeight = req.imageheight;
    sbx.findOrCreateImportSessionForUser(req.user.id, next).then(function (sessionId) {
        sbx.pngImage(sessionId, imageId, frameNumber, imageHeight, next).then(function (png) {
            res.set({ 'Content-Type': 'image/png' });
            res.send(png);
        });
    });
});

module.exports = router;
