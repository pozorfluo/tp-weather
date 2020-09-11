"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const observable_1 = require("./observable");
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
        Object.assign(context.pins, another_context);
        return context;
    },
    musterPubs: function (element) {
        var _a, _b, _c;
        const pub_nodes = [...element.querySelectorAll('[data-pub]')];
        const length = pub_nodes.length;
        const subs = Array(length);
        for (let i = 0; i < length; i++) {
            const source = (_a = pub_nodes[i].getAttribute('data-pub')) !== null && _a !== void 0 ? _a : 'error';
            const target = (_b = pub_nodes[i].getAttribute('data-prop')) !== null && _b !== void 0 ? _b : 'textContent';
            const initial_value = pub_nodes[i][target];
            context.pub(source, new observable_1.Observable(initial_value));
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
            const source = (_a = sub_nodes[i].getAttribute('data-sub')) !== null && _a !== void 0 ? _a : 'data-sub or';
            if (!context.pins[source])
                throw source + ' pin does not exist !';
            subs[i] = {
                source: context.pins[source],
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
            const target = context.subs[i].target;
            const node = context.subs[i].node;
            if (!node[target])
                throw target + ' is not a valid node prop !';
            context.subs[i].source.subscribe((value) => {
                node[target] = value;
            });
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
exports.Context = function () {
    if (!new.target) {
        throw 'Context() must be called with new !';
    }
    return this;
};
exports.Context.prototype = context;
