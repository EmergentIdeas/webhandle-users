const crypto = require('crypto');

const filog = require('filter-log')
let log = filog('webhandle-users')

let integrator = function(mongodb, options, callback) {
	
	options = _.extend({
		createFirstUser: true,
		firstUserName: 'administrator',
		firstUserPassword: 'hicEasBimAv8',
		usersCollectionName: 'webhandleusers_users',
		// session length in milliseconds
		sessionLength: 30 * 24 * 60 * 60 * 1000,
		sessionFinder: function(req, res) {
			return req.tracker
		},
		sessionSaver: function(req, res, session) {
			res.track(session)
		}
		
	}, options)
	
	return {
		authService: new AuthService(
			_.extend(
				{}
				, { mongoCollection: mongodb.collection(options.usersCollectionName)}
				, options)
		),
		createUserInfoLoader: function() {
			return function(req, res, next) {
				
				res.createUserSession = function(userName) {
					let token = {
						name: userName,
						expires: new Date(new Date().getTime() + (options.sessionLength))
					}
					let session = options.sessionFinder(req)
					session.userToken = token
					options.sessionSaver(req, res, session)
				}
				
				res.removeUserSession = function() {
					let session = options.sessionFinder(req)
					delete session.userToken
					options.sessionSaver(req, res, session)
				}
				
				let session = options.sessionFinder(req)
				if(session.userToken) {
					if(session.userToken.expires < new Date()) {
						res.removeUserSession()
						return next()
					}
					else {
						this.authService.findUser(userToken.userName, (err, user) => {
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
		}
	}
}


module.exports = integrator