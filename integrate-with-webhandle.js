const path = require('path')

module.exports = (options) => {
	let {
		app, 
		mongoDb, 
		pretemplate = 'app_pre', 
		posttemplate = 'app_post',
		onLogin = (req, res, next) => {
			res.redirect('/menu')
		}
	} = options
	
	
	const webhandleUserIntegrator = require('./index.js')
	let integrator = webhandleUserIntegrator(mongoDb, {})
	app.routers.preStatic.use(integrator.createUserInfoLoader())
	app.services.authService = integrator.authService
	app.routers.primary.use(require('./handles/create-public-handles')(integrator.authService, {
		onLogin: onLogin
	}))
	
	
	let usersRouter = require('./handles/create-admin-handles')(integrator.authService, {
		usersCollection: integrator.authService.mongoUsersCollection,
		groupsCollection: integrator.authService.mongoGroupsCollection,
		locals: {
			pretemplate: pretemplate,
			posttemplate: posttemplate
		}
		, multipleAssociatedAccounts: options.multipleAssociatedAccounts  
	})

	let securedRouter = require('./utils/allow-group')(
		['administrators'],
		usersRouter
	)
	app.routers.primary.use('/admin', securedRouter)

	app.addTemplateDir(path.join(app.projectRoot, 'node_modules/webhandle-users/templates'))


	return {
		createUserIfNoneExists: function(username, password, groups /* array */) {
			require('./utils/create-user-if-none-exists')(integrator.authService, username, password, groups)
			return this
		},
		integrator: integrator,
		authService: integrator.authService

	}
}
