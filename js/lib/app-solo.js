"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newContext = exports.withObservable = exports.newObservable = void 0;
const komrad_1 = require("./komrad");
function newObservable(value) {
    const observable = {
        subscribers: [],
        value: value,
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
        set: function (value) {
            if (value !== observable.value) {
                observable.value = value;
                observable.notify();
            }
            return observable;
        },
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
        _mergeWithSubs: function (subs) {
            const length_old = context.subs.length;
            const length_added = subs.length;
            context.subs.length += length_added;
            for (let i = 0; i < length_added; i++) {
                context.subs[length_old + i] = subs[i];
            }
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
                console.log(context.pins[source]);
                subs[i] = {
                    source: context.pins[source] !== undefined ? context.pins[source] : source,
                    target: target,
                    type: (_c = pub_nodes[i].getAttribute('data-type')) !== null && _c !== void 0 ? _c : 'string',
                    node: pub_nodes[i],
                };
            }
            context._mergeWithSubs(subs);
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