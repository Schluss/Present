"use strict";

const csrf = require('csurf');
const OrganizationModel = require('../models/Organization');
const PubKeyModel = require('../models/PubKey');
const RegisterModel = require('../models/Registration');

const RegisterController = {

	requireCSRF : csrf({ cookie: true }),

	// returns the number of registrations for an organization in total
	getCount : async(orgId)  =>  {
		
		let count = await RegisterModel.countDocuments({organization : orgId});
		return count;		
	},

	// returns the number of registrations for an organization today
	getCountToday : async(orgId) =>  {

		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		
		let count = await RegisterModel.countDocuments({organization : orgId, createdAt: {$gte: today}});
		
		return count;
	},

	get : async (req, res, next) => {
		try {
		
			let org = await OrganizationModel.findById(req.params.id);
			
			if (!org)
				throw('Organisatie niet gevonden');
			
			let pubkey = await PubKeyModel.findById(org.pubkey);
			
			if (!pubkey)
				throw('Organisatie niet gevonden');

			res.render('register/index', {
				layout : 'base_registration',
				csrfToken : req.csrfToken(),
				org : org.toJSON(),
				pubkey : pubkey.toJSON()
				});
			
		}
		catch(err){
			next(err);		
		}
	},
	
	post : async (req, res, next) => {
		
		try {

			// fill the model
			let reg = new RegisterModel({
				organization : req.body.org,
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
			
			return res.redirect('/success/' + req.body.org);
			
		}
		catch(err){
			next(err);
		}
	},

	success : async (req, res, next) => {	
		try {
			
			let org = await OrganizationModel.findById(req.params.id);
			
			if (!org)
				throw('Organisatie niet gevonden');	
		
			res.render('register/success', {
				layout : 'base_registration',
				org : org.toJSON(),
				});
		}
		catch(err){
			next(err);
		}
	}
};

module.exports = RegisterController;
