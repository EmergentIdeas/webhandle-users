const Dreck = require('dreck')
const User = require('../user')
let wh = global.webhandle

const addCallbackToPromise = require('dreck/add-callback-to-promise')

class UserDreck extends Dreck {
	constructor(options) {
		super(options)
		this.templatePrefix = 'webhandle-users/users/'
		this.bannedInjectMembers.push("newpassword")
		
		let self = this
		
		this.injectors.push((req, focus, next) => {
				if(req.body.newpassword) {
					wh.services.authService.updatePass(focus, req.body.newpassword)
				}
				next()
			}
		)

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


module.exports = UserDreck