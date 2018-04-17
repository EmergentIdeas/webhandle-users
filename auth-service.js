const crypto = require('crypto');

const filog = require('filter-log')
let log = filog('webhandle-users:AuthService')
const User = require('./user')


class AuthService {
	constructor(options) {
		options = options || {}
		this.iterations = options.iterations || 1;
		this.salt = options.salt || 'two may keep it if one is dead';
		this.algorithm = options.algorithm || 'sha256'
		this.mongoCollection = options.mongoCollection
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
	
	save(user, callback) {
		this.mongoCollection.save(user, callback)
	}
	
	/*
		
	*/
	login(name, pass, callback /* (err, user) */) {
		this.findUser(name, (err, user) => {
			if(err) {
				return callback(err)
			}
			if(user) {
				if(this.verify(user.hashedPass, pass, name)) {
					return callback(null, user)
				}
				else {
					user.failedAttemps++
					this.save(user)
				}
			}
			return callback(new Error('Login failed'))
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