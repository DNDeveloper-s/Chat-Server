const express = require('express');

const router = express.Router();

const auth = require('../middleware/isAuth');

const workSpaceController = require('../controllers/workSpaceController');

// All comes under 'workspace'

router.get('/roles', auth.isAuth, workSpaceController.fetchRoles);

router.post('/roles', auth.isAuth, workSpaceController.postRoles);

module.exports = router;