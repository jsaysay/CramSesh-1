var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');

// Initiate Application
var app = express();

// Database Connection
mongoose.connect('mongodb://localhost/CramSesh');
var db = mongoose.connection;

/*
  Starting MongoDB in our NodeJS VMBOX
  $  mkdir -p $HOME/mongodb/data
  $  $HOME/mongodb/bin/mongod --dbpath=$HOME/mongodb/data
*/

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// EJS View Engine
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname + '/client')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport Initialize
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Connecting Routes
require('./app/routes.js')(app, passport, LocalStrategy);

// Global Variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Creating Port and Server
var port = process.env.PORT || 3000;
var server = require("http").createServer(app);

server.listen(port, function() {
  console.log('Server listening at port %d', port);
});
