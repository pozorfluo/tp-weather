import { Trait, extend } from './komrad';

//------------------------------------------------------------------ app-solo.ts
/**
 * Single-page party system !
 */

/**
 * Define Subscriber callback.
 */
export interface Subscriber<T> {
  (value: T): void;
}

/**
 * Define Observable object.
 */
export interface Observable<T> {
  subscribers: Subscriber<T>[];
  value: T;
  notify: () => Promise<this>;
  subscribe: (subscriber: Subscriber<T>, priority?: number) => this;
  // unsubscribe: (subscriber: Subscriber<T>) => void;
  flush: () => this;
  get: () => T;
  set: (value: T) => this;
  [extension: string]: any; // open for extension.
}

/**
 * Create a new Observable object.
 *
 * @note Optional parameter priority in subscribe method is the index where
 *       given Subscriber is going to be 'spliced' in the subscribers list.
 *       If no paramater is supplied, given Subscriber is appended.
 *
 * @note To resolve notifications according to subscribers priority and
 *       insertion order, notify() Awaits each subscriber's callback in
 *       turn.
 *
 * @todo Research which approach is favored to prevent notification cascade.
 * @todo Defer render to after all compositions/updates are done.
 * @todo Consider using a binary heap for finer grain control of subscribers
 *       priority.
 * @todo Add unsubscribe method.
 * @todo Consider tracking Observables in a list.
 */
export function newObservable<T>(value: T): Observable<T> {
  const observable: any = {
    subscribers: [],
    value: value,

    // notify: async function (): Promise<Observable<T>> {
    notify: function (): Observable<T> {
      // const length = this.subscribers.length;
      // const tasks = new Array(length);
      // console.log(this.subscribers);
      for (let i = 0, length = observable.subscribers.length; i < length; i++) {
        // console.log('notifying ' + this.subscribers[i]);
        // tasks.push(this.subscribers[i](this.value));
        // tasks[i] = this.subscribers[i](this.value);
        // await this.subscribers[i](this.value);
        observable.subscribers[i](observable.value);
      }
      /** @todo consider ES2020 Promise.allSettled */
      // await Promise.all(tasks);
      return observable;
    },

    subscribe: function (
      subscriber: Subscriber<T>,
      priority?: number
    ): Observable<T> {
      if (priority === undefined) {
        observable.subscribers.push(subscriber);
      } else {
        observable.subscribers.splice(priority, 0, subscriber);
      }
      return observable;
    },

    flush: function (): Observable<T> {
      observable.subscribers = [];
      return observable;
    },

    get: function (): T {
      /* Notify that a read is happening here if necessary. */
      return observable.value;
    },

    // set: function (value: T): Observable<T> {
    //   /* The buck stops here. */
    //   if (value !== this.value) {
    //     this.value = value;
    //     this.notify();
    //   }
    //   return this;
    // },
    set: function (value: T): Observable<T> {
      /* The buck stops here. */
      if (value !== observable.value) {
        observable.value = value;
        observable.notify();
      }
      return observable;
    },
  };
  return <Observable<T>>observable;
}

/**
 * Define Observable trait.
 */
export function withObservable<T>(
  name: string,
  value: T
): Observable<T> & Trait {
  const trait: any = { observable: {} }; //  Record<string, Observable<T>>
  trait.observable[name] = newObservable<T>(value);
  return <Observable<T> & Trait>trait;
}
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
 * @todo Add deactivatePins method.
 * @todo Add deactivateLinks method.
 * @todo Consider looking for memory efficient alternatives to
 *       observables_iterator.
 *       Object.is(app.observables.forecasts,
 *                 app.observables_iterator[0][1])) is true though.
 */
export interface Context {
  readonly pins: { [name: string]: Observable<any> };
  readonly subs: Sub<any>[];
  pub: (
    name: string,
    observable: Observable<any>,
    ...subscribers: Subscriber<any>[]
  ) => this;
  remove: (name: string) => this;
  merge: (
    another_context: Context | { [name: string]: Observable<any> }
  ) => Context;
  musterSubs: (element : Document | Element) => this;
  setSubs: (pins: Sub<any>[]) => this;
  activateSubs: () => this;
  refresh: () => this;
  [extension: string]: any; // open for extension.
}

/**
 * Create a new Context object.
 *
 * @note pub and merge will clobber existing entries.
 */
export function newContext(): Context {
  const context: any = {
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
      extend(context.pins, another_context);
      return context;
    },

    /**
     * Collect data subs declared in given element for this Context.
     *
     * @note If requested observable source is NOT found or available in
     *       this Context, record its name as a string placeholder.
     *
     * @todo Consider using a dictionnary and an identifier per sub.
     */
    musterSubs: function (element : Document | Element): Context {
      const sub_nodes: Element[] = [...element.querySelectorAll('[data-sub]')];
      const length: number = sub_nodes.length;
      const subs: Sub<any>[] = Array(length);

      for (let i = 0; i < length; i++) {
        const source: string = sub_nodes[i].getAttribute('data-sub') ?? 'error';
        const target: string =
          sub_nodes[i].getAttribute('data-property') ?? 'value';
        const type: string = sub_nodes[i].getAttribute('data-type') ?? 'string';
        subs[i] = {
          source:
          context.pins[source] !== undefined
              ? context.pins[source]
              : source,
          target: target,
          type: type,
          node: sub_nodes[i],
        };
      }
      context.subs = <Sub<any>[]>subs;
      return context;
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
     * @todo Deal with incomplete Observable-less subs.
     */
    activateSubs: function (): Context {
      for (let i = 0, length = context.subs.length; i < length; i++) {
        if (typeof context.subs[i].source !== 'string') {
          (<Observable<any>>context.subs[i].source).subscribe((value) => {
            context.subs[i].node[context.subs[i].target] = value;
          });
        }
      }
      return context;
    },

    refresh: function (): Context {
      for (const pin of Object.values(context.pins)){
        (<Observable<any>>pin).notify();
      }
      return context;
    }
  };
  return <Context>context;
}
