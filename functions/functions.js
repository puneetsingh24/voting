const User = require('../models/User.js').User;

module.exports = {
    Auth: function(req, res, next) {
        if (req.url == '/login') {
            if (req.session.user) {
                return res.redirect(admin_url);
            }
            return next();
        } else if (req.session.user) {
            return next();
        } else {
            req.flash('error', 'Unauthorized Access');
            return res.redirect(urljoin(admin_url, 'login'));
        }
    }
}