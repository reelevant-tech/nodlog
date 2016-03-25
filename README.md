# NODLOG

Node wrapper for logging to:

- console
- [logmatic](http://www.logmatic.io)

It has several logging levels:

- `trace` [5]: debug information to have a basic stack trace
- `debug` [4]: information used for debug
- `info`  [3]: notification of a normal action
- `warn`  [2]: incorrect behavior but the application can continue
- `error` [1]: exceptions
- `fatal` [0]: problem that prevents the service from running correctly

It can be used just like `console.log()` with multiple parameters and objects.

## Installation

```shell
npm install --save nodlog
```

## How to use

```javascript
var log = require('nodlog')({
 console: {
   level: 5,
   timestamp: true
 },
 logmatic: {
   key: 'API_KEY',
   enabled: true,
   context: {
     app: 'myApp',
     instance: 'dev-1',
     env: 'development'
   },
   level: 3,
   label: 'dev-1'
 },
});

log.info('Informative note');
log.warn('The object', myObject, 'is invalid');
```

### Timers

Named timers can be used to check how long a function call takes:

```javascript
log.startTimer('test');
setTimeout(function () {
  log.stopTimer('test');
}, 300);
```

Will log as _trace_ if `options.timers` is _true_ :

`Timer "test" took 301 ms, { timer: "test", ms: 301 }`
