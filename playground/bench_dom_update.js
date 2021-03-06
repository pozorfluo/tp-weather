// import * from '../node_modules/benchmark/benchmark';
// const Benchmark = require("benchmark");
'use strict';

const count = 100;
const keys = new Array(count);
const fragment = document.createDocumentFragment();

const template = document.createElement('div');
template.setAttribute('style', 'background-color: hotpink;');

const div = function () {
  const element = document.createElement('div');
  element.setAttribute('style', 'background-color: hotpink;');
  return element;
};

function appendFromType(fragment, type, count) {
  for (let i = 0; i < count; i++) {
    keys[i] = document.createElement('div');
    keys[i].setAttribute('style', 'background-color: hotpink;');
    fragment.appendChild(keys[i]);
  }
  return fragment;
}

function appendFromTemplate(fragment, template, count) {
  for (let i = 0; i < count; i++) {
    keys[i] = template.cloneNode(true);
    fragment.appendChild(keys[i]);
  }
  return fragment;
}

function appendFromComponent(fragment, component, count) {
  for (let i = 0; i < count; i++) {
    keys[i] = component();
    fragment.appendChild(keys[i]);
  }
  return fragment;
}

function appendFromClonedComponent(fragment, component, count) {
    const comp = component();
  for (let i = 0; i < count; i++) {
    keys[i] = comp.cloneNode(true);
    fragment.appendChild(keys[i]);
  }
  return fragment;
}

// function appendFromWc(fragment, template, count) {
// }

console.log(`${count} elements added to fragment.`);

document.body.appendChild(fragment);

console.log('Fragment appended to body.');

function syncLoop(keys, count) {
  for (let i = 0; i < count; i++) {
    keys[i].textContent = i;
  }
}

async function updateElem(key, i) {
  key.textContent = i;
}

async function asyncSeqLoop(keys, count) {
  for (let i = 0; i < count; i++) {
    await updateElem(keys[i], i);
  }
}

async function asyncLoop(keys, count) {
  const tasks = new Array(count);
  for (let i = 0; i < count; i++) {
    tasks[i] = updateElem(keys[i], i);
  }
  await Promise.all(tasks);
}

// const times = [];

// let startTime = performance.now();
// asyncSeqLoop(keys, count);
// times.push(performance.now() - startTime);

// startTime = performance.now();
// syncLoop(keys, count);
// times.push(performance.now() - startTime);

// startTime = performance.now();
// asyncLoop(keys, count);
// times.push(performance.now() - startTime);

// console.log(times);

// const suite = new Benchmark.Suite();
// suite
//   .add('syncLoop', () => syncLoop(keys, count))
//   //   .add('asyncSeqLoop', () => asyncSeqLoop(keys, count))
//   .add('asyncLoop', () => asyncLoop(keys, count))
//   .on('complete', function () {
//     console.log('fastest is ' + this.filter('fastest').map('name'));
//   })
//   .run({ async: true });

const f1 = document.createDocumentFragment();
const f2 = document.createDocumentFragment();
const f3 = document.createDocumentFragment();
const f4 = document.createDocumentFragment();

const suite = new Benchmark.Suite();
suite
  .add('appendFromType', () => appendFromType(f1, 'div', count))
  .add('appendFromTemplate', () => appendFromTemplate(f2, template, count))
  .add('appendFromComponent', () => appendFromComponent(f3, div, count))
  .add('appendFromClonedComponent', () => appendFromClonedComponent(f4, div, count))
  .on('complete', function () {
    console.log('fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });
// appendFromType(f1, 'div', count);
// appendFromTemplate(f2, template, count);
// appendFromComponent(f3, div, count);
// document.body.appendChild(f1);
// document.body.appendChild(f2);
// document.body.appendChild(f3);



const count = 1000;
const c = Array(count);
for(let i = 0; i <count; i++){
  c[i] = i;
}

const a = [1, 2, 3, 4, 5];
const b = [6, 7, 8, 9, 10];

function merge(a, b) {
  const length_old = a.length;
  const length_added = b.length;
  a.length += length_added;
  for (let i = 0; i < length_added; i++) {
    a[length_old + i] = b[i];
  } 
}

console.log(a);
console.log(b);
console.log(c);

Array.prototype.push.apply(a, b);
Array.prototype.push.apply(c, b);
Array.prototype.push.apply(b, c);
Array.prototype.push.apply(c, c);

merge(a, b);
merge(c, b);
merge(b, c);
merge(c, c);

console.log(a);
console.log(b);
console.log(c);

const count = 1000;
const frag = document.createDocumentFragment();
// const span = document.createElement('span');
for (let i=count; i--;){
  // const s = span.cloneNode(true);
  const s = document.createElement('a');
  // s.setAttribute('data-pub', 's'+i);
  s.setAttribute('data-sub', 'temp');
  s.textContent = i +'';
  frag.appendChild(s);
}
weather.appendChild(frag);