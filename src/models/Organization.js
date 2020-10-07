"use strict";

const mongoose = require('mongoose');
const { Schema } = mongoose;
const password = require('../utils/password');

const Organization = new Schema({
	
		pubkey : {
			type : Schema.Types.ObjectId,
			ref : 'PubKey',
		},
		
		registrations : [{
			type : Schema.Types.ObjectId,
			ref : 'Registration'
			
		}],
		
		name : { 
			type: String,
			required: [true, 'Bedrijfsnaam'],
			trim: true
		},
		
		kvk : { 
			type: String,
			required: [true, 'KVK nummer'],
			trim: true,
			unique: true
		},

		address : { 
			type: String,
			required: [true, 'Adres'],
			trim: true
		},		
		
		email: {
			type: String,
			required: [true, 'E-mail adres'],
			trim: true,
			unique: true
		},
		
		hash : {
			type: String
		},
		
		salt : {
			type : String
		}
		
		
	},
	{ 
		timestamps : true 
	});
	
Organization.pre('save', async function (next) {
    var user = this;
    if (this.isModified('hash') || this.isNew) {
		
		let pass = await password.hash(user.hash);
		user.hash = pass.hash;
		user.salt = pass.salt;
		
		next();
		
    } else {
        return next();
    }
});

Organization.methods.comparePassword = async function (passw) {
	
	return await password.compare(passw, this.salt, this.hash);

};	

module.exports = mongoose.model('Organization', Organization);