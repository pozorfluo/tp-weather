import { Trait } from '../komrad';

//------------------------------------------------------------------ app-solo.ts
/**
 * 
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
  _pending: number;
  _timeout: number;
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
    _pending: 0,
    _timeout: 0,
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
            console.log('set', instance._pending, instance.value);
            /* The buck stops here. */
            if (value !== instance.value) {
              instance.value = value;

              /** Cancel pending notification. */
              if (instance._pending) {
                window.cancelAnimationFrame(instance._pending);
                console.log('Cancel notify', instance._pending, instance.value);
              }

              /** Schedule notification on next frame. */
              instance._pending = window.requestAnimationFrame(function () {
                instance.notify();
                console.log(' ----> Notify', instance._pending, instance.value);
                instance._pending = 0;
              });
              console.log('Schedule notify', instance._pending, instance.value);
            }
            return instance;
          };
        case RateLimit.throttle:
          /**
           * If there is no pending notification
           *
           *     Notify immediately
           *   Else
           *     Schedule notification
           */
          return function (value: T): Observable<T> {
            /* The buck stops here. */
            if (value !== instance.value) {
              instance.value = value;

              if (!instance._pending) {
                /** Notify immediately if not on timeout. */
                if (!instance._timeout) {
                  instance.notify();
                  console.log(
                    '----> LeadNotify',
                    instance._pending,
                    instance.value
                  );
                  /** Prevent further immediate notification until next frame. */
                  instance._timeout = window.requestAnimationFrame(
                    () => (instance._timeout = 0)
                  );
                } else {
                  /** Schedule notification on next frame. */
                  instance._pending = window.requestAnimationFrame(function (
                    now: DOMHighResTimeStamp
                  ) {
                    window.cancelAnimationFrame(instance._pending);

                    instance.notify();
                    console.log(
                      ' ----> Notify',
                      instance._pending,
                      instance.value,
                      now
                    );
                    instance._pending = 0;
                  });
                  console.log(
                    'Schedule notify',
                    instance._pending,
                    instance.value
                  );
                }
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