const crypto = require('crypto');

const filog = require('filter-log')
let log = filog('webhandle-users:AuthService')
const User = require('./user')
const Group = require('./group')

const AuthorizationFailed = require('./errors/authorization-failed')
const addCallbackToPromise = require('add-callback-to-promise')

class AuthService {
	constructor(options) {
		options = options || {}
		this.iterations = options.iterations || 156;
		this.salt = options.salt || 'two may keep it if one is dead';
		this.algorithm = options.algorithm || 'sha256'
		this.mongoCollection = options.mongoCollection
		this.mongoUsersCollection = options.mongoUsersCollection
		this.mongoGroupsCollection = options.mongoGroupsCollection
		this.maxFailures = options.maxFailures || 10
	}

	passHash(plainTextPass, name) {
		name = name || ''
		let hash = plainTextPass + name
		for (var i = 0; i < this.iterations; ++i) {
			hash = crypto.createHmac(this.algorithm, this.salt).update(hash).digest('hex')
		}

		return hash
	}

	verify(cypherTextPass, plainTextPass, name) {
		try {
			let calculatedPass = this.passHash(plainTextPass, name)
			return crypto.timingSafeEqual(Buffer.from(cypherTextPass, 'utf-8'), Buffer.from(calculatedPass, 'utf-8'))
		}
		catch (e) {
			log.error(e)
			return false
		}
	}

	async findUser(name, callback) {
		let p = new Promise((resolve, reject) => {
			this.mongoCollection.findOne({ name: name }, (err, found) => {
				if (err) {
					return reject(err)
				}
				if (found) {
					return resolve(new User(found))
				}
				return resolve()
			})
		})

		return addCallbackToPromise(p, callback)
	}

	async fetchGroups() {
		let groups = await this.mongoGroupsCollection.find({}).toArray()

		return groups.map(group => new Group(group))
	}
	async createGroup(name) {
		let result = await this.mongoGroupsCollection.insertOne({ name: name })

		return result
	}

	async save(user, callback) {
		let p = new Promise((resolve, reject) => {
			this.mongoCollection.save(user, (err) => {
				if (err) {
					return reject(err)
				}

				return resolve()
			})
		})

		return addCallbackToPromise(p, callback)
	}

	/*
		Callback signature is (err, user)
	*/
	async login(name, pass, callback /* (err, user) */) {
		let p = new Promise(async (resolve, reject) => {
			try {
				let user = await this.findUser(name)
				if (user) {
					if ((user.enabled === true || user.enabled === 'true') && this.verify(user.hashedPass, pass, name)) {
						if (user.failedAttempts > 0) {
							user.failedAttempts = 0
							await this.save(user)
						}
						return resolve(user)
					}
					else {
						user.failedAttempts++
						if (user.failedAttempts >= this.maxFailures) {
							user.enabled = false
						}
						await this.save(user)
					}
				}
				let e = new Error('Login failed')
				e.user = user
				return reject(e)
			}
			catch (e) {
				return reject(e)
			}

		})

		return addCallbackToPromise(p, callback)
	}

	changePassword(name, oldpass, newpass, callback /* (err, user) */) {
		let p = new Promise(async (resolve, reject) => {
			try {
				let user = await this.findUser(name)
				if (user) {
					if (user.enabled && this.verify(user.hashedPass, oldpass, name)) {
						this.updatePass(user, newpass)
						await this.save(user)
						return resolve(user)
					}
					else {
						return reject(new AuthorizationFailed())
					}
				}
				return reject(new AuthorizationFailed())

			}
			catch (e) {
				return reject(e)
			}
		})
		return addCallbackToPromise(p, callback)
	}

	/*
		Updates hash, does not save
	*/
	updatePass(user /* User */, newPassword) {
		user.hashedPass = this.passHash(newPassword, user.name)
		return user
	}
}

module.exports = AuthService