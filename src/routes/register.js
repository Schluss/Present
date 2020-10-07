"use strict";

const controller = require('../controllers/RegisterController');


const router = require('express').Router();

router.get('/check-in/:id', controller.requireCSRF, controller.get);

router.post('/check-in/:id', controller.requireCSRF, controller.post);

router.get('/success/:id', controller.success);

// todo:
router.get('/qr', controller.success);
	
module.exports = router;