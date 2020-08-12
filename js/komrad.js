"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cram = exports.extend = void 0;
function extend(object, trait) {
    Object.keys(trait).forEach(function (key) {
        object[key] = trait[key];
    });
}
exports.extend = extend;
function cram(object, trait) {
    Object.keys(trait).forEach(function (key) {
        switch (typeof object[key]) {
            case 'object':
                if (Array.isArray(object[key])) {
                    [...object[key], trait[key]];
                }
                else {
                    extend(object[key], trait[key]);
                }
                break;
            case undefined:
            default:
                object[key] = trait[key];
                break;
        }
    });
    return object;
}
exports.cram = cram;
function extendCopy(object, trait) {
    const extended_copy = Object.assign({}, object);
    Object.keys(trait).forEach(function (key) {
        extended_copy[key] = trait[key];
    });
    return extended_copy;
}
