const express = require('express');

const router = express.Router();

const auth = require('../middleware/isAuth');

const workSpaceController = require('../controllers/workSpaceController');

// All comes under 'workspace'

router.get('/roles', auth.isAuth, workSpaceController.fetchRoles);

router.post('/postroles', auth.isAuth, workSpaceController.postRoles);

router.post('/roles/user', auth.isAuth, workSpaceController.postUserToRole);

router.post('/roles/permissions', auth.isAuth, workSpaceController.postPermissionsToRole);

router.post('/deleteroles', auth.isAuth, workSpaceController.deleteRoles);

router.post('/roles/color', auth.isAuth, workSpaceController.updateColorToRole);

module.exports = router;