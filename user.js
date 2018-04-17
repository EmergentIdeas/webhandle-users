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
		
		
	*/
	
	constructor(options) {
		this.failedAttemps = 0
		this.groups = []
		this.enabled = true
		_.extend(this, options)
	}
}

module.exports = User