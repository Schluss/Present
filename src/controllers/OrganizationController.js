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
		
		// check if user is already logged in. If so, skip login page
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

		let returnInvalid = () =>	{
			res.message('E-mail adres of wachtwoord onjuist');
			
			res.render('organization/login', {
				layout : 'main',
				csrfToken : req.csrfToken()
			});
		}

		let org = await Organization.findOne({ email : req.body.email});
		
		if (!org)
			return returnInvalid();
			
		let compareResult = await org.comparePassword(req.body.password);
		
		if (compareResult != true)
			return returnInvalid();
			
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
		
		var PdfPrinter = require('pdfmake');
		let fs = require('fs');
		// Define font files
		var fonts = {
			Walsheim: {
				normal : __dirname + '/../static/fonts/GT-Walsheim-Regular.ttf',
				bold :  __dirname + '/../static/fonts/GT-Walsheim-Bold.ttf'
			}
		};		
		
		var printer = new PdfPrinter(fonts);
		
		var docDefinition = {
		  // a string or { width: number, height: number }
		  pageSize: 'A4',

		  // by default we use portrait, you can change it to landscape if you wish
		  pageOrientation: 'portrait',

		  // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
		  pageMargins: [ 40, 20, 40, 60 ],			
			
			background : [
				{	image : __dirname + '/../static/img/pdf-background.png', width: 599 }
			],

		  info: {
			title: 'Check-in met QR code',
			author: 'Present - by Schluss',
			subject: '',
			keywords: '',
		  },			
					
		  content: [
		  
			// logo image
			{
				svg:  fs.readFileSync(__dirname + '/../static/img/logo.svg', 'utf8'),
				alignment : 'center',
				width : 75
			},	

			// title
			{ text: '\nLaat weten dat je er bent', bold: true, fontSize: 30, alignment : 'center' },

			// text
			{ text: '\nDeel je gegevens voor een mogelijk bron\n en contactonderzoek door de GGD\n\n\n\n', fontSize: 15, color : '#666666', alignment : 'center', height: 200 },
			
			// marker 
			{ svg:  fs.readFileSync(__dirname + '/../static/img/marker.svg', 'utf8'), width : 15, alignment : 'center' },
			
			// organization name
			{
				width: '50%',
				text : req.session.user.name,
				bold: true, 
				fontSize: 20, 
				alignment : 'center'
			},
						
			// spacer
			{ text : '\n\n'},			

			// check items
			{			  
				columns : [
				
					{ text : '', width: '22%' },
					
					{
						width: '8%',
						svg:  fs.readFileSync(__dirname + '/../static/img/check.svg', 'utf8'),
						width : 18,
					},

					{ text : '', width: '1%' },					
					
					{
						width : '20%',
						text: 'Anoniem', fontSize: 15
					},
					
					{
						width: '8%',
						svg:  fs.readFileSync(__dirname + '/../static/img/check.svg', 'utf8'),
						width : 18
					},	

					{ text : '', width: '1%' },						
					
					{
						width : '*',
						text: 'Niet verplicht, wel lief', fontSize: 15
					}			
				
				]
				
			},
			{			  
				columns : [
				
					{ text : '', width: '22%' },
					
					{
						svg:  fs.readFileSync(__dirname + '/../static/img/check.svg', 'utf8'),
						width : 18
					},	

					{ text : '', width: '1%' },						
					
					{
						width : '20%',
						text: 'Veilig', fontSize: 15
					},
					
					{
						svg:  fs.readFileSync(__dirname + '/../static/img/check.svg', 'utf8'),
						width : 18
					},	

					{ text : '', width: '1%' },						
					
					{
						width : '*',
						text: 'Na 14 dagen vernietigd', fontSize: 15
					}				
				
				]
				
			},	

			{ text: '\n', fontSize: 20 },

			// qr code
			{ qr: 'http://localhost:3000/check-in/' + req.session.user._id, eccLevel : 'M', fit : 200, alignment: 'center' },
		  
			// spacer
			{ text : '\n\n\n\n\n\n\n' },
		  
		  
			// powered and secured by
			{
				columns : [
			  
					{ text : '', width: '35%' },
					
					{
						svg:  fs.readFileSync(__dirname + '/../static/img/lock.svg', 'utf8'),
						width : 10
					},
					
					{ text : '', width: '1%' },					
					
					{
						text : 'secured and powered by',
						color : '#7e879c',
						width: '18%',
						fontSize: 8
					},	

					{
						svg:  fs.readFileSync(__dirname + '/../static/img/schluss-logo.svg', 'utf8'),
						width : 55
					}					
			  
				] 
		  }
		  
		  ],

  			defaultStyle: {
				font: 'Walsheim'
			}
		};

		var options = {
		  // ...
		};
		
		var pdfDoc = printer.createPdfKitDocument(docDefinition, options);
		
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