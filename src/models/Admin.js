"use strict";

const mongoose = require('mongoose');
const { Schema } = mongoose;

const Admin = new Schema({
		
		/*
		username : { 
			type: String,
			required: [true, 'Gebruikersnaam'],
			trim: true
		},*/
		
		username : String,
		password : String, 
	
		email: {
			type: String,
			required: [true, 'E-mail adres'],
			trim: true,
			unique: true
		},
		
		secret : { 
			type: String,
			required: false,
		},
		
	},
	{ 
		timestamps : true 
	});
		
module.exports = mongoose.model('Admin', Admin);