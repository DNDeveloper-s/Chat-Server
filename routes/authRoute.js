const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');
const auth = require('../middleware/isAuth');

// EndPoint comes under "/auth"

router.get('/fetch', auth.isAuth, authController.fetchUser);

router.get('/ui', auth.isNotAuth, authController.getAuth);

router.post('/register', authController.postRegAuth);

router.post('/login', authController.postLoginAuth);

// router.get('/dashboard', auth.isAuth, authController.getDashboard);

router.post('/logout', auth.isAuth, authController.postLogoutAuth);

// const upload = req.app.get('upload');

router.post('/update_profile', authController.postUpdateProfile);

module.exports = router;