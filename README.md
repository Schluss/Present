# Present

## Setup

Required:
- NodeJS
- MongoDB

### Install

> npm install

### .ENV file
View, modify and rename .env.example to .env

### MongoDB
Setup a Mongo DB instance and create credentials including a certificate to be able to connect to the db

### Run locally

> npm run servelocal

### Generate keys
At first startup automatically 50 RSA 4096 bit keys will be generated and installed. If you want to install additional keys run:

> npm run installkeys 

## Security measures in place already:

- organization passwords are hashed and salted using pkbdf2
- user registrations client side encrypted using a 4096bit RSA key
- csrf: block Cross-site request forgery
- https://github.com/helmetjs/csp csp sets the Content-Security-Policy header to help prevent cross-site scripting attacks and other cross-site injections.
- https://github.com/helmetjs/hide-powered-by hidePoweredBy removes the X-Powered-By header.
- https://github.com/helmetjs/hsts hsts sets Strict-Transport-Security header that enforces secure (HTTP over SSL/TLS) connections to the server.
- https://github.com/helmetjs/ienoopen ieNoOpen sets X-Download-Options for IE8+.
- https://github.com/helmetjs/nocache noCache sets Cache-Control and Pragma headers to disable client-side caching.
- https://github.com/helmetjs/dont-sniff-mimetype noSniff sets X-Content-Type-Options to prevent browsers from MIME-sniffing a response away from the declared content-type.
- https://github.com/helmetjs/frameguard frameguard sets the X-Frame-Options header to provide clickjacking protection.
- https://github.com/helmetjs/x-xss-protection xssFilter sets X-XSS-Protection to enable the Cross-site scripting (XSS) filter in most recent web browsers.
- MongoDB connected via Certificate

## Todo's:
- encryption organization details
- mongodb full database encryption
- qr code download styled PDF instead of image only
- interactive registration (using tablet) for example
- unit tests
- (automated) deployment
- secure way of private key distribution to organization (will be probably offline)
- tool / script to get registrations
- totp (2 factor auth) at organization login

Postponed:
- admin portal
- admin totp (2factor auth) see: http://www.passportjs.org/packages/passport-totp/
- download user registrations as zip
- client side (also browser??) tool to automatic recover user registrations using key