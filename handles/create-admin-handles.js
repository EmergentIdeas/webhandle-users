const express = require('express')
const _ = require('underscore')

let defaults = {

}

let create = function(authService, options) {
	let router = express.Router()
	options = _.extend({}, defaults, options)
	
	router.get('/user-info', function(req, res, next) {
		res.end(JSON.stringify(req.user))
		
	})


	return router
}



module.exports = create