var util = {};

util.loggedIn = function(req, res, next) {
    if (req.user) {
        next();
    } else {
        req.session.returnTo = req.originalUrl;
        res.redirect('/users/login');
    }
};

module.exports = util;