const express = require('express');
const router = express.Router();
const passport = require("passport");

// express middleware que intercepta un request y verifica que no haya usuario logeuado, si no hay pasa, si hay redirecciona
const ensureNotLoggedIn = require('connect-ensure-login').ensureNotLoggedIn;

// nuestro modelo de mongoose
const User = require('../db').User;
const Task = require('../db').Task;

/* GET register page.
* Esta ruta muestra el formulario del registro, no permite que un usuario ya logueado pueda acceder
* */
router.get('/register', ensureNotLoggedIn(), function (req, res, next) {
    res.render('register', {error: req.session.error});
});


/* POST register page.
* Esta ruta procesa el formulario del registro, verifica los parametros del body
* primero busca si ya existe un usuario con el username ingresado
* en caso exista escribe en la session un error
* en caso no exista prosigue con la creación
* */
router.post('/register', function (req, res, next) {

    // obtiene los parametros del body
    const {firstName, lastName, username, password} = req.body;

    // busca con mongoose si existe un usuario con el username
    User.find({username: username}).then(results => {

        // en caso encuentre algo o alguien logeado
        if (results.length > 0) {

            // escribe en la sesion y redirecciona que ya existe un usuario
            req.session.error = "username already taken";
            res.redirect('/auth/register');
        } else {

            // en caso no encuentre, crea un usuario
            const user = new User({firstName, lastName, username});

            // usamos nuestro método setPassword que creamos en el modelo User
            user.setPassword(password);

            // intentamos guardar
            user.save((err) => {
                if (err) {

                    // si hubo error escribimos en la sesion y redireccionamos
                    req.session.error = "algo salio mal. something went wrong";
                    res.redirect('/auth/register');
                } else {

                    // en caso de exito logueamos mediante el login de passport
                    req.login(user, function (err) {
                        if (err) {

                            // en caso no podamos loguear redireccionamos al login
                            res.redirect('/auth/login');
                        }
                        res.redirect('/');
                    });
                }
            });
        }
    }).catch(err => {
        // si hubo error escribimos en la sesion y redireccionamos
        req.session.error = "mal salio something went wrong";
        res.redirect('/auth/register');
    });
});


/* GET login page.
* Esta ruta hace render del formulario del login, no permite que un usuario ya logueado 
pueda acceder
*/
router.get('/login', ensureNotLoggedIn(), function (req, res, next) {
    res.render('login');
});


/* POST login page.
* Esta ruta procesa el formulario del login, hace uso del middleware de passport
* en caso falle redirecciona a failureRedirect
* */
router.post('/login', passport.authenticate('local', {failureRedirect: '/auth/login'}), function (req, res) {
    res.redirect('/');
});


/* POST logout page.
* Esta ruta procesa el logout, desloguea usando req.logout() que passport incluye y luego redirecciona al login
* */
router.post('/logout', function (req, res) {
    req.logout();
    res.redirect('/auth/login');
});


module.exports = router;
