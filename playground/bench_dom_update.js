// import * from '../node_modules/benchmark/benchmark';
// const Benchmark = require("benchmark");
'use strict';

const count = 100;
const keys = new Array(count);
const fragment = document.createDocumentFragment();

const template = document.createElement('div');
template.setAttribute('style', 'background-color: hotpink;');

for (let i = 0; i < count; i++) {
//   keys[i] = document.createElement('div');
keys[i] = template.cloneNode(true);
  fragment.appendChild(keys[i]);
}

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

const suite = new Benchmark.Suite();
suite
  .add('syncLoop', () => syncLoop(keys, count))
//   .add('asyncSeqLoop', () => asyncSeqLoop(keys, count))
  .add('asyncLoop', () => asyncLoop(keys, count))
  .on('complete', function() {
    console.log('fastest is ' + this.filter('fastest').map('name'));}
  )
  .run({ async: true });

//   var bench = new Benchmark('foo', () => asyncSeqLoop(keys, count));
// bench.run({ async: true });
  

