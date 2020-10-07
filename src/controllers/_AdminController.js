"use strict";

const orgModel = require('../models/Organization');
const adminModel = require('../models/Admin');
const csrf = require('csurf');
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
var GoogleAuthenticator = require('passport-2fa-totp').GoogeAuthenticator;

//passport.use(adminModel.createStrategy());

passport.serializeUser(adminModel.serializeUser());
passport.deserializeUser(adminModel.deserializeUser());
/*     passport.serializeUser((user, done) => {
          console.log('ser: ' + user._id);
		  done(null, user._id);
        });

        passport.deserializeUser( (id, done) => {
			console.log('des: ' + id);
			adminModel.findById(id,
			
            //db.collection('users').findOne(
                //{_id: new ObjectID(id)},
                (err, doc) => {
                    done(null, doc); // this is the fix
                }
            );
        });
	*/	
passport.use(adminModel.createStrategy());
		
const AdminController = {

	requireCSRF : csrf(),
	
	requireAuth : (req, res, next) => {

		//console.log(req.isAuthenticated());

		if (req.session.admin) {
			next();
		} else {
			
			res.message('Log in om verder te gaan');
			res.redirect('/admin');
		}
	},
	
	login : function (req, res){
		
		// check if user is already logged in:
		if (req.session.admin) {
			res.message('U bent al ingelogd');
			return res.redirect('/admin/account');
		}
			
		res.render('admin/login', {
			layout : 'organization',
			csrfToken : req.csrfToken()
		});
	},	
	
		//http://www.passportjs.org/docs/downloads/html/
		//en dan Custom callback!
	processLogin : function (req, res, next) {
	
	  passport.authenticate('local',
	  (err, user, info) => {
		  
		  console.log('processLogin');
		  
		if (err) {
			console.log('err');
			console.log(err);
			
			return res.render('admin/login', {
				layout : 'organization',
				csrfToken : req.csrfToken()
			});			
			
		  //return next(err);
		}

		if (!user) {
			
			console.log('no user!');
			console.log(info);
			
			return res.render('admin/login', {
				layout : 'organization',
				csrfToken : req.csrfToken()
			});			
		  //return res.redirect('/login?info=' + info);
		}

		req.logIn(user, function(err) {
		  if (err) {
			  
			  
			  
			console.log('err!');
			console.log(err);
			
			return res.render('admin/login', {
				layout : 'organization',
				csrfToken : req.csrfToken()
			});				  
			  
			return next(err);
		  }

		//tmp
		req.session.admin = user;
		console.log(req.session);

		req.session.save(() => res.redirect('/admin/account'));

		});

	  })(req, res, next);
	
		/*
		const { user }= await adminModel.authenticate()(req.body.username, req.body.password);

		console.log(user);

		if (user)
		{
			req.session.admin = user;
			return res.redirect('/admin/account');
		}
		
		res.render('admin/login', {
			layout : 'organization',
			csrfToken : req.csrfToken()
		});
		*/
	
	},
	
	setupTwoFactor : async function(req, res){
		//var errors = req.flash('setup-2fa-error');
		
		//console.log(req.session.admin);
		
		var qrInfo = GoogleAuthenticator.register('Present (' + req.session.admin.username + ')');
		req.session.qr = qrInfo.secret;
		
		return res.render('admin/setup-2fa', {
			layout : 'organization',
			//errors: errors,
			qr: qrInfo.qr
		});
	},
	
	processSetupTwoFactor : async function(req, res){
		
		console.log(req.session);
		
		if (!req.session.qr) {
			//req.flash('setup-2fa-error', 'The Account cannot be registered. Please try again.');
			res.message('Two factor auth cannot be registered. Please try again.')
			return res.redirect('/admin/setup-2fa');
		}
		
		adminModel.findById(req.session.admin._id, function (err, admin) {
			if (err) {
				res.message('Two factor auth cannot be registered. Please try again. Err: ' + err);
				//req.flash('setup-2fa-error', err);
				return res.redirect('/admin/setup-2fa');
			}
			
			if (!admin) {
				// User is not found. It might be removed directly from the database.
				//req.logout();
				return res.redirect('/');
			}
			
			adminModel.update(admin, { $set: { secret: req.session.qr } }, function (err) {
				if (err) {
					res.message('Two factor auth cannot be registered. Please try again. Err: ' + err);
					return res.redirect('/admin/setup-2fa');
				}
				
				res.redirect('/admin/account');
			});      
		});
	},
	
	account : async function(req, res){
	
		try {
	
			let orgs = await orgModel.find({});
		
			//let count = await RegisterController.getCountToday(req.session.user._id);
		
			//console.log(JSON.parse(JSON.stringify(orgs)));
		
			let orgA = orgs[0];
		
			
			let results = [];
			for (org in orgs){
				results.push(orgs[org].toJSON());
			}
			
			//console.log(results);
		
			res.render('admin/index', {
				layout : 'organization',
				orgs : results
				//org : JSON.parse(JSON.stringify(orgs)) //orgs//.toJSON(),
				//registrationCount : count
			});
		
		}
		catch(err){
			console.log(err);
		}
	},
	
	logout : function(req, res){
	  if (req.session) {
		req.session.destroy();
		//res.clearCookie('session-id');
		res.redirect('/admin');
	  }
	  else {
		 res.redirect('/admin'); 
		//var err = new Error('You are not logged in!');
		//err.status = 403;
		//next(err);
	  }
	},	
};

