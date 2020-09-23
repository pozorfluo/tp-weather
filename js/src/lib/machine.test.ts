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
          doInvalidTransition() {
            effect();
            return ['invalid'];
          },
          doWithArgs(first, second, third) {
            effect(first, second, third);
            return null;
          },
          doWithArgsAndDefaultValue(first, second, third = 'IamOptional') {
            effect(first, second, third);
            return null;
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
    effect.mockClear();
    on_entry.mockClear();
    on_exit.mockClear();
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

  it('throws when trying to change its rules after creation', () => {
    expect(() => {
      machine._rules.a.actions.doThis = () => ['test_state'];
    }).toThrow();
  });

  it('can create a Machine that does nothing', () => {
    const empty_machine = new Machine({ empty_rule: { actions: {} } }, [
      'empty_rule',
    ]);
    expect(empty_machine.peek()).toEqual(['empty_rule']);
  });

  it('can have its emit method safely passed as a callback', (done) => {
    const emit_from_another_context = machine.emit;
    emit_from_another_context('doThis', 'expected');
    expect(machine.peek()).toEqual(['b']);

    setTimeout(machine.emit, 0, 'toA');
    setTimeout(() => {
      done();
      expect(machine.peek()).toEqual(['a']);
    }, 0);
    // machine.emit('toA');
  });

  describe('Actions', () => {
    it('can execute actions passing along given payload', () => {
      const payload = 'string arg';
      // expect(machine.peek()).toEqual(['a']);
      machine.emit('doThis', payload);
      expect(effect).toHaveBeenCalledWith(payload);
    });

    it('throws if given payload does not match action required number of arguments', () => {
      expect(() => {
        machine.emit('doThis');
      }).toThrow();
      expect(() => {
        machine.emit('doThis', 'expected', 'extraneous');
      }).toThrow();
      expect(() => {
        machine.emit('doWithArgs', 'expected', 'expected');
      }).toThrow();
    });

    it('allows optional action arguments using default values', () => {
      const payload = ['expected', 'expected'];
      expect(() => {
        machine.emit('doWithArgs', ...payload);
      }).toThrow();
      expect(() => {
        machine.emit('doWithArgsAndDefaultValue', ...payload);
      }).not.toThrow();
      expect(effect).toHaveBeenCalledWith(...payload, 'IamOptional');
    });

    it('does nothing and stay in the same state for undefined actions', () => {
      machine.emit('invalid_action');
      expect(effect).toHaveBeenCalledTimes(0);
      expect(machine.peek()).toEqual(['a']);
    });
  });

  describe('Transitions', () => {
    it('throws when trying to transition to an invalid state', () => {
      expect(() => {
        machine.emit('doInvalidTransition');
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
