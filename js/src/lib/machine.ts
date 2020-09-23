//---------------------------------------------------------------------- machine
/**
 * @note Footguns :
 *         - Trying to execute onEntry, onExit directly
 *             -> they are not treated like regular user definable actions,
 *                use with care.
 */
import { deepFreeze } from './deep-freeze';

/**
 * Define State of a Machine.
 */
export type State = string[];

/**
 * Define InternalTransition.
 */
export type InternalTransition = null;
/**
 * Define Transition as either a target State or an InternalTransition.
 *
 * @notes Transition to a State will trigger onEntry, onExit special actions
 * including self-transitions where target State is the same as current State.
 *
 * @note InternalTransition is used to denote that no transition happens and
 * that the Action is executed without causing current State to change.
 */
export type Transition = State | InternalTransition;

/**
 * Define Action handlers of a Machine Rules.
 *
 * After executing the Action, the Machine will transition to the returned
 * Transition value which is either a target State or a value to denote an
 * InternalTransition.
 */
export type Action = (...payload: unknown[]) => Transition;

/**
 * Define Rules with possible states, actions of a Machine.
 *
 * @note onEntry, onExit are special action automatically executed when the
 *       their parent state is entered/exited.
 *
 * @note onExit returned value is ignored to forbid automatic transitions
 *       from this special action.
 *
 *
 * @todo Check if typescript allows onEntry, onExit to be assigned a Rules type
 *       value. Hopefully not.
 * @todo Consider handling parallel states.
 * @todo Consider requiring that properties on Rules MUST be enumerable and
 *       simplifying deepFreeze().
 */
export interface Rules {
  [state: string]: {
    onEntry?: Action;
    onExit?: Action;
    actions: {
      [action: string]: Action;
    };
    states?: Rules;
  };
}

/**
 * Define MachineEvent object.
 *
 * @todo Consider how to log side-effects, especially non-deterministic ones.
 * @todo Consider that if the callback needs a timestamp it can generate one by
 *       itself.
 * @todo Consider
 */
export interface MachineEvent {
  /**
   * @todo Consider using actionHandler.name if the action string name is
   *       enough.
   * @todo Consider implementing a ctor helper for MachineEvent, leaving it to
   *       the user to build a MachineEvent and uses as he sees fit.
   */
  action: Action;
  payload: unknown[];
  transition: Transition;
  before: State;
  after: State;
  side_effects: unknown[];
}
/**
 * Define Machine object.
 */
export interface Machine {
  /** Internal cursor */
  _current: Rules;
  /** Track State in its unrolled string[] form */
  _latest_transition: State;
  _rules: Rules;
  _transition: (state: State) => void;
  //emitter should NOT care about => State;
  emit: (action: string, ...payload: unknown[]) => void;
  peek: () => State;
  // /** Register an optional callback fired on Transition. */
  // onTransition: (event: MachineEvent) => void;
  // /** Register an optional callback fired on reaching Final state. */
  // onFinished: (event: MachineEvent) => void;
}

/**
 * Define Machine constructor.
 */
export type MachineCtor = {
  new (rules: Rules, initial_state: State): Machine;
};

/**
 * Create a new Machine object.
 */
export const Machine = (function (
  this: Machine,
  rules: Rules,
  initial_state: State
): Machine {
  if (!new.target) {
    throw 'Machine() must be called with new !';
  }

  this._rules = deepFreeze(rules) as Rules;
  /** @note Bootstrap _current to a mock minimum viable rule. */
  this._current = { init: { actions: {} } };
  this._transition(initial_state);
  return this;
} as any) as MachineCtor;

/**
 * @throws If target State does NOT exist on this Machine.
 */
Machine.prototype._transition = function (state: State) {
  if ('onExit' in this._current) {
    /** Forbid automatic transition onExit by ignoring returned value. */
    this._current.onExit();
  }

  const depth = state.length;
  let target = this._rules[state[0]];

  for (let i = 1; i < depth; i++) {
    const nested_state = state[i];
    if (nested_state in target.states) {
      target = target.states[nested_state];
    } else {
      throw nested_state + ' does not exist in ' + state[i - 1] + ' !';
    }
  }

  this._current = target;
  this._latest_transition = state;

  if ('onEntry' in this._current) {
    const automatic_transition = this._current.onEntry();
    if (automatic_transition) {
      this._transition(automatic_transition);
    }
  }
};

/**
 * Execute Action handler if a rule for given action name exists in current
 * Machine State, passing along given payload as Action arguments.
 *
 * Transition to State returned by executed Action handler if any.
 *
 * @todo Consider using hasOwnProperty or not inheriting from Object to avoid
 *       unintended match on {} prototype methods.
 */
Machine.prototype.emit = function (action: string, ...payload: unknown[]) {
  if (action in this._current.actions) {
    const handler = this._current.actions[action];
    // if (handler) {
    if (payload.length !== handler.length) {
      throw `${action} expects ${handler.length} arguments, ${payload.length} given !`;
    }
    const target = handler.apply(this, payload);

    if (target) {
      this._transition(target);
    }
  }
  // }
};

