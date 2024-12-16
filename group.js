
const filog = require('filter-log')

let log = filog('webhandle-users:User')

/**
 * @class Group
 * @property name {string} The group's name
 */
class Group {
	
	constructor(options) {
		Object.assign(this, options)
	}
	
}

module.exports = Group
