import { Machine, Rules } from './machine';

describe('Machine', () => {
  let rules: Rules;
  const effect = jest.fn();
  let machine: Machine;

  beforeEach(() => {
    rules = {
      a: {
        actions: {
          doThis() {
            effect();
            return ['b'];
          },
          doThat() {
            effect();
            return ['invalid'];
          },
        },
      },
      b: {
        actions: {
          doThis() {
            effect();
            return ['a'];
          },
        },
      },
    };
    machine = new Machine(rules, ['a']);
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

  it('can have its emit method passed as a callback safely', () => {});

  it('does nothing and stay in the same state for undefined actions', () => {
    machine.emit('invalid_action');
    expect(effect).toHaveBeenCalledTimes(0);
    expect(machine.getState()).toEqual(['a']);
  });

  it.only('does not allow the content of its rules to be changed after creation', () => {
    expect(() => {
      machine._rules.a.actions.doThis = () => ['test_state'];
    }).toThrow();
  });


});

// const arr_a = [0, 1, 2];
// const id = (array) => array;
// const arr_b = id(arr_a);
// arr_b[1] = 999;
// console.log(arr_a);
// console.log(arr_b);
