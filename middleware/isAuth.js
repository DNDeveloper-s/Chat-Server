exports.isAuth = (req, res, next) => {
    if(!req.session.isLoggedIn) {
    
        return res.redirect('/auth/ui?type=error&message=You%20need%20to%20login%20for%20such%20functionality!');
    }
    next();
}

exports.isNotAuth = (req, res, next) => {
    if(req.session.isLoggedIn) {
        // return res.redirect('/dashboard/home');
    }
    next();
}