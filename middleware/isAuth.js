const User = require('../models/User');

exports.isAuth = async (req, res, next) => {
    if(!req.session.isLoggedIn) {

        if(req.cookies.sessionId) {
            const user = await User.findOne({sessionId: req.cookies.sessionId});

            if(user) {
                req.session.user = user;
                req.session.isLoggedIn = true;
                req.session.save();
                return next();
            }
        }
    
        return res.redirect('/auth/ui?type=error&message=You%20need%20to%20login%20for%20such%20functionality!');
    }
    next();
}

exports.isNotAuth = async (req, res, next) => {
    if(req.cookies.sessionId) {
        const user = await User.findOne({sessionId: req.cookies.sessionId});

        if(user) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            req.session.save();
        }
    }

    if(req.session.isLoggedIn) {
        return res.redirect('/dashboard/home');
    }
    next();
}