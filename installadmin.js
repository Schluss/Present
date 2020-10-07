// install public keys in the key table
//const openpgp = require('openpgp');
const db = require('./src/utils/db');
//const fs = require('fs');
//const PubKeyController = require('./src/controllers/PubKeyController');

const adminModel = require('./src/models/Admin');
const passport = require("passport");

passport.use(adminModel.createStrategy());
passport.serializeUser(adminModel.serializeUser());
passport.deserializeUser(adminModel.deserializeUser());

const adminUsername = 'admin';
const adminPassword = 'login';
const adminEmail = 'bob@schluss.org';

// run the process
module.exports.run = async function(){
	
	await db.connect();
	
	admin = new adminModel({
		username : adminUsername,
		email : adminEmail
	});
	
	adminModel.register(admin, adminPassword, function(err) {
			
		if (err) {
			console.log(err);
			throw('error while user admin!', err);
		}

		console.log('admin registered!');
	});
	
	return true;	
}


