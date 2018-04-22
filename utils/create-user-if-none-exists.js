const User = require('../user')
/**
* @param {Object} authService
* @param {String} name
* @param {String} pass
* @param {Array} groups
* @param {Function} callback (err, user)
*/
let createUserIfNoneExists = function(authService, name, pass, groups, callback) {
	
	authService.findUser(name, (err, user) => {
		if(!err && !user) {
			user = new User({
				name: name
			})
			
			if(groups && typeof groups != 'function') {
				user.groups = groups
			}
			else if(typeof groups == 'function') {
				callback = groups
			}
			
			authService.updatePass(user, pass)
			authService.save(user, callback)
			
		}
		else if(callback) {
			callback(err)
		}
		
	})
}

module.exports = createUserIfNoneExists