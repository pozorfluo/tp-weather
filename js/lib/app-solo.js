"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newContext = exports.withObservable = exports.newObservable = void 0;
const komrad_1 = require("./komrad");
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
        _ticker: 0,
        _immediate: 0,
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
                        console.log('set', instance._ticker, instance.value);
                        if (value !== instance.value) {
                            instance.value = value;
                            if (instance._ticker) {
                                window.cancelAnimationFrame(instance._ticker);
                                console.log('Cancel notify', instance._ticker, instance.value);
                            }
                            instance._ticker = window.requestAnimationFrame(function () {
                                instance.notify();
                                console.log(' ----> Notify', instance._ticker, instance.value);
                                instance._ticker = 0;
                            });
                            console.log('Schedule notify', instance._ticker, instance.value);
                        }
                        return instance;
                    };
                case RateLimit.throttle:
                    return function (value) {
                        if (value !== instance.value) {
                            instance.value = value;
                            if (!instance._immediate && !instance._ticker) {
                                instance.notify();
                                console.log('----> LeadNotify', instance._ticker, instance.value);
                                instance._immediate = window.requestAnimationFrame(() => (instance._immediate = 0));
                            }
                            else if (!instance._ticker) {
                                instance._ticker = window.requestAnimationFrame(function (now) {
                                    window.cancelAnimationFrame(instance._ticker);
                                    instance.notify();
                                    console.log(' ----> Notify', instance._ticker, instance.value, now);
                                    instance._ticker = 0;
                                });
                                console.log('Schedule notify', instance._ticker, instance.value);
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
function newContext() {
    const context = {
        pins: {},
        subs: [],
        pub: function (name, pin, ...subscribers) {
            context.pins[name] = pin;
            for (let i = 0, length = subscribers.length; i < length; i++) {
                pin.subscribe(subscribers[i]);
            }
            return context;
        },
        remove: function (name) {
            if (context.pins[name] !== undefined) {
                context.pins[name].flush();
                delete context.pins[name];
            }
            return context;
        },
        merge: function (another_context) {
            if (another_context.pins !== undefined) {
                another_context = another_context.pins;
            }
            komrad_1.extend(context.pins, another_context);
            return context;
        },
        musterPubs: function (element) {
            var _a, _b, _c;
            const pub_nodes = [...element.querySelectorAll('[data-pub')];
            const length = pub_nodes.length;
            const subs = Array(length);
            for (let i = 0; i < length; i++) {
                const source = (_a = pub_nodes[i].getAttribute('data-pub')) !== null && _a !== void 0 ? _a : 'error';
                const target = (_b = pub_nodes[i].getAttribute('data-prop')) !== null && _b !== void 0 ? _b : 'textContent';
                const initial_value = pub_nodes[i][target];
                context.pub(source, newObservable(initial_value));
                subs[i] = {
                    source: context.pins[source] !== undefined ? context.pins[source] : source,
                    target: target,
                    type: (_c = pub_nodes[i].getAttribute('data-type')) !== null && _c !== void 0 ? _c : 'string',
                    node: pub_nodes[i],
                };
            }
            Array.prototype.push.apply(context.subs, subs);
            return context;
        },
        musterSubs: function (element) {
            var _a, _b, _c;
            const sub_nodes = [...element.querySelectorAll('[data-sub]')];
            const length = sub_nodes.length;
            const subs = Array(length);
            for (let i = 0; i < length; i++) {
                const source = (_a = sub_nodes[i].getAttribute('data-sub')) !== null && _a !== void 0 ? _a : 'error';
                subs[i] = {
                    source: context.pins[source] !== undefined ? context.pins[source] : source,
                    target: (_b = sub_nodes[i].getAttribute('data-prop')) !== null && _b !== void 0 ? _b : 'textContent',
                    type: (_c = sub_nodes[i].getAttribute('data-type')) !== null && _c !== void 0 ? _c : 'string',
                    node: sub_nodes[i],
                };
            }
            Array.prototype.push.apply(context.subs, subs);
            return context;
        },
        muster: function (element) {
            return context.musterPubs(element).musterSubs(element);
        },
        setSubs: function (subs) {
            context.subs = subs;
            return context;
        },
        activateSubs: function () {
            for (let i = 0, length = context.subs.length; i < length; i++) {
                if (typeof context.subs[i].source !== 'string') {
                    context.subs[i].source.subscribe((value) => {
                        context.subs[i].node[context.subs[i].target] = value;
                    });
                }
            }
            return context;
        },
        refresh: function () {
            for (const pin of Object.values(context.pins)) {
                pin.notify();
            }
            return context;
        },
    };
    return context;
}
exports.newContext = newContext;
