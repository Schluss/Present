"use strict";

const PubKeyModel = require('../models/PubKey');

const PubKeyController = {
	
	// Get the latest added key
	findLatest : async function(){
		let res = await PubKeyModel.find().sort({ _id: -1 }).limit(1);
		return res[0];
	},
	
	
	// Get the first key
	findFirst : async function(){
		let res = await PubKeyModel.find().sort({ _id: 1 }).limit(1);
		return res[0];
	},	
	
	// find the next 'free' key and block it, this also updates the settings table
	findNext : async function(){
		
		const SettingsController = require('./SettingsController');
		
		// load the settings to retrieve the next available key (nextKey)
		let settings = await SettingsController.findFirst();
		
		// get the current free key
		let model = await PubKeyModel.findById(settings.nextKey);

		// get the next key in line
		let nextKeyModel = await PubKeyModel.findOne({ nr : (model.nr+1) }).exec();
		
		// update nextKey in settings so next time we'll retrieve the next free key
		settings.nextKey = nextKeyModel._id;
		await SettingsController.update(settings);
		
		// return the current key
		return model;
	},
	
	// store a public key, invoked programmatically, do not call from route
	create : async function(number, armoredKey){
		
		let model = new PubKeyModel({
			nr : number,
			key : armoredKey
		});

		let result = await model.save();
		
		return result;
	},
	
	/*
	find : async function(req, res){
		
		let result = await PubKeyModel.findById(req.body.id);
		
		return result;
		
	},
	*/	
		
}

module.exports = PubKeyController;