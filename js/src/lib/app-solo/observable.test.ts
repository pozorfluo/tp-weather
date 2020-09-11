import { Observable, RateLimit } from '.';
import { Subscriber } from './observable';

it('uses jsdom in this test file', () => {
  const element = document.createElement('div');
  expect(element).not.toBeNull();
});

describe('Observable', () => {
  // beforeEach(() => {
  // });

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

  it.each([
    ['string', 'a string'],
    ['number', 2020],
    ['Object', { test: 'a value' }],
    ['string[]', ['test', 'a value']],
    ['function', () => 'value'],
  ])('can create a new Observable of type %s', (type, value) => {
    expect(new Observable(value)).toEqual(expect.any(Observable));
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
});
