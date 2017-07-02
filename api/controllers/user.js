var uuidv1 = require('uuid/v1');
var crypto = require('crypto');
var  moment = require('moment');
var jwt = require('jwt-simple');

//Segredo do token
var segredo = 'Concrete.Solutions.Bh.2017';

//Regra de negócio de cadastro de usuário
module.exports.SignUp = function (application, req, res) {
    
    var userDAO = new application.api.models.UserDAO();

    //busca informação passada pelo json na requisição
    var user = req.body;    

    //Validação se todos os campos foram informados
    req.assert('Name', 'Nome é obrigatório!').notEmpty();    
    req.assert('Email', 'Email é obrigatório!').notEmpty();
    req.assert('Email', 'Email não está no formato correto!').isEmail();
    req.assert('Password', 'Senha é obrigatório!').notEmpty();
    req.assert('Phones', 'Telefone é obrigatório!').notEmpty();
   
    var errors = req.validationErrors();

    //Caso algum campo do json contenha erro, retorna mensagem de erro ao usuário
    if (errors) {
        res.json({ Status: 'Error', Message: 'Erro na validação de campos do usuário!' , Errors: errors });
        return;
    }    

    //Criptogradia para a senha do usuário
    user.Password = crypto.createHash('MD5').update(user.Password).digest('hex');

    var date = new Date();

    //Campos de controle da aplicação
    user.CreatedDate = date;
    user.UpdatedDate = date;
    user.LastLogin = date;   
    user.Id = uuidv1();

    var expires = moment().add(30,'minutes').valueOf();

    //Geração do Token
    var token = jwt.encode({
      iss: user.id,
      exp: expires
    }, segredo);
    
    //Criptogradia para o token do usuário
    user.Token = crypto.createHash('MD5').update(token).digest('hex');       

    //repassa o objeto para ser persistido em banco de dados
    userDAO.InsertUser(user, req, res);
};

//Regra de negócio de autenticação de usuário
module.exports.SignIn = function (application, req, res) {
        
    var userDAO = new application.api.models.UserDAO();

    //busca informação passada pelo json na requisição
    var user = req.body;

    //Analisa se a requisição possui email
    if (!user.Email) {
        res.status(500).json({ Status: 'Error', Message: 'Email deve ser informados', Error : 'Email devem ser informados' });
        return;
    }

    //Analisa se a requisição possui senha
    if (!user.Password) {
        res.status(500).json({ Status: 'Error', Message: 'Password deve ser informados', Error: 'Password deve ser informados' });
        return;
    }

    //Criptografa a senha informada pelo usuário
    user.Password = crypto.createHash('MD5').update(user.Password).digest('hex');

    //repassa dados do usuário para ser consultado no banco de dados
    userDAO.SignIn(user, req, res); 
};

module.exports.FindUser = function(application, req, res){
        
    var userDAO = new application.api.models.UserDAO();

    //Verifica se possui a propriedade authorization no cabeçalho da requisição
    if(!req.headers.authorization){
        res.status(500).json({"mensagem": "Não autorizado"});
    }

    console.log(req.query);

    //preenche variáveis para que a busca do usuário seja possível
    var token = req.headers.authorization;
    var id = req.query.id;

    var aux_length = ('Bearer ').length;
    
    //retira o prefixo do token
    token = token.substring(aux_length, token.length); 

    //passa informações para o banco de dados para ser verificado
    userDAO.FindUser(id, token, req, res); 

};