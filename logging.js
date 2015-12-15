#!/usr/bin/env node

'use strict';

var levels = {
  fatal:  0,
  error:  1,
  warn:   2,
  info:   3,
  debug:  4,
  trace:  5,
};

var options = {
  console: {
    level: levels.trace,
    color: true
  },
  logmatic: {
    key: null,
    enabled: false
  },
  loggly: {
    token: null,
    subdomain: null,
    enabled: false
  },
  hostname: 'localhost'
};

var chalk;
var consoleLog = function (level) {
  var args = [].slice.call(arguments, 0);
  args[0] = '['+level.toUpperCase()+']';

  if (options.console.color) {
    // use chalk to brighten up the console!
    if (typeof chalk === 'undefined') {
      chalk = require('chalk');
    }

    var chalkColor = chalk.white;
    switch (levels[level]) {
      case levels.trace:
        chalkColor = chalk.gray;
        break;
      case levels.debug:
        chalkColor = chalk.blue;
        break;
      case levels.info:
        chalkColor = chalk.green;
        break;
      case levels.warn:
        chalkColor = chalk.yellow;
        break;
      case levels.error:
        chalkColor = chalk.magenta;
        break;
      case levels.fatal:
        chalkColor = chalk.red;
        break;
    }
    args = [ chalkColor.apply(chalk, args) ];
  }

  var logger = console.log;
  if (console.error && levels[level] <= levels.warn) {
    logger = console.error;
  }
  return logger.apply(console, args);
};


var winstonLogger = null;
var winstonLog = function () {
  if (!winstonLogger) {
    var winston = require('winston');

    winstonLogger = new (winston.Logger)({
      levels: levels,
      transports: [
      ]
    });

    if (options.loggly.enabled) {
      require('winston-loggly');
      winstonLogger.add(winston.transports.Loggly, {
        token: options.loggly.token,
        subdomain: options.loggly.subdomain,
        tags: ['Winston-NodeJS', options.hostname],
        json: true
      });
    }
    if (options.logmatic.enabled) {
      require('winston-logstash');
      /*jshint -W106*/
      winstonLogger.add(winston.transports.Logstash, {
        port: 10515,
        ssl_enable: true,
        host: 'api.logmatic.io',
        max_connect_retries: -1,
        meta: { logmaticKey: options.logmatic.key },
        node_name: options.hostname,
      });
      /*jshint +W106*/
    }
    winstonLogger.on('error', function (err) {
      console.error(err);
    });
  }

  var args = [].slice.call(arguments, 0);
  winstonLogger.log.apply(winstonLogger, args);
};

var _log = function (level) {
  // log to console
  if (levels[level] <= options.console.level) {
    consoleLog.apply(null, [].slice.call(arguments, 0));
  }
  if (
      (options.loggly.enabled && options.loggly.token) ||
      (options.logmatic.enabled && options.logmatic.key)
     ) {
      winstonLog.apply(null, [].slice.call(arguments, 0));
  }
};

var log = {
  // TRACE: debug information to have a basic stack trace: begin method X, end method X ...
  trace: function () {
    var args = [].slice.call(arguments, 0);
    args.unshift('trace');
    return _log.apply(null, args);
  },
  // DEBUG: information used for debug
  debug: function () {
    var args = [].slice.call(arguments, 0);
    args.unshift('debug');
    return _log.apply(null, args);
  },
  // INFO: notification of a normal action
  info: function () {
    var args = [].slice.call(arguments, 0);
    args.unshift('info');
    return _log.apply(null, args);
  },
  // WARN: incorrect behaviour but the application can continue
  warn: function () {
    var args = [].slice.call(arguments, 0);
    args.unshift('warn');
    return _log.apply(null, args);
  },
  // ERROR: exceptions/crashes
  error: function () {
    var args = [].slice.call(arguments, 0);
    args.unshift('error');
    return _log.apply(null, args);
  },
  // FATAL: problem that prevents the service from running correctly
  fatal: function () {
    var args = [].slice.call(arguments, 0);
    args.unshift('fatal');
    return _log.apply(null, args);
  },
  levels: function () {
    return levels;
  }
};

module.exports = function (opt) {
  if (typeof opt !== 'undefined') {
    var lodash = require('lodash');
    options = lodash.merge({}, options, opt);
  }
  return log;
};
