// polyfill Contributing with a minified polyfill for window.atob + window.btoa that I'm currently using.
// https://stackoverflow.com/a/20090752
(function(){function t(t){this.message=t}var e="undefined"!=typeof exports?exports:this,r="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";t.prototype=Error(),t.prototype.name="InvalidCharacterError",e.btoa||(e.btoa=function(e){for(var o,n,a=0,i=r,c="";e.charAt(0|a)||(i="=",a%1);c+=i.charAt(63&o>>8-8*(a%1))){if(n=e.charCodeAt(a+=.75),n>255)throw new t("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");o=o<<8|n}return c}),e.atob||(e.atob=function(e){if(e=e.replace(/=+$/,""),1==e.length%4)throw new t("'atob' failed: The string to be decoded is not correctly encoded.");for(var o,n,a=0,i=0,c="";n=e.charAt(i++);~n&&(o=a%4?64*o+n:n,a++%4)?c+=String.fromCharCode(255&o>>(6&-2*a)):0)n=r.indexOf(n);return c})})();

document.addEventListener('DOMContentLoaded', async function(event) {

	// try to get cookies from previous filled form

	let checkinData = getCookie('checkin_details');

	if (checkinData){
		checkinData = JSON.parse(atob(checkinData));
		
		element("name-field").value = checkinData.name;
		element("email-field").value = checkinData.email;
		element("mobile-field").value = checkinData.phone;
	}

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
		
		// store the items as a cookie to autofill next time this form is shown
		setCookie('checkin_details', btoa(JSON.stringify(messageObject)), 14);
		
		element('data').value = encrypted;
		element('form').submit();
	});
});

function element(id){return document.getElementById(id);}

function setCookie(cname, cvalue, exdays) {
  let d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";secure;path=/";
}

function getCookie(cname) {
  let name = cname + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}