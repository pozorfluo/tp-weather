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
  _ticker: number;
  notify: () => Promise<this>;
  subscribe: (subscriber: Subscriber<T>, priority?: number) => this;
  // unsubscribe: (subscriber: Subscriber<T>) => void;
  flush: () => this;
  get: () => T;
  set: (value: T) => this;
  debounce: () => this;
  [extension: string]: any; // open for extension.
}

/**
 * Define ObservableOptions object used in Observable constructor.
 */
enum RateLimit {
  none = 'none',
  debounce = 'debounce',
  throttle = 'throttle',
}
// export interface ObservableOptions {
//   rateLimit: RateLimit;
// }

/**
 * Create a new Observable object.
 *
 * @note Optional parameter priority in subscribe method is the index where
 *       given Subscriber is going to be 'spliced' in the subscribers list.
 *       If no paramater is supplied, given Subscriber is appended.
 *
 * @note To resolve notifications according to subscribers priority and
 *       insertion order, notify() Awaits each subscriber's callback in
 *       turn. -> not used right now.
 *
 * @todo Research which approach is favored to prevent notification cascade.
 * @todo Defer render to after all compositions/updates are done.
 * @todo Consider using a binary heap for finer grain control of subscribers
 *       priority.
 * @todo Add unsubscribe method.
 * @todo Consider tracking Observables in a list.
 */
export function newObservable<T>(
  value: T,
  // options?: ObservableOptions
  rateLimit: RateLimit = RateLimit.throttle
): Observable<T> {
  const instance: any = {
    subscribers: [],
    value: value,
    /** Internal state for rate limiting if any. */
    _ticker: 0,
    _immediate: 0,
    /**
     *
     */
    // notify: async function (): Promise<Observable<T>> {
    notify: function (): Observable<T> {
      // const length = this.subscribers.length;
      // const tasks = new Array(length);
      // console.log(this.subscribers);
      for (let i = 0, length = instance.subscribers.length; i < length; i++) {
        // console.log('notifying ' + this.subscribers[i]);
        // tasks.push(this.subscribers[i](this.value));
        // tasks[i] = this.subscribers[i](this.value);
        // await this.subscribers[i](this.value);
        instance.subscribers[i](instance.value);
      }
      /** @todo consider ES2020 Promise.allSettled */
      // await Promise.all(tasks);
      return instance;
    },
    /**
     *
     */
    subscribe: function (
      subscriber: Subscriber<T>,
      priority?: number
    ): Observable<T> {
      if (priority === undefined) {
        instance.subscribers.push(subscriber);
      } else {
        instance.subscribers.splice(priority, 0, subscriber);
      }
      return instance;
    },
    /**
     *
     */
    flush: function (): Observable<T> {
      instance.subscribers = [];
      return instance;
    },
    /**
     *
     */
    get: function (): T {
      /* Notify that a read is happening here if necessary. */
      return instance.value;
    },
    /**
     * @todo See how wasteful this experiment to avoid a branch is when using
     *       prototype/ctor.
     * @todo Consider having 'set' point to internal function on prototype.
     */
    // set: options?.debounce
    set: ((rateLimit: RateLimit) => {
      switch (rateLimit) {
        case RateLimit.none:
          return function (value: T): Observable<T> {
            /* The buck stops here. */
            if (value !== instance.value) {
              instance.value = value;
              instance.notify();
            }
            return instance;
          };
        case RateLimit.debounce:
          return function (value: T): Observable<T> {
            console.log('set', instance._ticker, instance.value);
            /* The buck stops here. */
            if (value !== instance.value) {
              instance.value = value;

              /** Cancel pending notification. */
              if (instance._ticker) {
                window.cancelAnimationFrame(instance._ticker);
                console.log('Cancel notify', instance._ticker, instance.value);
              }

              /** Schedule notification on next frame. */
              instance._ticker = window.requestAnimationFrame(function () {
                instance.notify();
                console.log(' ----> Notify', instance._ticker, instance.value);
                instance._ticker = 0;
              });
              console.log('Schedule notify', instance._ticker, instance.value);
            }
            return instance;
          };
        case RateLimit.throttle:
          /**
           * If there is no pending notification
           *   Notify immediately
           * Else
           *   Schedule notification
           */
          return function (value: T): Observable<T> {
            /* The buck stops here. */
            if (value !== instance.value) {
              instance.value = value;

              /** Notify immediately if there are no pending notifications. */
              if (!instance._immediate && !instance._ticker) {
                instance.notify();
                console.log(
                  '----> LeadNotify',
                  instance._ticker,
                  instance.value
                );
                /** Prevent further immediate notification until next frame. */
                instance._immediate = window.requestAnimationFrame(
                  () => (instance._immediate = 0)
                );
              } else if (!instance._ticker) {
                /** Schedule notification on next frame. */
                instance._ticker = window.requestAnimationFrame(function (
                  now: DOMHighResTimeStamp
                ) {
                  window.cancelAnimationFrame(instance._ticker);

                  instance.notify();
                  console.log(
                    ' ----> Notify',
                    instance._ticker,
                    instance.value,
                    now
                  );
                  instance._ticker = 0;
                });
                console.log(
                  'Schedule notify',
                  instance._ticker,
                  instance.value
                );
              }
            }
            return instance;
          };
      }
    })(rateLimit),
    // set: function (value: T): Observable<T> {
    //   /* The buck stops here. */
    //   if (value !== observable.value) {
    //     observable.value = value;
    //     observable.notify();
    //   }
    //   return observable;
    // },
    // /**
    //  * Debounce this Observable notifications.
    //  */
    // debounce: function() : Observable<T> {
    //   return observable;
    // }
  };
  return <Observable<T>>instance;
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
  musterPubs: (element: ParentNode) => this;
  musterSubs: (element: ParentNode) => this;
  muster: (element: ParentNode) => this;
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
     * Collect data pubs declared in given element for this Context.
     *
     * @note A pub is a sub that publishes its initial value as an observable to
     *       a context, i.e., it is immediately subscribed to this new
     *       observable value.
     */
    musterPubs: function (element: ParentNode): Context {
      const pub_nodes = [...element.querySelectorAll('[data-pub')];
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
     * @note If requested observable source is NOT found or available in
     *       this Context, record its name as a string placeholder.
     *
     * @todo Consider using a dictionnary and an identifier per sub.
     */
    musterSubs: function (element: ParentNode): Context {
      const sub_nodes = [...element.querySelectorAll('[data-sub]')];
      const length = sub_nodes.length;
      const subs: Sub<any>[] = Array(length);

      for (let i = 0; i < length; i++) {
        const source = sub_nodes[i].getAttribute('data-sub') ?? 'error';
        subs[i] = {
          source:
            context.pins[source] !== undefined ? context.pins[source] : source,
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
      for (const pin of Object.values(context.pins)) {
        (<Observable<any>>pin).notify();
      }
      return context;
    },
  };
  return <Context>context;
}
