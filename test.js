#!/usr/bin/env node

'use strict';

var options = {
  console: {
    level: 5,
    color: false
  },
  hostname: 'localhost'
};

if (process.env.LOGMATIC_KEY) {

  console.log('Logmatic activated');

  options.logmatic = {
    key: process.env.LOGMATIC_KEY,
    enabled: true,
    context: {
      app: 'nodlog',
      instance: 'test',
      env: 'dev'
    },
    level: 4
  };
}

var log = require('./logging')(options);

log.trace('This is a trace msg');
log.debug('This is a debug msg', { testVal: 1 });
log.startTimer('timer1');
log.startTimer('timer2');
setTimeout(function () {
  log.stopTimer('timer1');
}, 200);
setTimeout(function () {
  log.stopTimer('timer2');
}, 300);
