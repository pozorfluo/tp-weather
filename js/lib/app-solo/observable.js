"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observable = exports.RateLimit = void 0;
var RateLimit;
(function (RateLimit) {
    RateLimit["none"] = "none";
    RateLimit["debounce"] = "debounce";
    RateLimit["throttle"] = "throttle";
})(RateLimit = exports.RateLimit || (exports.RateLimit = {}));
exports.Observable = function (value, rateLimit = RateLimit.throttle) {
    if (!new.target) {
        throw 'Observable() must be called with new !';
    }
    this.subscribers = [];
    this.value = value;
    this._pending = 0;
    this._timeout = 0;
    this.set = ((rateLimit) => {
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
                    console.log('set', this._pending, this.value);
                    if (value !== this.value) {
                        this.value = value;
                        if (this._pending) {
                            window.cancelAnimationFrame(this._pending);
                            console.log('Cancel notify', this._pending, this.value);
                        }
                        this._pending = window.requestAnimationFrame(() => {
                            this.notify();
                            console.log(' ----> Notify', this._pending, this.value);
                            this._pending = 0;
                        });
                        console.log('Schedule notify', this._pending, this.value);
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
                                console.log('----> LeadNotify', this._pending, this.value);
                                this._timeout = window.requestAnimationFrame(() => (this._timeout = 0));
                            }
                            else {
                                this._pending = window.requestAnimationFrame((now) => {
                                    window.cancelAnimationFrame(this._pending);
                                    this.notify();
                                    console.log(' ----> Notify', this._pending, this.value, now);
                                    this._pending = 0;
                                });
                                console.log('Schedule notify', this._pending, this.value);
                            }
                        }
                    }
                    return this;
                };
        }
    })(rateLimit);
    return this;
};
exports.Observable.prototype.notify = function () {
    for (let i = 0, length = this.subscribers.length; i < length; i++) {
        this.subscribers[i](this.value);
    }
    return this;
};
exports.Observable.prototype.subscribe = function (subscriber, priority) {
    if (priority === undefined) {
        this.subscribers.push(subscriber);
    }
    else {
        this.subscribers.splice(priority, 0, subscriber);
    }
    return this;
};
exports.Observable.prototype.flush = function () {
    this.subscribers = [];
    return this;
};
exports.Observable.prototype.get = function () {
    return this.value;
};
exports.Observable.prototype.setUnbound = function (value) {
    if (value !== this.value) {
        this.value = value;
        this.notify();
    }
    return this;
};
exports.Observable.prototype.setDebounced = function (value) {
    console.log('set', this._pending, this.value);
    if (value !== this.value) {
        this.value = value;
        if (this._pending) {
            window.cancelAnimationFrame(this._pending);
            console.log('Cancel notify', this._pending, this.value);
        }
        this._pending = window.requestAnimationFrame(() => {
            this.notify();
            console.log(' ----> Notify', this._pending, this.value);
            this._pending = 0;
        });
        console.log('Schedule notify', this._pending, this.value);
    }
    return this;
};
exports.Observable.prototype.setThrottled = function (value) {
    if (value !== this.value) {
        this.value = value;
        if (!this._pending) {
            if (!this._timeout) {
                this.notify();
                console.log('----> LeadNotify', this._pending, this.value);
                this._timeout = window.requestAnimationFrame(() => (this._timeout = 0));
            }
            else {
                this._pending = window.requestAnimationFrame((now) => {
                    window.cancelAnimationFrame(this._pending);
                    this.notify();
                    console.log(' ----> Notify', this._pending, this.value, now);
                    this._pending = 0;
                });
                console.log('Schedule notify', this._pending, this.value);
            }
        }
    }
    return this;
};
