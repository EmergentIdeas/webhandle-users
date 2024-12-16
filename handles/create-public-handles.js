const express = require('express')
const AccessRequired = require('../errors/access-required')
const AuthorizationRequired = require('../errors/authorization-required')

let defaults = {
	onLogin: function(req, res, next) {
		res.end('user status: ' + (!!req.user))
	},
	onLogout: function(req, res, next) {
		res.redirect('/login')
	},
	onLoginFailed: function(req, res, next) {
		res.redirect('/login')
	},
	onAuthRequired: function(req, res, next) {
		res.redirect('/login')
	},
	onAccessRequired: function(req, res, next) {
		res.redirect('/access-required')
	}
}

let create = function(authService, options) {
	let router = express.Router()
	options = Object.assign({}, defaults, options)
	
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
	
	webhandle.routers.errorHandlers.use((err, req, res, next) => {
		if(err instanceof AccessRequired) {
			return options.onAccessRequired(req, res, next)
		}
		if(err instanceof AuthorizationRequired) {
			return options.onAuthRequired(req, res, next)
		}
		next(err)
	})
	

	return router
}



module.exports = create