const crypto = require('crypto');

const filog = require('filter-log')
let log = filog('webhandle-users')
const AuthService = require('./auth-service')
let integrator = function(mongodb, options) {
	
	options = Object.assign({
		usersCollectionName: 'webhandleusers_users',
		groupsCollectionName: 'webhandleusers_groups',
		// session length in milliseconds
		sessionLength: 30 * 24 * 60 * 60 * 1000,
		sessionFinder: function(req, res) {
			return req.tracker || {}
		},
		sessionSaver: function(req, res, session, callback) {
			res.track(session, callback)
		}
		
	}, options)
	
	let integrator = {
		authService: new AuthService(
			Object.assign(
				{}
				, { 
					mongoCollection: mongodb.collection(options.usersCollectionName)
					, mongoUsersCollection: mongodb.collection(options.usersCollectionName)
					, mongoGroupsCollection: mongodb.collection(options.groupsCollectionName)
				}
				, options)
		),

		/**
		 * Creates a user info loader function
		 * @return function
		 */
		createUserInfoLoader: function() {
			return function(req, res, next) {
				
				res.createUserSession = function(userName, callback) {
					let token = {
						name: userName,
						expires: new Date(new Date().getTime() + (options.sessionLength))
					}
					let session = options.sessionFinder(req)
					session.userToken = token
					options.sessionSaver(req, res, session, callback)
				}
				
				res.removeUserSession = function(callback) {
					let session = options.sessionFinder(req)
					delete session.userToken
					options.sessionSaver(req, res, session, callback)
				}
				
				try {
					let session = options.sessionFinder(req)
					if(session.userToken) {
						if(session.userToken.expires < new Date()) {
							res.removeUserSession()
							return next()
						}
						else {
							integrator.authService.findUser(session.userToken.name, (err, user) => {
								if(user && user.enabled) {
									req.user = user
								}
								else {
									res.removeUserSession()
								}
								return next()
							})
						}
					}
					else {
						return next()
					}
				}
				catch(e) {
					log.error(e)
					next()
				}
			}
		}
	}
	
	return integrator
}


module.exports = integrator
