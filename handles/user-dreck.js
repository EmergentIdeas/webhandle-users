const Dreck = require('dreck')
const User = require('../user')

class UserDreck extends Dreck {
	constructor(options) {
		super(options)
		this.templatePrefix = 'webhandle-users/users/'
	}
	
	synchronousPostProcessor(obj) {
		return new User(obj)
	}
	
	createTitle(focus) {
		return 'Create User'
	}
	
	editTitle(focus) {
		return 'Edit User'
	}
	
	listTitle(items) {
		return 'List Users'
	}
	
	showTitle(items) {
		return 'View User'
	}
	

}


module.exports = UserDreck