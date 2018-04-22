const express = require('express')
const _ = require('underscore')
const AccessRequired = require('../errors/access-required')
const AuthorizationRequired = require('../errors/authorization-required')

const filog = require('filter-log')
let log = filog('allow-group')




let create = function(groups, router) {
	
	let accessFunction = function(req, res, next, fn) {
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
		fn(req, res, next)
	}
	
	let rewriteHandle = (layer) => {
		let org = layer.handle 
		layer.handle = (req, res, next) => {
			accessFunction(req, res, next, org)
		}
	}
	
	router.stack.forEach(rewriteHandle)
	
	router.stack.orgPush = router.stack.push
	router.stack.push = function(layer) {
		rewriteHandle(layer)
		this.orgPush(layer)
	}
	
	return router
}



module.exports = create