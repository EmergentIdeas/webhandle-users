const express = require('express')
const _ = require('underscore')
const AccessRequired = require('../errors/access-required')
const AuthorizationRequired = require('../errors/authorization-required')

const filog = require('filter-log')
let log = filog('allow-group')

let create = function(groups, handlers) {
	let router = express.Router()
	
	router.use(function(req, res, next) {
		if(!req.user) {
			return next(new AuthorizationRequired())
		}
		if(!req.user.groups) {
			return next(new AccessRequired())
		}
		if(typeof groups == 'string') {
			groups = [groups]
		}
		if(_.intersection(req.user.groups, groups).length == 0) {
			return next(new AccessRequired())
		}
		next()
	})
	
	if(handlers) {
		router.use(handlers)
	}
	
	return router
}



module.exports = create