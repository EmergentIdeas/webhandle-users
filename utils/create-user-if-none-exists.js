const User = require('../user')
/**
* @param {Object} authService
* @param {String} name
* @param {String} pass
* @param {Array} groups
* @param {Function} callback (err, user)
*/
let createUserIfNoneExists = function(authService, name, pass, groups, callback) {
	
	authService.findUser(name, async (err, user) => {
		if(!err && !user) {
			user = new User({
				name: name
			})
			
			if(groups && typeof groups != 'function') {
				user.groups = groups
				let dbGroups = await authService.fetchGroups()
				let dbGroupNames = dbGroups.map(group => group.name)
				for(let group of groups) {
					if(!dbGroupNames.includes(group)) {
						authService.createGroup(group)
					}
				}
			}
			else if(typeof groups == 'function') {
				// if "groups" is a function, this means the caller didn't sepcify and groups and it's actually the callback
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