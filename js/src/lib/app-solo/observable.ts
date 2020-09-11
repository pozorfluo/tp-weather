// import { Trait } from '../komrad';

//-------------------------------------------------------------- app-solo.ts ---
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
  //   [extension: string]: any; // open for extension.
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
// }E

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
// export function newObservable<T>(
//   value: T,
//   // options?: ObservableOptions
//   rateLimit: RateLimit = RateLimit.throttle
// ): Observable<T> {
const observable: any = {
  // subscribers: [],
  // value: value,
  // /** Internal state for rate limiting if any. */
  // _pending: 0,
  // _timeout: 0,
  /**
   *
   */
  // notify: async function (): Promise<Observable<T>> {
  notify: function <T>(): Observable<T> {
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
    return observable;
  },
  /**
   *
   */
  subscribe: function <T>(
    subscriber: Subscriber<T>,
    priority?: number
  ): Observable<T> {
    if (priority === undefined) {
      this.subscribers.push(subscriber);
    } else {
      this.subscribers.splice(priority, 0, subscriber);
    }
    return observable;
  },
  /**
   *
   */
  flush: function <T>(): Observable<T> {
    this.subscribers = [];
    return observable;
  },
  /**
   *
   */
  get: function <T>(): T {
    /* Notify that a read is happening here if necessary. */
    return this.value;
  },
  /**
   * @todo See how wasteful this experiment to avoid a branch is when using
   *       prototype/ctor.
   * @todo Consider having 'set' point to internal function on prototype.
   */
  // set: options?.debounce
  setUnbound: function <T>(value: T): Observable<T> {
    /* The buck stops here. */
    if (value !== this.value) {
      this.value = value;
      this.notify();
    }
    return observable;
  },

  setDebounced: function <T>(value: T): Observable<T> {
    console.log('set', this._pending, this.value);
    /* The buck stops here. */
    if (value !== this.value) {
      this.value = value;

      /** Cancel pending notification. */
      if (this._pending) {
        window.cancelAnimationFrame(this._pending);
        console.log('Cancel notify', this._pending, this.value);
      }

      /** Schedule notification on next frame. */
      this._pending = window.requestAnimationFrame( () => {
        this.notify();
        console.log(' ----> Notify', this._pending, this.value);
        this._pending = 0;
      });
      console.log('Schedule notify', this._pending, this.value);
    }
    return observable;
  },

  /**
   * If there is no pending notification
   *
   *     Notify immediately
   *   Else
   *     Schedule notification
   */
  setThrottled: function <T>(value: T): Observable<T> {
    /* The buck stops here. */
    if (value !== this.value) {
      this.value = value;

      if (!this._pending) {
        /** Notify immediately if not on timeout. */
        if (!this._timeout) {
          this.notify();
          console.log(
            '----> LeadNotify',
            this._pending,
            this.value
          );
          /** Prevent further immediate notification until next frame. */
          this._timeout = window.requestAnimationFrame(
            () => (this._timeout = 0)
          );
        } else {
          /** Schedule notification on next frame. */
          this._pending = window.requestAnimationFrame( (
            now: DOMHighResTimeStamp
          ) => {
            window.cancelAnimationFrame(this._pending);

            this.notify();
            console.log(
              ' ----> Notify',
              this._pending,
              this.value,
              now
            );
            this._pending = 0;
          });
          console.log('Schedule notify', this._pending, this.value);
        }
      }
    }
    return observable;
  },
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
//   return <Observable<T>>observable;
// }

/**
 * Create a new Observable object
 */
export type ObservableCtor = {
  new <T>(value: T, rateLimit?: RateLimit): Observable<T>;
};

export const Observable = (function <T>(
  this: Observable<T>,
  value: T,
  rateLimit: RateLimit = RateLimit.throttle
): Observable<T> {
  if (!new.target) {
    throw 'Observable() must be called with new !';
  }
  this.subscribers = [];
  this.value = value;
  /** Internal state for rate limiting if any. */
  this._pending = 0;
  this._timeout = 0;
  this.set = ((rateLimit: RateLimit) => {
    switch (rateLimit) {
      case RateLimit.none:
        return observable.setUnbound;
      case RateLimit.debounce:
        return observable.setDebounced;
      case RateLimit.throttle:
        return observable.setThrottled;
    }
  })(rateLimit);
  return this;
} as any) as ObservableCtor;

Observable.prototype = observable;

// /**
//  * Define Observable trait.
//  */
// export function withObservable<T>(
//   name: string,
//   value: T
// ): Observable<T> & Trait {
//   const trait: any = { observable: {} }; //  Record<string, Observable<T>>
//   trait.observable[name] = newObservable<T>(value);
//   return <Observable<T> & Trait>trait;
// }
