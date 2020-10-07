"use strict";

const router = require('express').Router();

const controller = require('../controllers/AdminController');
 

router.route('/')
	.get(controller.requireCSRF, controller.login)
	.post(controller.requireCSRF, controller.processLogin);

router.route('/setup-2fa')
	.get(controller.requireAuth, controller.setupTwoFactor)
	.post(controller.requireAuth, controller.processSetupTwoFactor);


router.get('/loguit', controller.logout);
router.get('/account', controller.requireAuth, controller.account);

module.exports = router;
		
