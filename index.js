var debug = require('debug')('koa-brute');
var Promise = require('bluebird');
var crypto = require('crypto');
var _ = require('lodash');

module.exports = KoaBrute;

function KoaBrute(store, options) {
    KoaBrute.instanceCount++;
    this.name = "brute" + KoaBrute.instanceCount;
    this.options = _.extend({}, KoaBrute.prototype.defaults, options);
    if (this.options.minWait < 1) this.options.minWait = 1;
    this.store = Promise.promisifyAll(store);
    this.delays = [this.options.minWait];
    while (this.delays[this.delays.length - 1] < this.options.maxWait) {
        this.delays.push(this.delays[this.delays.length - 1] + (this.delays.length > 1 ? this.delays[this.delays.length - 2] : 0));
    }
    this.delays[this.delays.length - 1] = this.options.maxWait;
    if (this.options.lifetime === undefined) {
        this.options.lifetime = (this.options.maxWait / 1000) * (this.delays.length + this.options.freeRetries);
        this.options.lifetime = Math.ceil(this.options.lifetime);
    }
    var self = this;

    return applyBrute;

    function* applyBrute(next) {
        var key = self._getKey([this.request.ip, self.name, key]);

        // attach a "reset" function to this.state.brute.reset
        this.state.brute = {
            reset: function(callback) {
                self.store.reset(key, callback);
            }
        };

        var value = yield self.store.getAsync(key);

        var count = 0,
            delay = 0,
            lastValidRequestTime = self.now(),
            firstRequestTime = lastValidRequestTime;
        if (value) {
            count = value.count;
            lastValidRequestTime = value.lastRequest.getTime();
            firstRequestTime = value.firstRequest.getTime();

            var delayIndex = value.count - self.options.freeRetries - 1;
            if (delayIndex >= 0) {
                if (delayIndex < self.delays.length) {
                    delay = self.delays[delayIndex];
                } else {
                    delay = self.options.maxWait;
                }
            }
        }
        var nextValidRequestTime = lastValidRequestTime + delay,
            remainingLifetime = self.options.lifetime || 0;

        if (!self.options.refreshTimeoutOnRequest && remainingLifetime > 0) {
            remainingLifetime = remainingLifetime - Math.floor((self.now() - firstRequestTime) / 1000);
            if (remainingLifetime < 1) {
                // it should be expired alredy, treat this as a new request and reset everything
                count = 0;
                delay = 0;
                nextValidRequestTime = firstRequestTime = lastValidRequestTime = self.now();
                remainingLifetime = self.options.lifetime || 0;
            }
        }

        if (nextValidRequestTime <= self.now()) {
            yield self.store.setAsync(key, {
                count: count + 1,
                lastRequest: new Date(self.now()),
                firstRequest: new Date(firstRequestTime)
            }, remainingLifetime)
            yield next;
        } else {
            var secondUntilNextRequest = Math.ceil((new Date(nextValidRequestTime) - Date.now()) / 1000);
            this.set('Retry-After', secondUntilNextRequest);
            this.response.status = 429;
            this.response.body = {
                success: false,
                message: 'Too many requests',
                nextValidRequestTime: new Date(nextValidRequestTime),
                retryAfter: secondUntilNextRequest
            };
        }
    }
}

KoaBrute.prototype._getKey = function(arr) {
    var key = '';
    arr.forEach(function(part) {
        if (part) {
            key += crypto.createHash('sha256').update(part).digest('base64');
        }
    });
    return crypto.createHash('sha256').update(key).digest('base64');
};
KoaBrute.prototype.reset = function(ip, key, callback) {
    var key = this._getKey([ip, this.name, key]);
    this.store.reset(key, callback);
};
KoaBrute.prototype.now = Date.now;
KoaBrute.prototype.defaults = {
    freeRetries: 2,
    refreshTimeoutOnRequest: true,
    minWait: 500,
    maxWait: 1000 * 60 * 15, // 15 minutes
};
KoaBrute.prototype.instanceCount = 0;
