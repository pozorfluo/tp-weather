import { Observable, RateLimit, Subscriber } from '.';

it('uses jsdom in this test file', () => {
  const element = document.createElement('div');
  expect(element).not.toBeNull();
});

describe('Observable', () => {
  it('throws if its constructor is not called with new', () => {
    expect(() => {
      (Observable as any)();
    }).toThrow();
  });

  it('can create a new Observable of any type', () => {
    expect(new Observable<string>('a string')).toEqual(expect.any(Observable));
    expect(new Observable<number>(2020)).toEqual(expect.any(Observable));
    expect(
      new Observable<Object>({ test: 'a value' })
    ).toEqual(expect.any(Observable));
    expect(
      new Observable<string[]>(['test', 'a value'])
    ).toEqual(expect.any(Observable));
  });

  // it.each([
  //   ['string', 'a string'],
  //   ['number', 2020],
  //   ['Object', { test: 'a value' }],
  //   ['string[]', ['test', 'a value']],
  //   ['function', () => 'value'],
  // ])('can create a new Observable of type %s', (type, value) => {
  //   expect(new Observable(value)).toEqual(expect.any(Observable));
  // });

  it('can return its value', () => {
    const observable = new Observable('a string');
    expect(observable.get()).toBe('a string');
  });

  it('can have its set method passed as a callback safely', () => {
    const observable = new Observable('a string', RateLimit.none);
    let target = '';
    observable.subscribe((value) => {
      target = value;
    });

    observable.set('regular call');
    expect(target).toBe('regular call');

    const another_context = observable.set;
    another_context('from another context');
    expect(target).toBe('from another context');
  });

  describe('subscribers', () => {
    let observable: Observable<any>;
    let subscribers: Subscriber<any>[];
    let targets: string[];

    beforeEach(() => {
      observable = new Observable('a string', RateLimit.none);
      subscribers = [];
      targets = ['', '', ''];
      targets.forEach((v, i) => {
        subscribers.push((value) => {
          targets[i] = value;
        });
        observable.subscribe(subscribers[i]);
      });
    });

    it('can subscribe callbacks', () => {
      observable.set('test');
      targets.forEach((v) => expect(v).toBe('test'));
    });

    it('can subscribe callbacks with a specific priority', () => {
      let me_first = '';
      observable.subscribe((v) => {
        me_first = targets[0] === 'test' ? 'fail' : 'success';
      }, 0);
      observable.set('test');
      expect(me_first).toBe('success');
    });

    it('can drop all subscribers', () => {
      observable.dropAll();
      observable.set('test');
      targets.forEach((v) => expect(v).toBe(''));
    });

    it('can drop a specific subscriber given its reference', () => {
      observable.set('test');
      subscribers.forEach((s, i) => {
        observable.drop(s);
        observable.set('test' + i);
        expect(targets[i]).toBe('test');
        observable.set('test');
      });
    });
  });

  describe('rate limiting', () => {
    it('can debounce notifications', (done) => {
      let count = 0;
      let target = 0;
      const observable = new Observable(0, RateLimit.debounce);
      observable.subscribe((v) => {
        target = v;
        count++;
      });
      for (let i = 0; i < 1000; i++) {
        observable.set(i);
      }
      window.requestAnimationFrame(() => {
        done();
        expect(count).toBe(1);
        expect(target).toBe(observable.get());
      });
    });

    it('can throttle notifications', (done) => {
      let count = 0;
      let target = 0;
      const observable = new Observable(0, RateLimit.throttle);
      observable.subscribe((v) => {
        target = v;
        count++;
      });
      for (let i = 0; i < 1000; i++) {
        observable.set(i);
      }
      window.requestAnimationFrame(() => {
        done();
        expect(count).toBe(2);
        expect(target).toBe(observable.get());
      });
    });
  });
});
