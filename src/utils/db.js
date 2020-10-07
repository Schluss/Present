"use strict";

const fs = require('fs');
const mongoose = require('mongoose');
const certFile = fs.readFileSync(process.env.DB_CERTIFICATE);

module.exports = {
	
	connect : async function(){
		
		return mongoose.connect(process.env.DB_URL,{
		  useNewUrlParser: true,
		  useUnifiedTopology: true,
		  useFindAndModify: false,
		  useCreateIndex: true,
		  sslCA: certFile,
		  sslValidate: true 
		});
	},
	
	connection : function(){
		return mongoose.connection;		
	}
}