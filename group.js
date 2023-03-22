
const filog = require('filter-log')

let log = filog('webhandle-users:User')
const _ = require('underscore')

/**
 * @class Group
 * @property name {string} The group's name
 */
class Group {
	
	constructor(options) {
		_.extend(this, options)
	}
	
}

module.exports = Group