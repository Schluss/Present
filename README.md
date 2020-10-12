# Present

The securest way to let visitors register their contactdetails at establishments during the Covid pandemic.

## Features
- visitor registration via scanning a QR code
- registrations are client side encrypted with the organizations' public key, before posted to the server 
- organization dashboard 
- registrations are automatically deleted in 14 days
- organizations will only gain access to registrations when a contact research is started

## Run via Docker
To immediately start using, it is preferred to run the Docker image, described below

### Requirements
- A working MongoDB instance to connect to
- NGINX with Lets Encrypt? -> [todo!]

Configuration file:   
View, modify and rename .env.example to .env

Create keys:  
Generate 4096bit RSA keypairs [tool to do this will become available shortly] and store the **public** keys in the /publickeys folder. Please make sure the keys are named like '0.asc', '1.asc' etc. Keep the private keys LOCAL and as far as possible from the internet at any time!

Build the image:
> docker build -t [imagename] .

To see your image listed:
> docker images

Run the image:
> docker run -p 8080:8080 --env-file=.env [imagename]

Gain shell access to the image:
> docker exec -it [imagename] /bin/bash

Make public keys available to organizations:   
The following script will get all keys from the folder and store them in the database accordingly. Can be done at any time (to add additional keys for example), but do this at least the first time the app starts.   
> npm run installkeys


## Local development
For local development and testing, follow instructions below:

### Requirements
- NodeJS
- A working MongoDB instance to connect to

Configuration file:   
View, modify and rename .env.example to .env

Create keys:  
Generate 4096bit RSA keypairs [tool to do this will become available shortly] and store the **public** keys in the /publickeys folder. Please make sure the keys are named like '0.asc', '1.asc' etc. Keep the private keys OFFLINE and as far as possible from the internet at any time!

Clone the repository and run:   
> npm install

Make public keys available to organizations:   
The following script will get all keys from the folder and store them in the database accordingly. Can be done at any time (to add additional keys for example), but do this at least the first time the app starts.   
> npm run installkeys

To fire up the development webserver run:
> npm run servelocal


## Security measures in place:

- organization passwords are hashed and salted using pkbdf2
- user registrations client side encrypted using a 4096bit RSA key
- csrf: block Cross-site request forgery
- CSP: csp sets the Content-Security-Policy header to help prevent cross-site scripting attacks and other cross-site injections.
- hidePoweredBy: removes the X-Powered-By header.
- HSTS: sets Strict-Transport-Security header that enforces secure (HTTP over SSL/TLS) connections to the server.
- ieNoOpen: sets X-Download-Options for IE8+.
- noCache: sets Cache-Control and Pragma headers to disable client-side caching.
- noSniff: sets X-Content-Type-Options to prevent browsers from MIME-sniffing a response away from the declared content-type.
- frameguard: sets the X-Frame-Options header to provide clickjacking protection.
- xssFilter: sets X-XSS-Protection to enable the Cross-site scripting (XSS) filter in most recent web browsers.
- MongoDB connected via Client certificate
- Session data encrypted for logged in organizations

## Todo's:
- modify installkeys.js to pickup all keys available and not generate the keys anymore
- external tool to generate keypairs offline
- encryption organization details
- mongodb full database encryption
- qr code download styled PDF instead of image only
- interactive registration (using tablet) for example
- unit tests
- (automated) deployment
- secure way of private key distribution to organization (will be probably offline)
- commandline tool / script to get registrations
- totp (2 factor auth) at organization login
- organization: change password
- organization: reset forgotten password -> mailservices needed 

Postponed:
- admin portal
- admin totp (2factor auth) see: http://www.passportjs.org/packages/passport-totp/
- download user registrations as zip
- client side (also browser??) tool to automatic recover user registrations using key

## Contributors

- Maurice Verheesen   
https://gitlab.com/multimho

- Bob Hageman   
https://gitlab.com/bobhageman
