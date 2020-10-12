"use strict";

function middleware(options) {

	return function (req, res, next) {
		
		res.message = function(message, type){req.session.message = message, req.session.messageType = type};
		

		
		// grab reference of render
		var _render = res.render;
		
		// override logic
		res.render = function (view, options, fn) {

			if (req.session.message != ''){
				options.message = req.session.message;
				options.messageType = req.session.messageType;
				req.session.message = ''; // clear again
				req.session.messageType = ''; // clear again
			}

			_render.call(this, view, options, fn);
		};
		next();
	}
}

module.exports = middleware;