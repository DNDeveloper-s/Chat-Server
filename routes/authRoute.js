const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');

router.get('/auth', authController.getAuth);

module.exports = router;