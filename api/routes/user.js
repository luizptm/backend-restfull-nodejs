/*Tratamento de rotas da aplicação, no caso são apenas 3, uma para cada funcionalidade solicitada*/

module.exports = function (application) {    
	
	//rota de cadastro
    application.post('/api/user/signup', function (req, res) {
		application.api.controllers.user.SignUp(application, req, res);
	});

	//rota de autenticação
	application.post('/api/user/signin', function (req, res) {
		application.api.controllers.user.SignIn(application, req, res);
	});	

	//rota de busca do usuário
	application.get('/api/user/finduser', function (req, res) {
		application.api.controllers.user.FindUser(application, req, res);
	});	

}