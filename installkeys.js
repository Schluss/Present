// install public keys in the key table
const openpgp = require('openpgp');
const db = require('./src/utils/db');
const fs = require('fs');
const PubKeyController = require('./src/controllers/PubKeyController');

const publicKeyFolder = __dirname + '/publickeys/';
const privateKeyFolder = __dirname + '/privatekeys/';
const generationCount = 50;

// get the next key number to generate
async function getNextKeyNr(){
	let result = await PubKeyController.findLatest();
	
	if (!result)
		return 1;
	
	return (result.nr+1);
}

// generate local keypair and store public key in db
async function generate(startNr, count){

    for (var i = startNr; i < (startNr+count); i++){

        let keypair = await openpgp.generateKey({ 
            rsaBits: 4096,
            curve: 'curve25519',  
            userIds: [{ name: '', email: '' }] });

        fs.writeFileSync(publicKeyFolder + i  + '.asc', keypair.publicKeyArmored);
        fs.writeFileSync(privateKeyFolder + i  + '.asc', keypair.publicKeyArmored);
		
		let result = await PubKeyController.create(i, keypair.publicKeyArmored);
		
		console.log('created keypair ' + i);
    }
}

// run the process
module.exports.run = async function(){
	
	await db.connect();
	
	let startNr = await getNextKeyNr();
	await generate(startNr, generationCount);
	
	return true;	

}


