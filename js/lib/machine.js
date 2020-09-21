"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Machine = void 0;
const deep_freeze_1 = require("./deep-freeze");
exports.Machine = function (rules, initial_state) {
    if (!new.target) {
        throw 'Machine() must be called with new !';
    }
    this._rules = deep_freeze_1.deepFreeze(rules);
    this._current = { init: { actions: {} } };
    this._transition(initial_state);
    return this;
};
exports.Machine.prototype._transition = function (state) {
    if ('onExit' in this._current) {
        this._current.onExit();
    }
    const depth = state.length;
    let target = this._rules[state[0]];
    for (let i = 1; i < depth; i++) {
        const nested_state = state[i];
        if (nested_state in target.states) {
            target = target.states[nested_state];
        }
        else {
            throw nested_state + ' does not exist in ' + state[i - 1] + ' !';
        }
    }
    if ('onEntry' in this._current) {
        const automatic_transition = this._current.onEntry();
        if (automatic_transition) {
            this._transition(automatic_transition);
        }
    }
};
exports.Machine.prototype.emit = function (action, ...payload) {
    if (action in this._current) {
        const handler = this._current[action];
        if (handler) {
            const target = handler.apply(this, payload);
            if (target) {
                this._transition(target);
            }
        }
    }
    console.log(`${action} emitted.`, payload);
};
