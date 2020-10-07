"use strict";

const router = require('express').Router();
const controller = require('../controllers/OrganizationController');
 
router.route('/registreer')
	.get(controller.requireCSRF, controller.register)
	.post(controller.requireCSRF, controller.processRegistration);	
	
// default: login
router.route('/')
	.get(controller.requireCSRF, controller.login)
	.post(controller.requireCSRF, controller.processLogin);

router.route('/account/manual-check-in')
	.get(controller.requireAuth, controller.requireCSRF, controller.manualCheckIn)
	.post(controller.requireAuth, controller.requireCSRF, controller.processManualCheckIn);

router.route('/account/mijn-gegevens')
	.get(controller.requireAuth, controller.requireCSRF, controller.mijnGegevens)
	.post(controller.requireAuth, controller.requireCSRF, controller.processMijnGegevens);

router.get('/loguit', controller.logout);
router.get('/account', controller.requireAuth, controller.account);

router.get('/account/download-qr', controller.requireAuth, controller.processCreateQR);

module.exports = router;
		
