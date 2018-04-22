Basic code to authenticate user profiles and limit access to URLs.

# Authentication Service

The most basic component is the AuthService which saves and verifies users. It takes
a set of options and mongo collection. Use like:

```
	const AuthService = require('webhandle-user/auth-service')
	const createUserIfNoneExists = require('webhandle-user/util/create-user-if-none-exists')
	
	let authService = new AuthService({
		iterations: 100,
		salt: 'this is unique to the application',
		algorithm: 'sha256',
		mongoCollection: my_mongo_collection_object
	})
	
	createUserIfNoneExists(authService, name, pass, ["group1", "group1"], callback)
	
	....
	
	authService.login(name, pass, (err, user) => {
		// failed login will result in an error being passed
	})
	
```

# Integration 

There's also a set of code which works with to set user tokens in sessions. 
The easiest way to hook up all these pieces is (assuming use of webhandle):

```
const webhandleUserIntegrator = require('webhandle-users')
let integrator = webhandleUserIntegrator(mongo_db, {})
webhandle.routers.preStatic.use(integrator.createUserInfoLoader())
webhandle.services.authService = integrator.authService
```

This adds a couple methods to the req and res objects to work with users.

To create a user session:
```
res.createUserSession('alincoln')
```

To log them out:
```
res.removeUserSession()
```

To access the user information:
```
req.user
```

These sessions are not stored in memory so can be used across a cluster.

# Login 

There's also some basic code for handling login and logout. The file creates a 
router which has url handlers for `/login` and `/logout`.

```
app.use(require('webhandle-users/handles/create-public-handles')(integrator.authService))

```

# Authenticating by Group

Allow access to `some_router` to any user who is a member of the group `administrators` or
a member of the group `editors`.

```
let securedRouter = require('webhandle-users/utils/allow-group')(['administrators', 'editors'], some_router)
app.use(securedRouter)

```