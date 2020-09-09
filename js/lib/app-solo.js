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
function newObservable(value, rateLimit = RateLimit.debounce) {
    const observable = {
        subscribers: [],
        value: value,
        _ticker: 0,
        notify: function () {
            for (let i = 0, length = observable.subscribers.length; i < length; i++) {
                observable.subscribers[i](observable.value);
            }
            return observable;
        },
        subscribe: function (subscriber, priority) {
            if (priority === undefined) {
                observable.subscribers.push(subscriber);
            }
            else {
                observable.subscribers.splice(priority, 0, subscriber);
            }
            return observable;
        },
        flush: function () {
            observable.subscribers = [];
            return observable;
        },
        get: function () {
            return observable.value;
        },
        set: ((rateLimit) => {
            switch (rateLimit) {
                case RateLimit.none:
                    return function (value) {
                        if (value !== observable.value) {
                            observable.value = value;
                            observable.notify();
                        }
                        return observable;
                    };
                case RateLimit.debounce:
                    return function (value) {
                        console.log('set', observable._ticker, observable.value);
                        if (value !== observable.value) {
                            observable.value = value;
                            if (observable._ticker) {
                                window.cancelAnimationFrame(observable._ticker);
                                console.log('Cancel notify', observable._ticker, observable.value);
                            }
                            observable._ticker = window.requestAnimationFrame(function () {
                                observable.notify();
                                console.log('Notify', observable._ticker, observable.value);
                                observable._ticker = 0;
                            });
                            console.log('Schedule notify', observable._ticker, observable.value);
                        }
                        return observable;
                    };
                case RateLimit.throttle:
                    return function (value) {
                        if (value !== observable.value) {
                            observable.value = value;
                            observable.notify();
                        }
                        return observable;
                    };
            }
        })(rateLimit),
    };
    return observable;
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
