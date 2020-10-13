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

	requireCSRF : csrf({ cookie: true }),

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
			
			let returnInvalid = (message, org) =>	{
				res.message(message);
				
				res.render('organization/mijn-gegevens', {
					layout : 'main',
					title : "Mijn gegevens",
					org : org.toJSON(),
					csrfToken : req.csrfToken()
				});
			}			
	
			// fill the model
			let org = await Organization.findById(req.session.user._id);

			// update fields
			org.kvk = req.body.kvk;
			org.name = req.body.name;
			org.streetname = req.body.streetname;
			org.housenumber = req.body.housenumber;
			org.postal = req.body.postal;
			org.city = req.body.city;
			org.phone = req.body.phone;
			org.email = req.body.email; 
													
			// validate the model
			let errors = org.validateSync();
			
			if (errors)
				return returnInvalid('Niet alle verplichte velden zijn ingevuld: ' + formatError(errors), org);

			// compare password and retyped password
			if (req.body.password != ''){
				
				if (req.body.password != req.body.confirmPassword)
					return returnInvalid('Wachtwoord komt niet overeen.', org);
			
				// update the password
				org.hash = req.body.password;
			}			
				
			// save changes
			let result = await org.save();
			
			if (!result)
				return returnInvalid('Wijzigingen konden niet worden opgeslagen. Probeer het opnieuw en neem contact met ons op als het probleem zich voor blijft doen', org);
			
			// update session data
			req.session.user.name = org.name;
			
			res.message('Wijzigingen opgeslagen', 'ok');
			
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

			var date = new Date();

			res.render('organization/manual-check-in', {
				layout : 'main',
				csrfToken : req.csrfToken(),
				org : org.toJSON(),
				title : "Handmatige check-in",
				checkinDate : date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2),
				checkinTime : date.getHours() + ':' + date.getMinutes(),
				pubkey : pubkey.toJSON()
				});
			
		}
		catch(err){
			next(err);
		}
	},
	
	processManualCheckIn : async (req, res, next) =>{
		
		try {

			let checkinDate = Date(req.body.checkinDate + ' ' + req.body.checkinTime);

			// fill the model
			let reg = new RegisterModel({
				organization : req.session.user._id,
				data : req.body.data,
				checkinDate : checkinDate
				});
			
			// validate the model
			let error = reg.validateSync();
			
			if (error){
				console.log(error);
				res.message(error);
				return res.redirect('/');
			}
			
			console.log(reg);
			
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
			title : "Registreren",
			csrfToken : req.csrfToken()
		});
	},
	
	processRegistration : async (req, res, next) => {
		
		try {
			
			let returnInvalid = (message, org) =>	{
				res.message(message);
				
				res.render('organization/register', {
					layout : 'main',
					org : org.toJSON(),
					title : "Registreren",
					csrfToken : req.csrfToken()
				});
			}			
				
			// fill the model
			let org = new Organization({
				kvk : req.body.kvk,
				name : req.body.name,
				streetname : req.body.streetname,
				housenumber : req.body.housenumber,
				postal : req.body.postal,
				city : req.body.city,
				email : req.body.email,
				hash : req.body.password
				});
			
			// validate the model
			let errors = org.validateSync();
					
			if (errors)
				return returnInvalid('Niet alle verplichte velden zijn ingevuld: ' + formatError(errors), org);

			// check if e-mail already exists
			let tmpOrg = await Organization.findOne({ email : req.body.email});
			
			if (tmpOrg)
				return returnInvalid('Het opgegeven e-mail adres bestaat al in ons systeem.', org);

			// compare password and retyped password
			if (req.body.password != req.body.confirmPassword)
				return returnInvalid('Wachtwoord komt niet overeen.', org);
			
			// make a ref to the first available key at the organization
			let nextKey = await PubKeyController.findNext();
			org.pubkey = nextKey._id;
			
			let result = await org.save();
			
			if (result){
				res.message('Je bent geregistreerd en kan nu inloggen', 'ok');
				return res.redirect('/');
			}
		}
		catch(err){
			next(err);
		}
	},
	
	login : function (req, res){
		
		// check if user is already logged in. If so, skip login page
		if (req.session.user) {
			res.message('U bent al ingelogd');
			return res.redirect('account');
		}
			
		res.render('organization/login', {
			layout : 'main',
			title : "Inloggen",
			csrfToken : req.csrfToken()
		});
	},

	processLogin : async (req, res, next) => {

		let returnInvalid = (message) =>	{
			res.message(message);
			
			res.render('organization/login', {
				layout : 'main',
				csrfToken : req.csrfToken()
			});
		}
		
		if (!req.body.email || !req.body.password)
			return returnInvalid('E-mail adres of wachtwoord onjuist');
		
		let org = await Organization.findOne({ email : req.body.email});
		
		if (!org)
			return returnInvalid('E-mail adres of wachtwoord onjuist');
			
		let compareResult = await org.comparePassword(req.body.password);
		
		if (compareResult != true)
			return returnInvalid('E-mail adres of wachtwoord onjuist');
			
		// set session
		req.session.user = { 
			_id : org.id,
			name : org.name
		};
		
		return res.redirect('/account');
	},
	
	processCreateQR : async function (req, res){

		/* when we need the qr as image in the future:
		const qr = require('qr-image');
		var svg_string = qr.imageSync('http://localhost:3000/check-in/' + req.session.user._id, { type: 'png', parse_url : true,
			size:10 });		
		*/
		
		let siteUrl = req.protocol + '://' + req.get('host');
		
		let PdfPrinter = require('pdfmake');
		let template = require('../utils/pdftemplate.js');
		let tpl = template(
			siteUrl + '/check-in/' + req.session.user._id,
			req.session.user.name
		);	
		
		let printer = new PdfPrinter(tpl.fonts);
				
		let pdfDoc = printer.createPdfKitDocument(tpl.docDefinition, tpl.options);
		
		// send pdf to browser as download
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', 'attachment; filename=QR-code.pdf');
		pdfDoc.pipe(res);		
		pdfDoc.end();	
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