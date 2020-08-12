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
      for (let i = 0, length = this.subscribers.length; i < length; i++) {
        // console.log('notifying ' + this.subscribers[i]);
        // tasks.push(this.subscribers[i](this.value));
        // tasks[i] = this.subscribers[i](this.value);
        // await this.subscribers[i](this.value);
        this.subscribers[i](this.value);
      }
      /** @todo consider ES2020 Promise.allSettled */
      // await Promise.all(tasks);
      return this;
    },

    subscribe: function (
      subscriber: Subscriber<T>,
      priority?: number
    ): Observable<T> {
      if (priority === undefined) {
        this.subscribers.push(subscriber);
      } else {
        this.subscribers.splice(priority, 0, subscriber);
      }
      return this;
    },

    flush: function (): Observable<T> {
      this.subscribers = [];
      return this;
    },

    get: function (): T {
      /* Notify that a read is happening here if necessary. */
      return this.value;
    },

    set: function (value: T): Observable<T> {
      /* The buck stops here. */
      if (value !== this.value) {
        this.value = value;
        this.notify();
      }
      return this;
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
      this.pins[name] = pin;
      for (let i = 0, length = subscribers.length; i < length; i++) {
        pin.subscribe(subscribers[i]);
      }
      return this;
    },
    /**
     * Remove observable from this context.
     *
     * @todo Unsubscribe/delete from observables properly.
     */
    remove: function (name: string): Context {
      if (this.pins[name] !== undefined) {
        this.pins[name].flush();
        delete this.pins[name];
      }
      return this;
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
      extend(this.pins, another_context);
      return this;
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
            this.pins[source] !== undefined
              ? this.pins[source]
              : source,
          target: target,
          type: type,
          node: sub_nodes[i],
        };
      }
      this.subs = <Sub<any>[]>subs;
      return this;
    },
    /**
     * Reference given sub collection as this context sub collection.
     */
    setSubs: function (subs: Sub<any>[]): Context {
      this.subs = subs;
      return this;
    },
    /**
     * Activate this context sub collection.
     *
     * @todo Deal with incomplete Observable-less subs.
     */
    activateSubs: function (): Context {
      for (let i = 0, length = this.subs.length; i < length; i++) {
        if (typeof this.subs[i].source !== 'string') {
          (<Observable<any>>this.subs[i].source).subscribe((value) => {
            this.subs[i].node[this.subs[i].target] = value;
          });
        }
      }
      return this;
    },

    refresh: function (): Context {
      for (const pin of Object.values(this.pins)){
        (<Observable<any>>pin).notify();
      }
      return this;
    }
  };
  return <Context>context;
}
