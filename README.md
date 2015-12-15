NODLOG
===

Node wrapper for logging to:

- console (with optional colors based on log level)
- [loggly](https://www.loggly.com)
- [logmatic](http://www.logmatic.io)

It has several logging levels:

- `trace`: debug information to have a basic stack trace
- `debug`: information used for debug
- `info`: notification of a normal action
- `warn`: incorrect behavior but the application can continue
- `error`: exceptions
- `fatal`: problem that prevents the service from running correctly

It can be used just like `console.log()` with multiple parameters and
objects.

Installation
---

```shell
npm install --save nodlog
```

How to use
---

```javascript
var log = require('nodlog')({
 console: {
   color: true
 },
 logmatic: {
   key: 'API_KEY',
   enabled: true,
   context: {
     app: 'myApp',
     instance: 'dev-1',
     env: 'development'
   }
 },
 loggly: {
   token: 'API_TOKEN',
   subdomain: 'SUBDOMAIN',
   enabled: true
 },
 hostname: 'dev-1'
});

log.info('Informative note');
log.warn('The object', myObject, 'is invalid');
```

The `hostname` option should be filled with the actual server name.
This will be used by loggly/logmatic to enabling filtering.
