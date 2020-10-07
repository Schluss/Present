"use strict";

/* Example for password module:

const pw = require('./utils/password');

async function test(){
	
	let password = 'password';
	
	let hash = await pw.hash(password);
	console.log(hash);

	let c = await pw.compare(password, hash.salt, hash.hash);
	console.log(c);
}

test();
*/

const crypto = require('crypto');
const scmp = require('scmp');	// for timing-attack safe hash comparison

const options = {
	saltlen : 32,
	iterations : 25000,
	keylen : 512,
	encoding : 'hex',
	digestAlgorithm : 'sha256'
}

exports.hash = function(password) {
	return new Promise((resolve, reject) => {

		crypto.randomBytes(options.keylen, (err, salt) => {
			if (err) {
				return reject(err);
			}

			crypto.pbkdf2(password, salt, options.iterations, options.keylen, options.digestAlgorithm, (err, key) => {
				if (err) {
					return reject(err);
				}

				resolve({ 
					hash : key.toString(options.encoding), 
					salt: salt.toString(options.encoding) 
				});

			});
    
		});
	});

};

exports.compare = function(password, salt, hash) {
	return new Promise((resolve, reject) => {
    
	let saltBytes = new Buffer.from(salt, options.encoding);
	let hashBytes = new Buffer.from(hash, options.encoding);

    crypto.pbkdf2(password, saltBytes, options.iterations, options.keylen, options.digestAlgorithm, (err, keyB)=>{
		if (err) {
			return reject(err);
		}

		resolve(scmp(hashBytes, keyB));
	});
  });
};