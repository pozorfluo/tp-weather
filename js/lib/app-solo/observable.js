"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withObservable = exports.newObservable = void 0;
var RateLimit;
(function (RateLimit) {
    RateLimit["none"] = "none";
    RateLimit["debounce"] = "debounce";
    RateLimit["throttle"] = "throttle";
})(RateLimit || (RateLimit = {}));
function newObservable(value, rateLimit = RateLimit.throttle) {
    const instance = {
        subscribers: [],
        value: value,
        _pending: 0,
        _timeout: 0,
        notify: function () {
            for (let i = 0, length = instance.subscribers.length; i < length; i++) {
                instance.subscribers[i](instance.value);
            }
            return instance;
        },
        subscribe: function (subscriber, priority) {
            if (priority === undefined) {
                instance.subscribers.push(subscriber);
            }
            else {
                instance.subscribers.splice(priority, 0, subscriber);
            }
            return instance;
        },
        flush: function () {
            instance.subscribers = [];
            return instance;
        },
        get: function () {
            return instance.value;
        },
        set: ((rateLimit) => {
            switch (rateLimit) {
                case RateLimit.none:
                    return function (value) {
                        if (value !== instance.value) {
                            instance.value = value;
                            instance.notify();
                        }
                        return instance;
                    };
                case RateLimit.debounce:
                    return function (value) {
                        console.log('set', instance._pending, instance.value);
                        if (value !== instance.value) {
                            instance.value = value;
                            if (instance._pending) {
                                window.cancelAnimationFrame(instance._pending);
                                console.log('Cancel notify', instance._pending, instance.value);
                            }
                            instance._pending = window.requestAnimationFrame(function () {
                                instance.notify();
                                console.log(' ----> Notify', instance._pending, instance.value);
                                instance._pending = 0;
                            });
                            console.log('Schedule notify', instance._pending, instance.value);
                        }
                        return instance;
                    };
                case RateLimit.throttle:
                    return function (value) {
                        if (value !== instance.value) {
                            instance.value = value;
                            if (!instance._pending) {
                                if (!instance._timeout) {
                                    instance.notify();
                                    console.log('----> LeadNotify', instance._pending, instance.value);
                                    instance._timeout = window.requestAnimationFrame(() => (instance._timeout = 0));
                                }
                                else {
                                    instance._pending = window.requestAnimationFrame(function (now) {
                                        window.cancelAnimationFrame(instance._pending);
                                        instance.notify();
                                        console.log(' ----> Notify', instance._pending, instance.value, now);
                                        instance._pending = 0;
                                    });
                                    console.log('Schedule notify', instance._pending, instance.value);
                                }
                            }
                        }
                        return instance;
                    };
            }
        })(rateLimit),
    };
    return instance;
}
exports.newObservable = newObservable;
function withObservable(name, value) {
    const trait = { observable: {} };
    trait.observable[name] = newObservable(value);
    return trait;
}
exports.withObservable = withObservable;