//var TwoFAStartegy = require('passport-2fa-totp').Strategy;
/*
passport.use(adminModel.createStrategy());
passport.serializeUser(adminModel.serializeUser());
passport.deserializeUser(adminModel.deserializeUser());
	
passport.use(new TwoFAStartegy(function (username, password, done) {
    // 1st step verification: username and password
    
    adminModel.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false); }
        if (!user.verifyPassword(password)) { return done(null, false); }
        return done(null, user);
    });
}, function (user, done) {
    // 2nd step verification: TOTP code from Google Authenticator
    
    if (!user.secret) {
        done(new Error("Google Authenticator is not setup yet."));
    } else {
        // Google Authenticator uses 30 seconds key period
        // https://github.com/google/google-authenticator/wiki/Key-Uri-Format
        
        var secret = GoogleAuthenticator.decodeSecret(user.secret);
        done(null, secret, 30);
    }
}));
	
const errorFormatter = e => {
	
	//for 
	
};
	
const AdminController = {

	csrfProtection : csrf({ cookie: true }),

	requireAuth : (req, res, next) => {

		if (req.session.admin) {
			next();
		} else {
			
			res.message('Log in om verder te gaan');
			res.redirect('/');
		}
	},

	
	account : async function(req, res){
	
		try {
	
			let orgs = await orgModel.find({});
		
			//let count = await RegisterController.getCountToday(req.session.user._id);
		
			//console.log(JSON.parse(JSON.stringify(orgs)));
		
			let orgA = orgs[0];
		
			
			let results = [];
			for (org in orgs){
				results.push(orgs[org].toJSON());
			}
			
			//console.log(results);
		
			res.render('admin/index', {
				layout : 'organization',
				orgs : results
				//org : JSON.parse(JSON.stringify(orgs)) //orgs//.toJSON(),
				//registrationCount : count
			});
		
		}
		catch(err){
			console.log(err);
		}
	},
	
	login : function (req, res){
		
		// check if user is already logged in:
		if (req.session.admin) {
			res.message('U bent al ingelogd');
			return res.redirect('/admin/account');
		}
			
		res.render('admin/login', {
			layout : 'organization',
			csrfToken : req.csrfToken()
		});
	},

	processLogin : async function (req, res) {
	
		const { user }= await adminModel.authenticate()(req.body.username, req.body.password);

		console.log(user);

		if (user)
		{
			req.session.admin = user;
			return res.redirect('/admin/account');
		}
		
		res.render('admin/login', {
			layout : 'organization',
			csrfToken : req.csrfToken()
		});
	},
	
	
	logout : function(req, res){
	  if (req.session) {
		req.session.destroy();
		//res.clearCookie('session-id');
		res.redirect('/admin');
	  }
	  else {
		 res.redirect('/admin'); 
		//var err = new Error('You are not logged in!');
		//err.status = 403;
		//next(err);
	  }
	},
}
*/
module.exports = AdminController;