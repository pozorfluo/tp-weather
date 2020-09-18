import {Machine, Rules} from './machine';

describe('Machine', () => {
  let rules : Rules;

  beforeEach(() => {
    rules = {
      a : {
        doThis() {
          return ['b'];
        },
        doThat() {
          return ['invalid'];
        }
      },
      b : {
        doThis() {
          return ['a'];
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