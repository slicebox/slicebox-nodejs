var express = require('express');
var request = require('request');

var router = express.Router();

router.get('/', function(req, res, next) {
    request({
        url: 'http://localhost:5000/api/metadata/patients?count=-1',
        auth: { user: 'admin', password: 'admin' },
        json: true
    }, function(error, response, data) {
        if (!error && response.statusCode === 200) {
            res.render('index', {patients: data});
        } else {
            res.send("Error: " + error + ", response: " + JSON.stringify(response));
        }
    });
});

module.exports = router;
