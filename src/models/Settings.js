"use strict";

const mongoose = require('mongoose');
const { Schema } = mongoose;

const Settings = new Schema({
	
		version : { 
			type: Number,
			required: true,
			default: 1
		},
	  
		// holds the next available key
		nextKey : {
			type: Schema.Types.ObjectId,
			ref : 'PubKey'
		}	
	},
	{ 
		timestamps : true 
	});

module.exports = mongoose.model('Settings', Settings);