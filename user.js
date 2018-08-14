
const filog = require('filter-log')

let log = filog('webhandle-users:User')
const _ = require('underscore')


class User {
	// Attributes
	/*
		name:		string
		hashedPass: string
		email:		string
		enabled:	boolean
		failedAttemps: number
		groups:		[string]
		firstName:	string
		lastName:	string
		
		
	*/
	
	constructor(options) {
		this.failedAttemps = 0
		this.groups = []
		this.enabled = true
		_.extend(this, options)
	}
	
	isMember(group /* string */) {
		if(!this.groups) {
			return false
		}
		return this.groups.includes(group)
	}
}

module.exports = User