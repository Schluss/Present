"use strict";

const router = require('express').Router();

// define sub-routes
router.use('/', require('./organizations'));
router.use('/', require('./register'));

//router.use('/admin', require('./admin')); // disabled

// default route: when no route matches
router.get('*', function (req, res) {
    res.render('notfound', {
		layout : 'error', 
		title : 'Niet gevonden'
	});
});

// error route: when another route reports an error
router.use(function(err, req, res, next){
	res.status(500);
	res.render('error', { 
		layout : 'error', 
		error : err 
	});	
});


module.exports = router;