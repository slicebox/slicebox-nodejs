var request = require('request-promise');
var config = require('../config');

var sbx = {};

function sbxGet(url, json) {
    return {
        method: 'GET',
        uri: config.sbxBaseUrl + url,
        auth: { user: config.sbxUser, password: config.sbxPassword },
        json: json !== undefined ? json : true,
        encoding: json === undefined || json ? undefined : null,
        resolveWithFullResponse: true
    };
}

function sbxPost(url, entity, json) {
    return {
        method: 'POST',
        uri: config.sbxBaseUrl + url,
        auth: { user: config.sbxUser, password: config.sbxPassword },
        body: entity,
        json: json !== undefined ? json : true,
        resolveWithFullResponse: true
    };
}

function sbxRequest(options, next) {
    return request(options).then(function (response) {
        return response.body;
    }).catch(function (response) {
        var error = new Error('Cannot connect to slicebox: ' + response.error);
        error.status = response.statusCode ? response.statusCode : 503;
        next(error);
    });
}

function listSources(next) {
    return sbxRequest(sbxGet('/sources'), next);
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

sbx.listPatients = function(sessionId, next) {
    return sbxRequest(sbxGet('/metadata/patients?count=-1&sources=import:' + sessionId), next);
};

sbx.listStudiesForPatient = function(sessionId, patientId, next) {
    console.log('/metadata/studies?count=-1&patientid=' + patientId + '&sources=import:' + sessionId);
    return sbxRequest(sbxGet('/metadata/studies?count=-1&patientid=' + patientId + '&sources=import:' + sessionId), next);
};

sbx.listSeriesForStudy = function(sessionId, studyId, next) {
    return sbxRequest(sbxGet('/metadata/series?count=-1&studyid=' + studyId + '&sources=import:' + sessionId), next);
};

sbx.listImagesForSeries = function(sessionId, seriesId, next) {
    return sbxRequest(sbxGet('/metadata/images?count=-1&seriesid=' + seriesId + '&sources=import:' + sessionId), next);
};

sbx.imageInformation = function(sessionId, imageId, next) {
    return sbxRequest(sbxGet('/images/' + imageId + '/imageinformation'), next);
};

sbx.pngImage = function(sessionId, imageId, frameNumber, imageHeight, next) {
    var url = '/images/' + imageId + '/png';
    if (frameNumber || imageHeight) {
        url = url + '?'
    }
    if (frameNumber) {
        url = url + 'framenumber=' + frameNumber;
    }
    if (imageHeight) {
        url = url + 'imageheight=' + imageHeight;
    }
    return sbxRequest(sbxGet(url, false), next);
};

sbx.findOrCreateImportSessionForUser = function(userId, next) {
    return findImportIdForUser(userId, next).catch(function () {
        return createImportSessionForUser(userId, next).then(function (session) {
            return session.id;
        });
    });
}

sbx.uploadFile = function(sessionId, data, next) {
    return sbxRequest(sbxPost('/import/sessions/' + sessionId + '/images', data, false), next);
};

module.exports = sbx;