/**
 * Return a copy of this Machine State in its unrolled string[] form.
 *
 * @note Use to check a Machine current State or to initialize a new Machine
 *       with identical or compatible Rules to
 */
Machine.prototype.peek = function () {
  return [...this._latest_transition];
};

// /**
//  * Execute Action handler if arule for given action name exists in current
//  * Machine State, passing along given payload as Action argument and optionally
//  * action name if required by the Action handler.
//  *
//  * Transition to State returned by executed Action handler if any.
//  *
//  * @todo Consider using hasOwnProperty or not inheriting from Object to avoid
//  *       unintended match on {} prototype methods.
//  */
// Machine.prototype.emit = function (action: string, ...payload: unknown[]) {
//   if (action in this._current) {
//     const handler = this._current[action];
//     if (handler) {
//       const target =
//       /**
//        *  @todo Consider skipping handler's argument count check and always
//        *        applying with both payload and action string.
//        *        Alternatively consider making the action string part of the
//        *        payload.
//        */
//         handler.length === 2
//           ? handler.apply(this, payload, action)
//           : handler.apply(this, payload);
//       if (target) {
//         this._transition(target);
//       }
//     }
//   }
// };

// export const configMachine = {
//   /** Internal cursor */
//   _current: ['version'],
//   //---------------------------------------------------------- machine rules ---
//   states: {
//     version: {
//       /**
//        * Update config with initial version preset.
//        */
//       select(version) {
//         store.dispatch({
//           type: 'UPDATE_CONFIG',
//           config: { version: [version] },
//         });
//       },
//       /**
//        * Transition to settings edition for selected version if any.
//        */
//       next() {
//         const context = store.getState();
//         if (context.config.version.length) {
//           store.dispatch({
//             type: 'SET_STEP',
//             step: context.settingSequencer.next('color').value,
//           });
//           this._current = ['settings'];
//         }
//       },
//     },
//     settings: {
//       /**
//        *
//        */
//       select(item) {
//         const context = store.getState();
//         store.dispatch({
//           type: 'UPDATE_CONFIG',
//           config: { [context.step]: [item] },
//         });
//       },
//       /**
//        *
//        */
//       add(item) {
//         const context = store.getState();
//         store.dispatch({
//           type: 'UPDATE_CONFIG',
//           config: { [context.step]: [...context.config[context.step], item] },
//         });
//       },
//       /**
//        *
//        */
//       next() {
//         const context = store.getState();
//         store.dispatch({
//           type: 'SET_STEP',
//           step: context.settingSequencer.next().value,
//         });

//         if (this.isConfigDone(context.config)) {
//           this._current = ['summary'];
//         }
//       },
//       /**
//        *
//        */
//       nav(path) {
//         const context = store.getState();
//         if (path !== context.step) {
//           store.dispatch({
//             type: 'SET_STEP',
//             step: context.settingSequencer.next(path).value,
//           });
//           this._current = ['settings'];
//         }
//       },
//       /**
//        *
//        */
//       reset() {
//         this._current = ['reset'];
//       },
//       /**
//        *
//        */
//       down() {
//         this._current = [...this._current, 'test'];
//       },
//     },
//     summary: {
//       /**
//        *
//        */
//       submit() {
//         /** @todo Send config by email. */
//         this._current = ['done'];
//       },
//       /**
//        *
//        */
//       reset(origin) {
//         this._current = ['reset'];
//       },
//     },
//     reset: {
//       /**
//        *
//        */
//       confirm() {
//         store.dispatch({ type: 'RESET_CONFIG' });
//         store.dispatch({
//           type: 'SET_STEP',
//           step: 'version',
//         });

//         this._current = ['version'];
//       },
//       /**
//        *
//        */
//       cancel() {
//         this._current = ['summary'];
//       },
//     },
//     done: {
//       /**
//        *
//        */
//       reset(origin) {
//         this._current = ['reset'];
//       },
//     },
//   },
//   //-------------------------------------------------------- machine helpers ---
//   /**
//    *
//    */
//   isConfigDone(config) {
//     let isDone = false;
//     if (config === Object(config)) {
//       isDone = true;
//       Object.keys(config).forEach(function (key) {
//         isDone = isDone && Array.isArray(config[key]) && config[key].length;
//       });
//     }
//     return isDone;
//   },
//   //-------------------------------------------------------------------- API ---
//   /**
//    * Execute action associated with given event if the latter exists in current
//    * machine state, passing along given payload as action argument.
//    */
//   emit(event, ...payload) {
//     const depth = this._current.length;
//     let state = this.states[this._current[0]];

//     for (let i = 1; i < depth; i++) {
//       state = state.states[this._current[i]];
//     }

//     if (state) {
//       const handler = state[event];
//       if (handler) {
//         handler.apply(configMachine, payload);
//       }
//     }

//     /** @todo Consider logging invalid actions here. */
//     console.log(`${event} emitted.`, payload);
//   },
//   /**
//    * Return a copy of this machine internal cursor.
//    */
//   getState() {
//     return [...this._current];
//   },
// };

// /**
//  * Define a react hook to access configMachine emit method.
//  */
//   return configMachine.emit.bind(configMachine);
// };
