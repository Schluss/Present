"use strict";

const mongoose = require('mongoose');

const PubKey = new mongoose.Schema({
	
		key : { 
			type: String,
			required : true
		},
		
		nr : { 
			type: Number,
			required : true
		}
	},
	{ 
		timestamps : true 
	});

module.exports = mongoose.model('PubKey', PubKey);