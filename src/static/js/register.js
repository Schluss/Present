document.addEventListener('DOMContentLoaded', async function(event) {

	const button = document.getElementById('submit-button');
	button.addEventListener('click', async function (event) {
	
		let form = element('mock-form');
	
		// form validation
		if (!form.checkValidity()){
			// create tmp button, click and remove it
			let tmpSubmit = document.createElement('button');
			form.appendChild(tmpSubmit);
			tmpSubmit.click();
			form.removeChild(tmpSubmit);			
			return;
		}
		
	
		// load the public key
		const armored = element('pubkey').value;
		const publicKey = await openpgp.key.readArmored(armored);

		// create message
		const messageObject = {
			name: element("name-field").value,
			email: element("email-field").value,
			phone: element("mobile-field").value,
		};

		const messageText = JSON.stringify(messageObject);

		// encrypt text message with public key
		const {data: encrypted} = await openpgp.encrypt({
			message: openpgp.message.fromText(messageText),
			publicKeys: publicKey.keys,
		});
					
		element('data').value = encrypted;
		element('form').submit();
	});
});

function element(id){return document.getElementById(id);}