const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

require('dotenv').config()

global.admin_url = process.env.ADMIN_URL;
const mongodb_options = {
  user: process.env.MONGO_USERNAME,
  pass: process.env.MONGO_PASS,
  authSource: process.env.MONGO_AUTH,
  useNewUrlParser: true 
}

mongoose.connect(process.env.MONGO_URI, mongodb_options).then(
  () => {
    global.urljoin = require('url-join');
    const flash = require('connect-flash');
    const session = require('express-session');

    const indexRouter = require('./routes/index');

    const app = express();

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());

    app.use(session({
      cookie: {
        maxAge: 60000000
      },
      resave: true,
      saveUninitialized: true,
      secret: process.env.SITE_TITLE
    }));
    app.use(flash());

    // initializations
    app.use(function (req, res, next) {
      res.locals.admin_url = process.env.ADMIN_URL;
      res.locals.error_flash = req.flash('error')[0];
      res.locals.success_flash = req.flash('success')[0];
      res.locals.site_title = process.env.SITE_TITLE;
      next();
    });

    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/', indexRouter);

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

    var debug = require('debug')('voting:server');
    var http = require('http');

    /**
     * Get port from environment and store in Express.
     */

    var port = normalizePort(process.env.APP_PORT || '3000');
    app.set('port', port);

    /**
     * Create HTTP server.
     */

    var server = http.createServer(app);

    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    /**
     * Normalize a port into a number, string, or false.
     */

    function normalizePort(val) {
      var port = parseInt(val, 10);

      if (isNaN(port)) {
        // named pipe
        return val;
      }

      if (port >= 0) {
        // port number
        return port;
      }

      return false;
    }

    /**
     * Event listener for HTTP server "error" event.
     */

    function onError(error) {
      if (error.syscall !== 'listen') {
        throw error;
      }

      var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

      // handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(bind + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    }

    /**
     * Event listener for HTTP server "listening" event.
     */

    function onListening() {
      var addr = server.address();
      var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
      debug('Listening on ' + bind);
    }
  },
  err => {
    console.log("Database is not connected", err.message)
  }
);


