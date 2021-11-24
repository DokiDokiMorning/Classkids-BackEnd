var mysql = require('mysql');
var express = require('express');
var session = require('cookie-session');
var bodyParser = require('body-parser');
var path = require('path');

const crypto = require('crypto')
let salt = 'f844b09ff50c'

var connection = mysql.createPool({
  connectionLimit : 10,
  host     : 'localhost',
  user     : 'LocalUser',
  password : 'x$!es4xQpiQGUCQ',
  database : 'classkids'
});
connection.getConnection(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }

  console.log('Connected to the MySQL server.');
});
var app = express();
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
var usertype;
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.post('/reg', function(request, response) {
  let hash = crypto.pbkdf2Sync(request.body.contrasenia, salt,  
        1000, 64, `sha512`).toString(`hex`);
  var users={
        "idAlumno": '1',
        "Alumno_nombre":request.body.nombre_menor + request.body.apellido_menor,
        "Apoderado_nombre":request.body.nombre_mayor + request.body.apellido_mayor,
        "contrasenia":hash,
        "correo":request.body.correo
      }
      connection.query('INSERT INTO alumno SET ?',users, function (error, results, fields) {
        if (error) {
          response.send('El correo ya ha sido registrado u ocurrió un error interno.')
        } else {
          response.redirect('/');
          }
      });
});
app.get('/logout', function(request, response, next) {
  if (request.session) {
    // delete session object
    /*request.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return response.redirect('/');
      }
    });*/
    request.session.loggedin = false;
    response.redirect('/');
  }
});
app.post('/auth', function(request, response) {
  var correo = request.body.nombreUsuario;
  var password = crypto.pbkdf2Sync(request.body.clave, salt,  
          1000, 64, `sha512`).toString(`hex`);
  if (correo && password) {
    connection.query('SELECT * FROM alumno WHERE correo = ? AND contrasenia = ?', [correo, password], function(error, results, fields) {
      if (results.length > 0) {
        request.session.loggedin = true;
        request.session.correo = correo;
        response.redirect('/dashboard');
      } else {
        response.send('Incorrect Username and/or Password!');
      }     
     /* response.end();*/
    });
  } else {
    response.send('Please enter Username and Password!');
    /*response.end();*/
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`Backend Inicializado en puerto ${PORT}`));