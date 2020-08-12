"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newContext = exports.withObservable = exports.newObservable = void 0;
const komrad_1 = require("./komrad");
'use strict';
function newObservable(value) {
    const observable = {
        subscribers: [],
        value: value,
        notify: function () {
            for (let i = 0, length = this.subscribers.length; i < length; i++) {
                this.subscribers[i](this.value);
            }
            return this;
        },
        subscribe: function (subscriber, priority) {
            if (priority === undefined) {
                this.subscribers.push(subscriber);
            }
            else {
                this.subscribers.splice(priority, 0, subscriber);
            }
            return this;
        },
        flush: function () {
            this.subscribers = [];
            return this;
        },
        get: function () {
            return this.value;
        },
        set: function (value) {
            if (value !== this.value) {
                this.value = value;
                this.notify();
            }
            return this;
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
            this.pins[name] = pin;
            for (let i = 0, length = subscribers.length; i < length; i++) {
                pin.subscribe(subscribers[i]);
            }
            return this;
        },
        remove: function (name) {
            if (this.pins[name] !== undefined) {
                this.pins[name].flush();
                delete this.pins[name];
            }
            return this;
        },
        merge: function (another_context) {
            if (another_context.pins !== undefined) {
                another_context = another_context.pins;
            }
            komrad_1.extend(this.pins, another_context);
            return this;
        },
        musterSubs: function (element) {
            var _a, _b, _c;
            const sub_nodes = [...element.querySelectorAll('[data-sub]')];
            const length = sub_nodes.length;
            const subs = Array(length);
            for (let i = 0; i < length; i++) {
                const source = (_a = sub_nodes[i].getAttribute('data-sub')) !== null && _a !== void 0 ? _a : 'error';
                const target = (_b = sub_nodes[i].getAttribute('data-property')) !== null && _b !== void 0 ? _b : 'value';
                const type = (_c = sub_nodes[i].getAttribute('data-type')) !== null && _c !== void 0 ? _c : 'string';
                subs[i] = {
                    source: this.pins[source] !== undefined
                        ? this.pins[source]
                        : source,
                    target: target,
                    type: type,
                    node: sub_nodes[i],
                };
            }
            this.subs = subs;
            return this;
        },
        setSubs: function (subs) {
            this.subs = subs;
            return this;
        },
        activateSubs: function () {
            for (let i = 0, length = this.subs.length; i < length; i++) {
                if (typeof this.subs[i].source !== 'string') {
                    this.subs[i].source.subscribe((value) => {
                        this.subs[i].node[this.subs[i].target] = value;
                    });
                }
            }
            return this;
        },
        refresh: function () {
            for (const pin of Object.values(this.pins)) {
                pin.notify();
            }
            return this;
        }
    };
    return context;
}
exports.newContext = newContext;
