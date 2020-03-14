const express = require('express');

const router = express.Router();

const auth = require('../middleware/isAuth');

const dashboardController = require('../controllers/dashboardController');

// EndPoint comes under "/dashboard"

router.get('/home', auth.isAuth, dashboardController.getDashboard);

router.post('/new/workspace', auth.isAuth, dashboardController.postWorkspace);

// router.get('/connect/namespace', auth.isAuth, dashboardController.postConnectionToNameSpace);

router.post('/workspace', auth.isAuth, dashboardController.workSpaceFunctions);

router.get('/workspace', auth.isAuth, dashboardController.getWorkSpaceFunctions);

router.post('/add-friend', auth.isAuth, dashboardController.postAddFriend);

router.get('/fetch', auth.isAuth, dashboardController.fetchDetails);


// router.post('/workspace/connectByLink', auth.isAuth, dashboardController.connectByLinkToWorkspace);

module.exports = router;