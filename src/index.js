"use strict";

const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const helmet = require("helmet");
const message = require('./utils/onetimemessage');
const migrations = require('./utils/migrations');
const minifyHTML = require('express-minify-html-2');
const db = require('./utils/db');
const MongoStore = require('connect-mongo')(session);
const mongoSanitize = require('express-mongo-sanitize');
const routes = require('./routes');
const app = express();

// INIT LOGIC -----------------------------------

// set the views location
	app.set('views', './src/views');

// template engine
	app.engine('html', exphbs({
		extname: '.html',
		defaultLayout : 'main'
	}));
	app.set('view engine', 'html');
 
// support URL-encoded bodies
	app.use(bodyParser.urlencoded({ 
		extended: true 
	}));

// sanitize user input
	app.use(mongoSanitize());

// parse cookies from HTTP Requests
	app.use(cookieParser());

// secure against different types of attacks
	app.use(helmet());
	
// minify HTML
	app.use(minifyHTML({
		override:      true,
		exception_url: false,
		htmlMinifier: {
			removeComments:            true,
			collapseWhitespace:        true,
			collapseBooleanAttributes: true,
			removeAttributeQuotes:     true,
			removeEmptyAttributes:     true,
			minifyJS:                  true
		}
	}));

// connect static assets 
	app.use(express.static(path.join(__dirname, 'static')));

// RUN LOGIC -----------------------------------

// connect to db
	db.connect()
	
	// run migrations
	.then(() => {
		return migrations.run()
	})
	
	// run app
	.then(() => {	

		// enable sessions
		let expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
		app.set('trust proxy', 1) // trust first proxy
			app.use(session({
				secret	: process.env.SESSION_SECRET, 
				name 	: process.env.SESSION_NAME,
				resave	: false, 
				saveUninitialized: false,
				cookie : { 
					// https requirement for cookies always in production
					secure 	: process.env.NODE_ENV == 'production' ? true : false, 			
					expires : expiryDate,
					httpOnly: true,
					path 	: '/',
				},
				// store sessions in db
				store: new MongoStore({ 
					mongooseConnection: db.connection(),
					//secret: 'mySecret'
				})
			}));
				
		// connect one-time messages
			app.use(message());		
	
		// connect routes
			app.use('/', routes);
			
		// todo: add middleware to be able to log errors	
			
		// fire up http server
		app.listen(process.env.PORT, () => { 
			console.log('Server started on ' + process.env.PORT)
		});

	})
	
	// or if something did go wrong...
	.catch((e) => {
		console.log('App startup failed:');
		console.log(e);
	})