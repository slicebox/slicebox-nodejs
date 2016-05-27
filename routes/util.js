var util = {};

util.loggedIn = function(req, res, next) {
    if (req.user) {
        next();
    } else {
        req.session.returnTo = req.path;
        res.redirect('/login');
    }
};

module.exports = util;