"use strict";

const mongoose = require('mongoose');
const { Schema } = mongoose;

const Registration = new Schema({
	
		organization : { 
			type: Schema.Types.ObjectId,
			ref : 'Organization'
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
Registration.index({createdAt: 1},{expireAfterSeconds: process.env.REGISTRATION_EXPIRATION});

module.exports =  mongoose.model('Registration', Registration);