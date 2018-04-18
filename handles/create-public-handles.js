const express = require('express')
const _ = require('underscore')

let defaults = {
	onLogin: function(req, res, next) {
		res.end('user status: ' + (!!req.user))
	},
	onLogout: function(req, res, next) {
		res.redirect('/login')
	},
	onLoginFailed: function(req, res, next) {
		res.redirect('/login')
	}
}

let create = function(authService, options) {
	let router = express.Router()
	options = _.extend({}, defaults, options)
	
	router.post('/login', function(req, res, next) {
		authService.login(req.body.name, req.body.password, (err, user) => {
			if(err) {
				return options.onLoginFailed(req, res, next)
			}
			else {
				res.createUserSession(user.name, () => {
					req.user = user
					options.onLogin(req, res, next)
				})
			}
		})
	})


	router.get('/logout', function(req, res, next) {
		res.removeUserSession(() => {
			options.onLogout(req, res, next)
		})
		
	})

	return router
}



module.exports = create