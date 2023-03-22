const Dreck = require('dreck')
const Group = require('../group')
let wh = global.webhandle

const addCallbackToPromise = require('dreck/add-callback-to-promise')


class GroupDreck extends Dreck {
	constructor(options) {
		super(options)
		this.templatePrefix = 'webhandle-users/groups/'
		
	}
	
	synchronousPostProcessor(obj) {
		let g = new Group(obj)
		return g
	}
	
	createTitle(focus) {
		return 'Create Group'
	}
	
	editTitle(focus) {
		return 'Edit Group'
	}
	
	listTitle(items) {
		return 'List Group'
	}
	
	showTitle(items) {
		return 'View Group'
	}
	
	sort(req, res, focus, callback) {
		let p = new Promise((resolve, reject) => {
			if(focus && Array.isArray(focus)) {
				focus = focus.sort((one, two) => {
					try {
						let loginOne = one.name.toLowerCase();
						let loginTwo = two.name.toLowerCase();
						if (loginOne < loginTwo) {
							return -1
						}
						if (loginOne > loginTwo) {
							return 1
						}
					}
					catch(e) {}
					return 0
				})
			}
			resolve(focus)
		})		
		return addCallbackToPromise(p, callback)
	}
}


module.exports = GroupDreck