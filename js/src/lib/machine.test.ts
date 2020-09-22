import { Machine, Rules } from './machine';

describe('Machine', () => {
  let rules: Rules;
  const effect = jest.fn();
  const on_entry = jest.fn();
  const on_exit = jest.fn();
  let machine: Machine;

  beforeEach(() => {
    rules = {
      a: {
        actions: {
          doThis(withThat) {
            effect(withThat);
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
          toA() {
            effect();
            return ['a'];
          },
          goDown() {
            effect();
            return ['b', 'nested_b_1'];
          },
        },
        states: {
          nested_b_1: {
            actions: {
              onExit() {
                on_exit();
                return null;
              },
              next() {
                effect();
                return ['b', 'nested_b_2'];
              },
              goUp() {
                effect();
                return ['b'];
              },
            },
          },
          nested_b_2: {
            actions: {
              onEntry() {
                on_entry();
                return ['b'];
              },
              onExit() {
                on_exit();
                /** @note Used to check that onExit return value  is ignored */
                return ['a'];
              },
              goUp() {
                effect();
                return ['b'];
              },
            },
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

  it('can have its emit method passed as a callback safely', () => {
    expect(true).toBe(false);
  });

  it.only('does not allow the content of its rules to be changed after creation', () => {
    expect(() => {
      machine._rules.a.actions.doThis = () => ['test_state'];
    }).toThrow();
  });

  describe('Actions', () => {
    it('can execute actions passing along given payload', () => {
      expect(true).toBe(false);
    });

    it('does nothing and stay in the same state for undefined actions', () => {
      machine.emit('invalid_action');
      expect(effect).toHaveBeenCalledTimes(0);
      expect(machine.getState()).toEqual(['a']);
    });
  });

  describe('Transitions', () => {
    it('throws when trying to transition to an invalid state', () => {
      expect(() => {
        (Machine as any)();
      }).toThrow();
    });
  });


});

// const arr_a = [0, 1, 2];
// const id = (array) => array;
// const arr_b = id(arr_a);
// arr_b[1] = 999;
// console.log(arr_a);
// console.log(arr_b);
