var uri = 'mongodb://concreteuser:concreteuser2017@ds127190.mlab.com:27190/concretesolutionsdb';

/*Importar Biblioteca do MongoDB */
var mongodb = require('mongodb');

function UserDAO() {
}

UserDAO.prototype.InsertUser = function (user, req, res) {
    mongodb.MongoClient.connect(uri, function (err, db) {
        if (err) {
            res.status(500).json({ "mensagem": "mensagem de erro" });
            return;
        }

        var userC = db.collection('user');


        userC.find({ Email: user.Email }).toArray(function (err, result) {
            if (err) {
                res.status(500).json({ "mensagem": "mensagem de erro" });
                db.close();
                return;
            }
            //Verifica se ja existe registro com o email informado
            if (result.length > 0) {
                db.close();
                res.status(401).json({ "mensagem": "E-mail já existente" });
            }
            //Insere usuário no banco de dados
            else {
                userC.insert(user);
                db.close();
                res.status(200).json(user);
            }
        });

    });
};

UserDAO.prototype.SignIn = function (user, req, res) {
    mongodb.MongoClient.connect(uri, function (err, db) {

        var userC = db.collection('user');

        userC.find({ Email: user.Email }).toArray(function (err, result) {

            if (err) {
                db.close();
                res.status(500).json({ "mensagem": "mensagem de erro" });
            }

            if (result.length > 0) {
                var userDb = result[0];

                if (userDb.Password === user.Password) {

                    userDb.LastLogin = new Date();

                    //Atualiza data do ultimo login
                    userC.update(
                        { Id: userDb.Id },
                        { LastLogin: userDb.LastLogin });

                    db.close();
                    res.status(200).json(userDb);
                }
                else {
                    db.close();
                    res.status(401).json({ "mensagem": "Usuário e/ou senha inválidos" });
                }
            }
            else {
                db.close();
                res.status(401).json({ "mensagem": "Usuário e/ou senha inválidos" });
            }

        });
        db.close();
    });
}

UserDAO.prototype.FindUser = function (id, token, req, res) {
    mongodb.MongoClient.connect(uri, function (err, db) {

        var userC = db.collection('user');
        console.log(id);
        userC.find({ Id: id }).toArray(function (err, result) {

            if (err) {
                db.close();
                res.status(500).json({ "mensagem": "mensagem de erro" });
            }
            console.log(result);
            if (result.length > 0) {
                var userDb = result[0];

                if (userDb.Token != token) {
                    db.close();
                    res.status(401).json({ "mensagem": "Não autorizado" });
                } else {
                    var dateLL = userDb.LastLogin;
                    var now = new Date();
                
                    //Diferença de datas em segundos
                    var datediff = (now.getTime() - dateLL.getTime()) / 1000;

                    //Diferença de datas em segundos
                    datediff = datediff / 60;

                    if (datediff < 30) {
                        db.close();
                        res.status(200).json(userDb);
                    } else {
                        db.close();
                        res.status(401).json({ "mensagem": "Sessão inválida" });
                    }
                }
            }
            else {
                db.close();
                res.status(401).json({ "mensagem": "Usuário inexistente para este ID!" });
            }

        });

        db.close();
    });
}

module.exports = function () {
    return UserDAO;
}
