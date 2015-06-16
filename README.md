# koa-brute

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
