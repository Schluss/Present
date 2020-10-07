"use strict";

const Organization = require('../models/Organization');
const PubKeyController = require('./PubKeyController');
const RegisterController = require('./RegisterController');
const PubKeyModel = require('../models/PubKey');
const RegisterModel = require('../models/Registration');
const csrf = require('csurf');

const formatError = errors => {
	let message = '';
	for (var e in errors.errors){
		message +=  errors.errors[e].message + ', ';
	}

	return message.replace(/,\s*$/, "");
}
	
const OrganizationController = {

	requireCSRF : csrf(),

	requireAuth : (req, res, next) => {

		if (req.session.user) {
			next();
		} else {
			
			res.message('Log in om verder te gaan');
			res.redirect('/');
		}
	},
	
	account : async (req, res, next) =>{
	
		try {
			let orgModel = await Organization.findById(req.session.user._id);
		
			let count = await RegisterController.getCountToday(req.session.user._id);

			res.render('organization/index', {
				title : orgModel.name,
				org : orgModel.toJSON(),
				registrationCount : count
			});
		
		}
		catch(err){
			next(err);
		}
	},
	
	mijnGegevens : async (req, res, next) =>{
	
		try {
	
			let orgModel = await Organization.findById(req.session.user._id);
		
			res.render('organization/mijn-gegevens', {
				title : 'Mijn gegevens',
				csrfToken : req.csrfToken(),
				org : orgModel.toJSON()
			});
		
		}
		catch(err){
			next(err);
		}
	},
	
	processMijnGegevens : async (req, res, next) => {
	
		try {
	
			// fill the model
			let org = await Organization.findById(req.session.user._id);

			// update fields
			org.kvk = req.body.kvk;
			org.address = req.body.address;
			org.name = req.body.name;
			org.email = req.body.email; 
						
			// validate the model
			let error = org.validateSync();
			
			if (error){
				res.message(error);
				
				return res.render('organization/mijn-gegevens', {
					layout : 'main',
					organization : org.toJSON(),
					csrfToken : req.csrfToken()
				});
			}
			
			let result = await org.save();
			
			res.message('Wijzigingen opgeslagen');
			
			return res.redirect('/account/mijn-gegevens');
		}
		catch(err){
			next(err);
		}
	}, 
	
	manualCheckIn : async (req, res, next) => {
		try {
		
			let org = await Organization.findById(req.session.user._id);
			
			if (!org)
				throw('Organisatie niet gevonden');
			
			let pubkey = await PubKeyModel.findById(org.pubkey);
			
			if (!pubkey)
				throw('Organisatie niet gevonden');

			res.render('organization/manual-check-in', {
				layout : 'main',
				csrfToken : req.csrfToken(),
				org : org.toJSON(),
				pubkey : pubkey.toJSON()
				});
			
		}
		catch(err){
			next(err);
		}
	},
	
	processManualCheckIn : async (req, res, next) =>{
		
		try {

			// fill the model
			let reg = new RegisterModel({
				organization : req.session.user._id,
				data : req.body.data
				});
			
			// validate the model
			let error = reg.validateSync();
			
			if (error){
				console.log(error);
				res.message(error);
				return res.redirect('/');
			}
			
			let result = await reg.save();
			
			if (!result)
				throw('Niet opgeslagen');
			
			res.message('Registratie opgeslagen');
			
			return res.redirect('/account');
			
		}
		catch(err){
			next(err);
		}
	},	
	
	register : async (req, res) => {
		
		// when user already logged in:
		if (req.session.user) {
			res.message('U bent al geregistreerd en ingelogd');
			return res.redirect('account');
		}		
		
		res.render('organization/register', {
			layout : 'main',
			csrfToken : req.csrfToken()
		});
	},
	
	processRegistration : async (req, res, next) => {
		
		try {
		
			// fill the model
			let org = new Organization({
				kvk : req.body.kvk,
				address : req.body.address,
				name : req.body.name,
				email : req.body.email,
				hash : req.body.password
				});
			
			// validate the model
			let errors = org.validateSync();
					
			if (errors){
				res.message('Niet alle verplichte velden ingevuld: ' + formatError(errors));
				
				return res.render('organization/register', {
					layout : 'main',
					org : org.toJSON(),
					csrfToken : req.csrfToken()
				});
			}
			
			// make a ref to the first available key at the organization
			let nextKey = await PubKeyController.findNext();
			org.pubkey = nextKey._id;
			
			let result = await org.save();
			
			if (result){
				res.message('Geregisteerd!');
				return res.redirect('/');
			}
		}
		catch(err){
			next(err);
		}
	},
	
	login : function (req, res){
		
		// check if user is already logged in, then skip login page
		if (req.session.user) {
			res.message('U bent al ingelogd');
			return res.redirect('account');
		}
			
		res.render('organization/login', {
			layout : 'main',
			csrfToken : req.csrfToken()
		});
	},

	processLogin : async (req, res, next) => {

		let org = await Organization.findOne({ email : req.body.email});
		
		if (!org || await !org.comparePassword(req.body.password))
		{
			res.message('E-mail adres of wachtwoord onjuist');
			
			return res.render('organization/login', {
				layout : 'main',
				csrfToken : req.csrfToken()
			});
		}
		
		req.session.user = org;
		return res.redirect('/account');
			
	},
	
	processCreateQR : async function (req, res){
	
		const qr = require('qr-image');
		var qr_svg = qr.image('http://localhost:3000/check-in/' + req.session.user._id, { 
			type: 'svg',
			parse_url : true,
			size:10
			});
			
		res.type('svg');
		qr_svg.pipe(res);
	},
	
	logout : function(req, res){
	  if (req.session) {
		req.session.destroy();
		res.clearCookie(process.env.SESSION_NAME);
		res.clearCookie('_csrf');
		res.redirect('/');
	  }
	  else {
		 res.redirect('/'); 
	  }
	},
}

module.exports = OrganizationController;