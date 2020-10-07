"use strict";

const SettingsModel = require('../models/Settings');
const PubKeyController = require('./PubKeyController');

const SettingsController = {
	
	// get the single settings record
	findFirst : async function(){
		let res = await SettingsModel.find().sort({ _id: 1 }).limit(1);
		return res[0];
	},
	
	// create, invoked programmatically, do not call from route
	_create : async function(version){
		
		if (await this.findFirst())
			throw 'settings already created';
		
		// get the first available key
		let firstKey = await PubKeyController.findFirst();
		
		if (!firstKey)
			throw 'no public keys found';
		
				
		let model = new SettingsModel({
			version : version,
			nextKey : firstKey._id
		});

		let result = await model.save();
		
		console.log('settings record created');
		
		return result;
	},
	
	update : async function(model){

		let res = await model.save();
		return res;
	}
	
}

module.exports = SettingsController;