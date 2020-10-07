"use strict";

const mongoose = require('mongoose');
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');


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
		
		/*
Admin.plugin(passportLocalMongoose, {
	usernameField : 'username',
	usernameLowerCase : true,
	//selectFields : 'username' //, username' 		// only this field is stored in a sessio after authentication
	});
*/
Admin.plugin(passportLocalMongoose);
module.exports = mongoose.model('Admin', Admin);
