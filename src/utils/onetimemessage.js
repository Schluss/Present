"use strict";

function middleware(options) {

	return function (req, res, next) {
		
		res.message = function(message){req.session.message = message};
		
		// grab reference of render
		var _render = res.render;
		
		// override logic
		res.render = function (view, options, fn) {

			if (req.session.message != ''){
				options.message = req.session.message;
				req.session.message = ''; // clear again
			}

			_render.call(this, view, options, fn);
		};
		next();
	}
}

module.exports = middleware;