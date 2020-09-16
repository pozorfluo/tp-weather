"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const observable_1 = require("./observable");
exports.Context = function () {
    if (!new.target) {
        throw 'Context() must be called with new !';
    }
    this.pins = {};
    this.subs = [];
    return this;
};
exports.Context.prototype.pub = function (name, pin, ...subscribers) {
    this.pins[name] = pin;
    for (let i = 0, length = subscribers.length; i < length; i++) {
        pin.subscribe(subscribers[i]);
    }
    return this;
};
exports.Context.prototype.sub = function (name, ...subscribers) {
    if (!(name in this.pins))
        throw name + ' pin does not exist !';
    for (let i = 0, length = subscribers.length; i < length; i++) {
        this.pins[name].subscribe(subscribers[i]);
    }
    return this;
};
exports.Context.prototype.remove = function (name) {
    if (name in this.pins) {
        this.pins[name].dropAll();
        delete this.pins[name];
    }
    return this;
};
exports.Context.prototype.merge = function (another_context) {
    if (another_context.pins !== undefined) {
        another_context = another_context.pins;
    }
    Object.assign(this.pins, another_context);
    return this;
};
exports.Context.prototype.musterPubs = function (element) {
    var _a, _b, _c;
    const pub_nodes = [...element.querySelectorAll('[data-pub]')];
    const length = pub_nodes.length;
    const subs = Array(length);
    for (let i = 0; i < length; i++) {
        const source = (_a = pub_nodes[i].getAttribute('data-pub')) !== null && _a !== void 0 ? _a : 'error';
        const target = (_b = pub_nodes[i].getAttribute('data-prop')) !== null && _b !== void 0 ? _b : 'textContent';
        if (!(target in pub_nodes[i]))
            throw target + ' is not a valid node prop !';
        const initial_value = pub_nodes[i][target];
        this.pub(source, new observable_1.Observable(initial_value));
        subs[i] = {
            source: this.pins[source],
            target: target,
            type: (_c = pub_nodes[i].getAttribute('data-type')) !== null && _c !== void 0 ? _c : 'string',
            node: pub_nodes[i],
        };
    }
    Array.prototype.push.apply(this.subs, subs);
    return this;
};
exports.Context.prototype.musterSubs = function (element) {
    var _a, _b, _c;
    const sub_nodes = [...element.querySelectorAll('[data-sub]')];
    const length = sub_nodes.length;
    const subs = Array(length);
    for (let i = 0; i < length; i++) {
        const source = (_a = sub_nodes[i].getAttribute('data-sub')) !== null && _a !== void 0 ? _a : 'data-sub or';
        if (!(source in this.pins))
            throw source + ' pin does not exist !';
        subs[i] = {
            source: this.pins[source],
            target: (_b = sub_nodes[i].getAttribute('data-prop')) !== null && _b !== void 0 ? _b : 'textContent',
            type: (_c = sub_nodes[i].getAttribute('data-type')) !== null && _c !== void 0 ? _c : 'string',
            node: sub_nodes[i],
        };
    }
    Array.prototype.push.apply(this.subs, subs);
    return this;
};
exports.Context.prototype.muster = function (element) {
    return this.musterPubs(element).musterSubs(element);
};
exports.Context.prototype.activateAll = function () {
    for (let i = 0, length = this.subs.length; i < length; i++) {
        const target = this.subs[i].target;
        const node = this.subs[i].node;
        if (!(target in node))
            throw target + ' is not a valid node prop !';
        this.subs[i].source.subscribe((value) => {
            node[target] = value;
        });
    }
    return this;
};
exports.Context.prototype.refresh = function () {
    for (const pin of Object.values(this.pins)) {
        pin.notify();
    }
    return this;
};
