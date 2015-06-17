# koa-brute

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![Node.js Version][node-image]][node-url]
[![Build Status][travis-image]][travis-url]
[![Dependency Status][dependencies-image]][dependencies-url]
[![Coverage Status][coveralls-image]][coveralls-url]

[![NPM][npm-image]][npm-url]

Koa middleware based on [express-brute](https://www.npmjs.com/package/express-brute), that is compatible with express-brute stores.

Example:

```
var Brute = require('koa-brute');
var MemoryStore = require('express-brute/lib/MemoryStore');
var store = new MemoryStore();
var brute = new Brute(store, {
	freeRetries: 2
});

app.use(brute)
```


[npm-version-image]: https://img.shields.io/npm/v/koa-brute.svg
[npm-downloads-image]: https://img.shields.io/npm/dm/koa-brute.svg
[npm-image]: https://nodei.co/npm/koa-brute.png?downloads=true&downloadRank=true&stars=true
[npm-url]: https://npmjs.org/package/koa-brute
[travis-image]: https://img.shields.io/travis/llambda/koa-brute/master.svg
[travis-url]: https://travis-ci.org/llambda/koa-brute
[dependencies-image]: https://david-dm.org/llambda/koa-brute.svg?style=flat
[dependencies-url]: https://david-dm.org/llambda/koa-brute
[coveralls-image]: https://img.shields.io/coveralls/llambda/koa-brute/master.svg
[coveralls-url]: https://coveralls.io/r/llambda/koa-brute?branch=master
[node-image]: https://img.shields.io/node/v/koa-brute.svg
[node-url]: http://nodejs.org/download/
[gitter-join-chat-image]: https://badges.gitter.im/Join%20Chat.svg
[gitter-channel-url]: https://gitter.im/llambda/koa-brute
[express-session-url]: https://github.com/expressjs/session
[io-url]: https://iojs.org
