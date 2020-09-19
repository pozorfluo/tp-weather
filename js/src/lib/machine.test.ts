import {Machine, Rules} from './machine';

describe('Machine', () => {
  let rules : Rules;

  beforeEach(() => {
    rules = {
      a : {
          actions : {
              doThis() {
                return ['b'];
              },
              doThat() {
                return ['invalid'];
              }
          }
      },
      b : {
          actions : {
              doThis() {
                return ['a'];
              }
          }
      },
    }
  });

  it('throws if its constructor is not called with new', () => {
    expect(() => {
      (Machine as any)();
    }).toThrow();
  });

  it('throws if its constructor is called with an invalid initial state', () => {
    expect(() => {
      new Machine(rules, ['invalid']);
    }).toThrow();
  });

  it('throws when trying to transition to an invalid state', () => {
    expect(() => {
      (Machine as any)();
    }).toThrow();
  });

  it('can have its emit method passed as a callback safely', () => {

  });


});


const arr_a = [0, 1, 2];
const id = (array) => array;
const arr_b = id(arr_a);
arr_b[1] = 999;
console.log(arr_a);
console.log(arr_b);