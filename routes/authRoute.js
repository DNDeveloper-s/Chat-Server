const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');

// EndPoint comes under "/auth"

router.get('/ui', authController.getAuth);

router.post('/register', authController.postRegAuth);

router.get('/dashboard', authController.getDashboard);

module.exports = router;