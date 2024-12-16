const express = require('express')
const UserDreck = require('./user-dreck')
const GroupDreck = require('./group-dreck')
const webhandle = global.webhandle

let defaults = {

}

let create = function(authService, options) {
	let router = express.Router()
	options = Object.assign({}, defaults, options)
	
	let userDreck = new UserDreck({
		mongoCollection: options.usersCollection,
		locals: options.locals
		, multipleAssociatedAccounts: options.multipleAssociatedAccounts  
	})
	
	router.use('/user', userDreck.addToRouter(express.Router()))
	
	webhandle.drecks = webhandle.drecks || {}
	webhandle.drecks.user = userDreck
	
	let groupDreck = new GroupDreck({
		mongoCollection: options.groupsCollection,
		locals: options.locals
	})
	
	router.use('/group', groupDreck.addToRouter(express.Router()))
	
	webhandle.drecks.group = groupDreck

	// 
	// router.get('/user-info', function(req, res, next) {
	// 	res.end(JSON.stringify(req.user))
	// 	
	// })
	
	// userDreck.addToRouter(router)

	return router
}


module.exports = create
