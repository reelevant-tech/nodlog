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
    level: levels.trace
  },
  logmatic: {
    level: levels.trace,
    key: null,
    enabled: false
  },
  timers: true       // set to false to disable timer functionality
};

var consoleLog = function (level) {
  var args = [].slice.call(arguments, 0);
  args[0] = '['+level.toUpperCase()+']';

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
      transports: []
    });

    require('winston-logstash');
    var label;
    if (options.logmatic.label) {
      label = options.logmatic.label;
    }

    /*jshint -W106*/
    var logmaticOptions = {
      port: 10515,
      ssl_enable: true,
      host: 'api.logmatic.io',
      max_connect_retries: -1,
      meta: { logmaticKey: options.logmatic.key },
      node_name: label,
	    level: 'trace'
    };
    /*jshint +W106*/
    if (options.logmatic.context) {
      for (var prop in options.logmatic.context) {
        logmaticOptions.meta[prop] = options.logmatic.context[prop];
      }
    }
    winstonLogger.add(winston.transports.Logstash, logmaticOptions);
    winstonLogger.on('error', function (err) {
      console.error(err);
    });
  }

  if (arguments.length > 1) {
    // fix all error 'message' not showing up
    var lastArg = arguments[arguments.length - 1];
    if (typeof lastArg === 'object') {
      for (var key in lastArg) {
        if (lastArg.hasOwnProperty(key)) {
          var value = lastArg[key];
          if (typeof value === 'object') {
            if (typeof value.message !== 'undefined') {
              lastArg[key].msg = lastArg[key].message;
              delete lastArg[key].message;
            }
          }
        }
      }
    }
  }
  var args = [].slice.call(arguments, 0);
  winstonLogger.log.apply(winstonLogger, args);
};

var _log = function (level) {
  // log to console
  if (levels[level] <= options.console.level) {
    consoleLog.apply(null, [].slice.call(arguments, 0));
  }
  if (options.logmatic.enabled && options.logmatic.key && levels[level] <= options.logmatic.level) {
    winstonLog.apply(null, [].slice.call(arguments, 0));
  }
};

var timers = {};

var log = {
  levels: function () {
    return levels;
  },
  startTimer: function (timerName) {
    if (options.timers) {
      timers[timerName] = new Date();
    }
  },
  stopTimer: function (timerName) {
    if (options.timers) {
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
