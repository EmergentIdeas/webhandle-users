const express = require('express')
const _ = require('underscore')
const UserDreck = require('./user-dreck')

let defaults = {

}

let create = function(authService, options) {
	let router = express.Router()
	options = _.extend({}, defaults, options)
	
	let userDreck = new UserDreck({
		mongoCollection: options.usersCollection,
		locals: options.locals
	})
	
	router.use('/user', userDreck.addToRouter(express.Router()))
	// 
	// router.get('/user-info', function(req, res, next) {
	// 	res.end(JSON.stringify(req.user))
	// 	
	// })
	
	// userDreck.addToRouter(router)

	return router
}


module.exports = create