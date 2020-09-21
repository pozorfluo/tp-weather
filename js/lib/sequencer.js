"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequencer = void 0;
exports.sequencer = function* (steps) {
    const length = steps.length;
    for (let i = 0;;) {
        if (i >= length) {
            i = 0;
        }
        const requested = yield steps[i];
        const requested_index = requested !== undefined ? steps.indexOf(requested) : -1;
        i = requested_index !== -1 ? requested_index : i + 1;
    }
};
