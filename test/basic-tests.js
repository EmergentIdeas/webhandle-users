var AuthService = require('../auth-service')
require('mocha')
var expect = require('chai').expect
var assert = require('chai').assert

let authService = new AuthService()

const filog = require('filter-log')
filog.defineProcessor('testing-logger', {}, process.stdout)

describe("basic tests for functionality", function() {
	it("simple creation", function() {
		let authService = new AuthService({
			salt: 'mmm'
		})
		let hash = authService.passHash('hellothere', 'dan')
		assert(authService.verify(hash, 'hellothere', 'dan'))
		assert(!authService.verify(hash, 'hellothere2', 'dan'))
		
		authService = new AuthService({
			salt: 'mmm',
			iterations: 100
		})
		
		assert(!authService.verify(hash, 'hellothere', 'dan'), 'iteration count')
		hash = authService.passHash('hellothere', 'dan')
		assert(authService.verify(hash, 'hellothere', 'dan'))
		assert(!authService.verify(hash, 'hellothere'), 'require user name salt')
		
		authService = new AuthService({
			iterations: 100
		})
		assert(!authService.verify(hash, 'hellothere', 'dan'), 'default salt')
		hash = authService.passHash('hellothere', 'dan')
		assert(authService.verify(hash, 'hellothere', 'dan'), 'verify default salt')
		authService = new AuthService({
			iterations: 100,
			algorithm: 'sha512'
		})
		assert(!authService.verify(hash, 'hellothere', 'dan'), 'algorithm change')
		
		
	})
	
})