const express = require('express');

const router = express.Router();

const auth = require('../middleware/isAuth');

const messageController = require('../controllers/messageController');

// All comes under 'message'

router.get('/fetch', auth.isAuth, messageController.fetchMessages);

router.get('/download', messageController.download);

router.post('/send', auth.isAuth, messageController.postMessages);

module.exports = router;