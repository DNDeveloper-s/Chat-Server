const express = require('express');

const router = express.Router();

const auth = require('../middleware/isAuth');

const roomController = require('../controllers/roomController');

// All comes under 'room'

router.post('/message', auth.isAuth, roomController.messageActions);

// router.get('/download', messageController.download);

// router.post('/send', auth.isAuth, messageController.postMessages);

module.exports = router;