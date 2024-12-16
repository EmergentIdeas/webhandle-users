const Dreck = require('dreck')
const User = require('../user')
let wh = global.webhandle

const addCallbackToPromise = require('dreck/add-callback-to-promise')
const createValuedCheckboxInjector = require('dreck/binders/create-valued-checkbox-injector')


class UserDreck extends Dreck {
	constructor(options) {
		super(options)
		this.templatePrefix = 'webhandle-users/users/'
		this.bannedInjectMembers.push("newpassword")
		
		let self = this
		
		this.fetchAssociatedAccounts = options.fetchAssociatedAccounts
		this.multipleAssociatedAccounts = options.multipleAssociatedAccounts || false
		
		this.injectors.push(createValuedCheckboxInjector('groups'))
		this.injectors.push(createValuedCheckboxInjector('associatedAccounts'))
		this.injectors.push((req, focus, next) => {
				if(req.body.newpassword) {
					wh.services.authService.updatePass(focus, req.body.newpassword)
				}
				if(req.body.groupNames) {
					focus.groups = req.body.groupNames.split(',').map(entry => entry.trim()).filter(entry => !!entry)
				}
				if(req.body.associatedAccounts && typeof req.body.associatedAccounts === 'string') {
					focus.associatedAccounts = req.body.associatedAccounts.split(',').map(entry => entry.trim()).filter(entry => !!entry)
				}
				if(focus.associatedAccounts === '') {
					delete focus.associatedAccounts
				}

				next()
			}
		)

	}

	addAdditionalFormInformation(focus, req, res, callback) {
		let p = new Promise(async (resolve, reject) => {
			let groups = await wh.services.authService.fetchGroups()
			res.locals.groups = groups
			res.locals.multipleAssociatedAccounts = this.multipleAssociatedAccounts 
			
			if(this.fetchAssociatedAccounts) {
				res.locals.associatedAccounts = await this.fetchAssociatedAccounts()
			}

			resolve(focus)
		})
		
		return addCallbackToPromise(p, callback)
	}
	
	synchronousPostProcessor(obj) {
		let u = new User(obj)
		return u
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