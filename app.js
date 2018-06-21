const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const db = require('./db');
const app = express();
const passport = require("passport");
const Strategy = require('passport-local').Strategy;

// inicializamos la base de datos
db.initialize();

// le decimos a passport que use la estrategia local
passport.use(new Strategy(
    function (username, password, done) {
        // passport busca el usuario con el username
        db.User.findOne({username: username}, function (err, user) {
            // si es que falla
            if (err) {
                return done(err);
            }
            // si es que no encuentra usuario
            if (!user) {
                return done(null, false);
            }
            // si es que no hace check con el método password que definimos en en nuestro modelo
            if (!user.checkPassword(password)) {
                return done(null, false);
            }
            // si las anteriores no entró significa que lo encontró
            return done(null, user);
        });
    }
));

// método de passport para serializar al usuario por "id"
passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

// método de passport para deserializar al ususario por "id"
passport.deserializeUser(function (id, cb) {
    db.User.findById(id, function (err, user) {
        if (err) {
            return cb(err);
        }
        cb(null, user);
    });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: null}
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/auth', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
