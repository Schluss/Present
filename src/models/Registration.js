"use strict";

const mongoose = require('mongoose');
const { Schema } = mongoose;

const Registration = new Schema({
	
		organization : { 
			type: Schema.Types.ObjectId,
			ref : 'Organization'
		},
		
		checkinDate : {
			type : Date,
			default: Date.now			
		},
	   
		data: {
			type: String,
			required: true
		},
	},
	{ 
		timestamps : true 
		
	});

// expire the document in 14 days (=1209600 seconds)
Registration.index({checkinDate: 1},{expireAfterSeconds: process.env.REGISTRATION_EXPIRATION});

module.exports =  mongoose.model('Registration', Registration);