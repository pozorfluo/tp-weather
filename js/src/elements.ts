/**
 * Adapted from David Gilbertson gist.
 * @see https://gist.github.com/davidgilbertson/c9ff092236c695dfe8c57d23f7a1a0de#file-elements-js
 */
// const attributeExceptions = [`role`];

// function appendText(el, text) {
//   const textNode = document.createTextNode(text);
//   el.appendChild(textNode);
// }

'use strict';
function appendArray(
  elem: Element,
  children: (Element | string | (Element | string)[])[]
//   children: Array<Element | string | Array<Element | string>>
): void {
  for (let i = 0, length = children.length; i < length; i++) {
    Array.isArray(children[i])
      ? appendArray(elem, <(Element | string)[]>children[i])
      : elem.append(<Element | string>children[i]);
  }
}

function setStyles(elem : HTMLElement, styles : string[]) {
  if (!styles) {
    elem.removeAttribute(`styles`);
    return;
  }

  Object.keys(styles).forEach((styleName : any) => {
    if (styleName in elem.style) {
      elem.style[styleName] = styles[styleName]; // eslint-disable-line no-param-reassign
    } else {
      console.warn(
        `${styleName} is not a valid style for a <${elem.tagName.toLowerCase()}>`
      );
    }
  });
}

function makeElement(type : string, ...children : any) {
  const elem = document.createElement(type);

  if (Array.isArray(children[0])) {
    appendArray(elem, children[0]);
  } else if (children[0] instanceof window.Element) {
    elem.appendChild(children[0]);
  } else if (typeof children[0] === 'string') {
    elem.append(children[0]);
  } else if (typeof children[0] === 'object') {
    Object.keys(children[0]).forEach((propName) => {
      if (propName in elem ) {
        const value = children[0][propName];

        if (propName === 'style') {
          setStyles(elem, value);
        } else if (value) {
          (<any>elem)[propName] = value;
        }
      } else {
        console.warn(`${propName} is not a valid property of a <${type}>`);
      }
    });
  }

  if (children.length >= 1) appendArray(elem, children.slice(1));

  return elem;
}

export const a = (...args: any) => makeElement(`a`, ...args);
export const button = (...args: any) => makeElement(`button`, ...args);
export const div = (...args: any) => makeElement(`div`, ...args);
export const h1 = (...args: any) => makeElement(`h1`, ...args);
export const h2 = (...args: any) => makeElement(`h2`, ...args);
export const h3 = (...args: any) => makeElement(`h3`, ...args);
export const h4 = (...args: any) => makeElement(`h4`, ...args);
export const h5 = (...args: any) => makeElement(`h5`, ...args);
export const header = (...args: any) => makeElement(`header`, ...args);
export const p = (...args: any) => makeElement(`p`, ...args);
export const span = (...args: any) => makeElement(`span`, ...args);
