'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.span = exports.p = exports.header = exports.h5 = exports.h4 = exports.h3 = exports.h2 = exports.h1 = exports.div = exports.button = exports.a = void 0;
function appendArray(elem, children) {
    for (let i = 0, length = children.length; i < length; i++) {
        Array.isArray(children[i])
            ? appendArray(elem, children[i])
            : elem.append(children[i]);
    }
}
function setStyles(elem, styles) {
    if (!styles) {
        elem.removeAttribute(`styles`);
        return;
    }
    Object.keys(styles).forEach((styleName) => {
        if (styleName in elem.style) {
            elem.style[styleName] = styles[styleName];
        }
        else {
            console.warn(`${styleName} is not a valid style for a <${elem.tagName.toLowerCase()}>`);
        }
    });
}
function makeElement(type, ...children) {
    const elem = document.createElement(type);
    if (Array.isArray(children[0])) {
        appendArray(elem, children[0]);
    }
    else if (children[0] instanceof window.Element) {
        elem.appendChild(children[0]);
    }
    else if (typeof children[0] === 'string') {
        elem.append(children[0]);
    }
    else if (typeof children[0] === 'object') {
        Object.keys(children[0]).forEach((propName) => {
            if (propName in elem) {
                const value = children[0][propName];
                if (propName === 'style') {
                    setStyles(elem, value);
                }
                else if (value) {
                    elem[propName] = value;
                }
            }
            else {
                console.warn(`${propName} is not a valid property of a <${type}>`);
            }
        });
    }
    if (children.length >= 1)
        appendArray(elem, children.slice(1));
    return elem;
}
exports.a = (...args) => makeElement(`a`, ...args);
exports.button = (...args) => makeElement(`button`, ...args);
exports.div = (...args) => makeElement(`div`, ...args);
exports.h1 = (...args) => makeElement(`h1`, ...args);
exports.h2 = (...args) => makeElement(`h2`, ...args);
exports.h3 = (...args) => makeElement(`h3`, ...args);
exports.h4 = (...args) => makeElement(`h4`, ...args);
exports.h5 = (...args) => makeElement(`h5`, ...args);
exports.header = (...args) => makeElement(`header`, ...args);
exports.p = (...args) => makeElement(`p`, ...args);
exports.span = (...args) => makeElement(`span`, ...args);
