"use strict";

const fs = require('fs');
const mongoose = require('mongoose');

// Process certificate string
// to be able to support all kinds of .env setups, newlines need to be replaced with ||
// this script will then convert || back to \n
let certString = process.env.DB_CERTIFICATE;
certString = certString.split("||").join("\n");

module.exports = {
	
	connect : async function(){
		
		return mongoose.connect(process.env.DB_URL,{
		  useNewUrlParser: true,
		  useUnifiedTopology: true,
		  useFindAndModify: false,
		  useCreateIndex: true,
		  sslCA: certString,
		  sslValidate: true 
		});
	},
	
	connection : function(){
		return mongoose.connection;		
	}
}