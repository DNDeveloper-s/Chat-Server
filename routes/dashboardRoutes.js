const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');

router.get('/dashboard', authController.getDashboard);

module.exports = router;