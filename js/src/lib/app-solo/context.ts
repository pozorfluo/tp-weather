//-------------------------------------------------------------- app-solo.ts ---
/**
 *
 */
import { Observable, Subscriber, newObservable } from './observable';

/**
 * Define Sub object.
 *
 * @var source Observed source.
 * @var target Property to target with update inside the downstream Node.
 * @var type Observed value type.
 *
 * @todo Add Tag / component / render function callback.
 */
export interface Sub<T> {
  source: Observable<T> | string;
  target: string;
  type: string;
  node: Node;
}

/**
 * Define Context object.
 *
 * @note Because Context relies on apply() to concatenate arrays it can only
 *       handle up to 65536 subs.
 * @note pub and merge will clobber existing entries.
 *
 * @todo Consider looking for memory efficient alternatives to
 *       observables_iterator.
 *       Object.is(app.observables.forecasts,
 *                 app.observables_iterator[0][1])) is true though.
 * @todo Add deactivateSubs method.
 * @todo Add clearSubs, clearPubs, clear.
 */
export interface Context {
  readonly pins: { [name: string]: Observable<any> };
  subs: Sub<any>[];
  pub: (
    name: string,
    observable: Observable<any>,
    ...subscribers: Subscriber<any>[]
  ) => this;
  remove: (name: string) => this;
  merge: (
    another_context: Context | { [name: string]: Observable<any> }
  ) => Context;
  musterPubs: (element: ParentNode) => this;
  musterSubs: (element: ParentNode) => this;
  muster: (element: ParentNode) => this;
  setSubs: (pins: Sub<any>[]) => this;
  activateSubs: () => this;
  refresh: () => this;
  [extension: string]: any; // open for extension.
}

// export function newContext(): Context {
const context: Context = {
  pins: {},
  subs: [],
  /**
   * Register observable in this context.
   */
  pub: function (
    name: string,
    pin: Observable<any>,
    ...subscribers: Subscriber<any>[]
  ): Context {
    context.pins[name] = pin;
    for (let i = 0, length = subscribers.length; i < length; i++) {
      pin.subscribe(subscribers[i]);
    }
    return context;
  },
  /**
   * Remove observable from this context.
   *
   * @todo Unsubscribe/delete from observables properly.
   */
  remove: function (name: string): Context {
    if (context.pins[name] !== undefined) {
      context.pins[name].flush();
      delete context.pins[name];
    }
    return context;
  },

  /**
   * Merge observables from another given context.
   */
  merge: function (
    another_context: Context | { [name: string]: Observable<any> }
  ): Context {
    if (another_context.pins !== undefined) {
      another_context = another_context.pins;
    }
    // extend(context.pins, another_context);
    Object.assign(context.pins, another_context);
    return context;
  },

  /**
   * Collect data pubs declared in given element for this Context.
   *
   * @note A pub is a sub that publishes its initial value as an observable to
   *       a context, i.e., it is immediately subscribed to this new
   *       observable value.
   *
   * @note musterPubs is not idempotent. Y
   */
  musterPubs: function (element: ParentNode): Context {
    const pub_nodes = [...element.querySelectorAll('[data-pub]')];
    const length = pub_nodes.length;
    const subs: Sub<any>[] = Array(length);

    for (let i = 0; i < length; i++) {
      const source = pub_nodes[i].getAttribute('data-pub') ?? 'error';
      const target = pub_nodes[i].getAttribute('data-prop') ?? 'textContent';

      /** @todo Figure out how to check that target exists */
      const initial_value = pub_nodes[i][target as keyof Element];
      context.pub(source, newObservable<typeof initial_value>(initial_value));
      subs[i] = {
        source:
          context.pins[source] !== undefined ? context.pins[source] : source,
        target: target,
        type: pub_nodes[i].getAttribute('data-type') ?? 'string',
        node: pub_nodes[i],
      };
    }
    Array.prototype.push.apply(context.subs, subs);
    return context;
  },

  /**
   * Collect data subs declared in given element for this Context.
   *
   * @throws If requested observable source is NOT found.
   *
   * @todo Consider using a dictionnary and an identifier per sub.
   */
  musterSubs: function (element: ParentNode): Context {
    const sub_nodes = [...element.querySelectorAll('[data-sub]')];
    const length = sub_nodes.length;
    const subs: Sub<any>[] = Array(length);

    for (let i = 0; i < length; i++) {
      const source = sub_nodes[i].getAttribute('data-sub') ?? 'data-sub or';

      if (!context.pins[source]) throw source + ' pin does not exist !';

      subs[i] = {
        source: context.pins[source],
        target: sub_nodes[i].getAttribute('data-prop') ?? 'textContent',
        type: sub_nodes[i].getAttribute('data-type') ?? 'string',
        node: sub_nodes[i],
      };
    }
    Array.prototype.push.apply(context.subs, subs);
    return context;
  },

  /**
   * Collect both data pubs & subs declared in given element for this Context.
   *
   * @note Muster pubs first to avoid dangling subs.
   */
  muster: function (element: ParentNode): Context {
    return context.musterPubs(element).musterSubs(element);
  },
  /**
   * Reference given sub collection as this context sub collection.
   */
  setSubs: function (subs: Sub<any>[]): Context {
    context.subs = subs;
    return context;
  },
  /**
   * Activate this context sub collection.
   *
   * @throws If sub target is NOT a property of sub node.
   */
  activateSubs: function (): Context {
    for (let i = 0, length = context.subs.length; i < length; i++) {
      const target = context.subs[i].target;
      const node = context.subs[i].node;

      // if (target in node === false) {}
      if (!(<any>node)[target]) throw target + ' is not a valid node prop !';

      (<Observable<any>>context.subs[i].source).subscribe((value) => {
        (<any>node)[target] = value;
      });
    }
    return context;
  },

  refresh: function (): Context {
    for (const pin of Object.values(context.pins)) {
      (<Observable<any>>pin).notify();
    }
    return context;
  },
};
//   return <Context>context;
// }

/**
 * Create a new Context object.
 */
export type ContextCtor = { new (): Context };

export const Context = (function (this: Context): Context {
  if (!new.target) {
    throw 'Context() must be called with new !';
  }
  return this;
} as any) as ContextCtor;

Context.prototype = context;
// const testee = new Context();
// console.log(testee)