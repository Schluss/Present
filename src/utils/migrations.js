"use strict";

const SettingsController = require('../controllers/SettingsController');

const latestVersion = 1;

// run updates prior to starting the app

const updates = {

    'v[nr]' : function(){
		return new Promise(async function(resolve, reject){
			
			
			resolve(true);
		});
    },

    'v2' : function(){
		return new Promise(async function(resolve, reject){
			
			
			resolve(true);
		});
    },

    // initial version, from v0 to v1
    'v1' : function(){
        return new Promise(async function(resolve, reject){
			
			// install some keys to start with
			const installkeys = require('../../installkeys');
			await installkeys.run();
	
			// get first key
			const PubKeyController = require('../controllers/PubKeyController');
			const pubKey = await PubKeyController.findFirst();
	
			// create settings object			
			await SettingsController._create(1, pubKey._id);
	
			resolve(true);
        });

    }
}

function getVersion(){
    
    return new Promise(async function(resolve, reject){

		let settings = await SettingsController.findFirst();
		
		if (!settings)
			resolve(0);
		else
			resolve(settings.version);
    });
}

function updateVersion(newVersion){
    return new Promise(async function(resolve, reject){
		let settings = await SettingsController.findFirst();

		settings.version = newVersion;
		
		await SettingsController.update(settings);
		
		resolve(true);
    });
}

const migrations = {

    run : async function(){

        let version = await getVersion();

        console.log('current version: ' + version);

        if (version >= latestVersion){
			return;
		}
		
		console.log('updating to newest version: ' + latestVersion);

		for (var i = version; i < latestVersion; i++){

			// run the actual update
			if (await updates['v' + (i+1)]()){
				
				// on success, store this as the current version
				await updateVersion((i+1));
			
				console.log('updated to version ' + (i+1));
			}
			else
			{
				throw('error updating, check updates.' + (i+1));
			}      
		}
    }
}

module.exports = migrations;