const crypto = require('crypto');

const filog = require('filter-log')
let log = filog('webhandle-users:AuthService')
const User = require('./user')
const Group = require('./group')

const AuthorizationFailed = require('./errors/authorization-failed')


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
		catch(e) {
			log.error(e)
			return false
		}
	}
	
	findUser(name, callback) {
		this.mongoCollection.findOne({ name: name }, (err, found) => {
			if(err) {
				return callback(err)
			}
			if(found) {
				return callback(null, new User(found))
			}
			return callback(null, null)
		})
		
	}
	
	async fetchGroups() {
		let groups = await this.mongoGroupsCollection.find({}).toArray()
		
		return groups.map(group => new Group(group))
	}
	async createGroup(name) {
		let result = await this.mongoGroupsCollection.insertOne({name: name})
		
		return result
	}
	
	save(user, callback) {
		this.mongoCollection.save(user, callback)
	}
	
	/*
		Callback signature is (err, user)
	*/
	login(name, pass, callback /* (err, user) */) {
		this.findUser(name, (err, user) => {
			if(err) {
				return callback(err)
			}
			if(user) {
				if(user.enabled && this.verify(user.hashedPass, pass, name)) {
					if(user.failedAttempts > 0) {
						user.failedAttempts = 0
						this.save(user)
					}
					return callback(null, user)
				}
				else {
					user.failedAttempts++
					if(user.failedAttempts >= this.maxFailures) {
						user.enabled = false
					}
					this.save(user)
				}
			}
			return callback(new Error('Login failed'))
		})
	}

	changePassword(name, oldpass, newpass, callback /* (err, user) */) {
		this.findUser(name, (err, user) => {
			if(err) {
				return callback(err)
			}
			if(user) {
				if(user.enabled && this.verify(user.hashedPass, oldpass, name)) {
					this.updatePass(user, newpass)
					this.save(user)
					return callback(null, user)
				}
				else {
					return callback(new AuthorizationFailed())
				}
			}
			return callback(new AuthorizationFailed())
		})
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