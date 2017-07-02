module.exports = function(application){
	application.get('/', function(req, res){
		res.send('Bem vindo ao concretesolutions-app!\nVersão: 1.0.0');
	});
}