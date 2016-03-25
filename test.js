#!/usr/bin/env node

'use strict';

var options = {
  console: {
    level: 5,
    timestamp: true
  }
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
    label: 'test',
    level: 4
  };
} else {
  console.log('Logmatic not activated, set the LOGMATIC_KEY env');
}

var log = require('./logging')(options);

log.trace('This is a trace msg');
log.debug('This is a debug msg', { testVal: 1 });
log.debug('This is an error msg', {
    error: { message: 'bonjour', code: 400}
  }, {
    err: { message: 'ahah'}
  }, {
    other: { message: 'test' }
  });
log.startTimer('timer1');
log.startTimer('timer2');
setTimeout(function () {
  log.stopTimer('timer1');
}, 200);
setTimeout(function () {
  log.stopTimer('timer2');
}, 300);
