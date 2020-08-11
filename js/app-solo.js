"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newContext = exports.link = exports.withObservable = exports.newObservable = void 0;
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
function link(observable, node, property, event = 'input') {
    node[property] = observable.value + '';
    observable.subscribe(() => {
        node[property] = observable.value + '';
    });
    node.addEventListener(event, () => observable.set(node[property]));
}
exports.link = link;
function newContext() {
    const context = {
        observables: {},
        observables_iterator: [],
        pins: [],
        links: [],
        put: function (name, observable, ...subscribers) {
            this.observables[name] = observable;
            this.observables_iterator.push([name, observable]);
            for (let i = 0, length = subscribers.length; i < length; i++) {
                observable.subscribe(subscribers[i]);
            }
            return this;
        },
        remove: function (name) {
            if (this.observables[name] !== undefined) {
                this.observables[name].flush();
                delete this.observables[name];
            }
            return this;
        },
        merge: function (another_context) {
            if (another_context.observables !== undefined) {
                another_context = another_context.observables;
            }
            komrad_1.extend(this.observables, another_context);
            return this;
        },
        musterPins: function () {
            var _a, _b, _c;
            const pin_nodes = [...document.querySelectorAll('[data-pin]')];
            const length = pin_nodes.length;
            const pins = Array(length);
            for (let i = 0; i < length; i++) {
                const source = (_a = pin_nodes[i].getAttribute('data-pin')) !== null && _a !== void 0 ? _a : 'error';
                const target = (_b = pin_nodes[i].getAttribute('data-property')) !== null && _b !== void 0 ? _b : 'value';
                const type = (_c = pin_nodes[i].getAttribute('data-type')) !== null && _c !== void 0 ? _c : 'string';
                pins[i] = {
                    source: this.observables[source] !== undefined
                        ? this.observables[source]
                        : source,
                    target: target,
                    type: type,
                    node: pin_nodes[i],
                };
            }
            this.pins = pins;
            return this;
        },
        musterLinks: function () {
            var _a, _b, _c, _d;
            const link_nodes = [
                ...document.querySelectorAll('[data-link]'),
            ];
            const length = link_nodes.length;
            const links = Array(length);
            for (let i = 0; i < length; i++) {
                const source = (_a = link_nodes[i].getAttribute('data-link')) !== null && _a !== void 0 ? _a : 'error';
                const event = (_b = link_nodes[i].getAttribute('data-event')) !== null && _b !== void 0 ? _b : 'input';
                const target = (_c = link_nodes[i].getAttribute('data-property')) !== null && _c !== void 0 ? _c : 'value';
                const type = (_d = link_nodes[i].getAttribute('data-type')) !== null && _d !== void 0 ? _d : 'string';
                links[i] = {
                    source: this.observables[source] !== undefined
                        ? this.observables[source]
                        : source,
                    event: event,
                    target: target,
                    type: type,
                    node: link_nodes[i],
                };
            }
            this.links = links;
            return this;
        },
        setPins: function (pins) {
            this.pins = pins;
            return this;
        },
        setLinks: function (links) {
            this.links = links;
            return this;
        },
        activatePins: function () {
            for (let i = 0, length = this.pins.length; i < length; i++) {
                if (typeof this.pins[i].source !== 'string') {
                    this.pins[i].source.subscribe((value) => {
                        this.pins[i].node[this.pins[i].target] = value;
                    });
                }
            }
            return this;
        },
        activateLinks: function () {
            for (let i = 0, length = this.links.length; i < length; i++) {
                if (typeof this.links[i].source !== 'string') {
                    link(this.links[i].source, this.links[i].node, this.links[i].target, this.links[i].event);
                }
            }
            return this;
        },
        refresh: function () {
            for (let i = 0, length = this.observables_iterator.length; i < length; i++) {
                this.observables_iterator[i][1].notify();
            }
            return this;
        },
    };
    return context;
}
exports.newContext = newContext;
