var AuthService = require('../auth-service')
require('mocha')
var expect = require('chai').expect
var assert = require('chai').assert

const User = require('../user')
const MongoClient = require('mongodb').MongoClient;

const filog = require('filter-log')
filog.defineProcessor('testing-logger', {}, process.stdout)
let log = filog('crud-tests')
let db = {}

function connect(callback) {
	MongoClient.connect('mongodb://localhost:27017/', function(err, client) {
		if (err) {
			log.error("Could not connect to mongo db")
			log.error(err)
		} else {
			log.info("Connected successfully to mongodb server")
		}
		db.client = client
		db.db = client.db('authtest')

		db.collection = db.db.collection('users')
		db.collection.deleteMany({})

		log.info("Created connection to mongo database connection")
		
		callback(db)
	})
}

describe("All crud tests", function() {
	it("crud tests", function(done) {
		connect((db) => {
			let authService = new AuthService({
				mongoCollection: db.collection
			})

			let user = new User({
				name: 'one',
				email: 'one@service.com'
			})

			authService.save(user, (err, result) => {
				authService.findUser('one', (err, user) => {

					if (user) {
						if (user.email == 'one@service.com') {
							db.client.close()
							done()
						} else {
							db.client.close()
							done(new Error("User's email did not match."))
						}
					} else {
						db.client.close()
						done(new Error('Could not find user.'))
					}
				})
			})
		})
	})

	it("password tests", function(done) {
		connect((db) => {
			let authService = new AuthService({
				mongoCollection: db.collection
			})

			let user = new User({
				name: 'one',
				email: 'one@service.com'
			})
			authService.updatePass(user, 'hellothere')

			authService.save(user, (err, result) => {
				authService.login('one', 'hellothere', (err, user) => {

					if (user) {
						authService.login('one', 'hellothere2', (err, user) => {
							if(user) {
								db.client.close()
								return done(new Error("Login with bad password allowed."))
							}
							if(!err) {
								db.client.close()
								return done(new Error("No login error was created even though login failed."))
							}
							db.client.close()
							return done()
						})
						
					} else {
						db.client.close()
						return done(new Error('Login failed.'))
					}
				})
			})
		})
	})

})