
exports.getAuth = (req, res, next) => {
    return res.render('auth', {
        pageTitle: 'Chat Authentication'
    });
}