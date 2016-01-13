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
      var logmaticOptions = {
        port: 10515,
        ssl_enable: true,
        host: 'api.logmatic.io',
        max_connect_retries: -1,
        meta: { logmaticKey: options.logmatic.key },
        node_name: options.hostname,
		level: 'trace' //log all levels
      };
      /*jshint +W106*/
      if (options.logmatic.context) {
        for (var prop in options.logmatic.context) {
          logmaticOptions.meta[prop] = options.logmatic.context[prop];
        }
      }
      winstonLogger.add(winston.transports.Logstash, logmaticOptions);
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

var timers = {};

var log = {
  levels: function () {
    return levels;
  },
  startTimer: function (timerName) {
    timers[timerName] = new Date();
  },
  stopTimer: function (timerName) {
    var newTime = new Date();
    var oldTime = timers[timerName];
    if (!oldTime) {
      //this.warn('Timer ' + timerName + ' missing startTimer call');
      return;
    }
    delete timers[timerName];
    var timePassed = newTime - oldTime;
    this.trace('Timer "' + timerName + '" took ' + timePassed + ' ms', { timer: timerName, ms: timePassed });
  }
};

var setLogLevel = function (level) {
  log[level] = function () {
    var args = [].slice.call(arguments, 0);
    args.unshift(level);
    return _log.apply(null, args);
  };
};

for (var level in levels) {
  setLogLevel(level);
}

module.exports = function (opt) {
  if (typeof opt !== 'undefined') {
    var lodash = require('lodash');
    options = lodash.merge({}, options, opt);
  }
  return log;
};
