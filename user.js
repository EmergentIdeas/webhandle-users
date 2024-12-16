
const filog = require('filter-log')

let log = filog('webhandle-users:User')


/**
 * @class User
 * @property name {string} The group's name
 * @property hashedPass {string} The hash of the user's password
 * @property email {string} The user's email
 */
class User {
	// Attributes
	/*
		name:		string
		hashedPass: string
		email:		string
		enabled:	boolean
		failedAttempts: number
		groups:		[string]
		firstName:	string
		lastName:	string
		
		
	*/
	
	constructor(options) {
		this.failedAttempts = 0
		this.groups = []
		this.enabled = true
		Object.assign(this, options)
	}
	
	/**
	 * Determines if a user is a member of a specific group
	 * @param {string} group The group name for test
	 * @return boolean
	 */
	isMember(group /* string */) {
		if(!this.groups) {
			return false
		}
		return this.groups.includes(group)
	}
}

module.exports = User
