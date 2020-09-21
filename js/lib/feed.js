"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feed = exports.RateLimit = void 0;
var RateLimit;
(function (RateLimit) {
    RateLimit["none"] = "none";
    RateLimit["debounce"] = "debounce";
    RateLimit["throttle"] = "throttle";
})(RateLimit = exports.RateLimit || (exports.RateLimit = {}));
exports.Feed = function (value, rateLimit = RateLimit.throttle) {
    if (!new.target) {
        throw 'Feed() must be called with new !';
    }
    this.subscribers = [];
    this.value = value;
    this._pending = 0;
    this._timeout = 0;
    this.push = ((rateLimit) => {
        switch (rateLimit) {
            case RateLimit.none:
                return (value) => {
                    if (value !== this.value) {
                        this.value = value;
                        this.notify();
                    }
                    return this;
                };
            case RateLimit.debounce:
                return (value) => {
                    if (value !== this.value) {
                        this.value = value;
                        if (this._pending) {
                            window.cancelAnimationFrame(this._pending);
                        }
                        this._pending = window.requestAnimationFrame(() => {
                            this.notify();
                            this._pending = 0;
                        });
                    }
                    return this;
                };
            case RateLimit.throttle:
                return (value) => {
                    if (value !== this.value) {
                        this.value = value;
                        if (!this._pending) {
                            if (!this._timeout) {
                                this.notify();
                                this._timeout = window.requestAnimationFrame(() => (this._timeout = 0));
                            }
                            else {
                                this._pending = window.requestAnimationFrame((now) => {
                                    window.cancelAnimationFrame(this._pending);
                                    this.notify();
                                    this._pending = 0;
                                });
                            }
                        }
                    }
                    return this;
                };
        }
    })(rateLimit);
    return this;
};
exports.Feed.prototype.notify = function () {
    for (let i = 0, length = this.subscribers.length; i < length; i++) {
        this.subscribers[i](this.value);
    }
    return this;
};
exports.Feed.prototype.subscribe = function (subscriber, priority) {
    if (priority === undefined) {
        this.subscribers.push(subscriber);
    }
    else {
        this.subscribers.splice(priority, 0, subscriber);
    }
    return this;
};
exports.Feed.prototype.drop = function (subscriber) {
    this.subscribers = this.subscribers.filter((s) => s !== subscriber);
    return this;
};
exports.Feed.prototype.dropAll = function () {
    this.subscribers = [];
    return this;
};
exports.Feed.prototype.get = function () {
    return this.value;
};
