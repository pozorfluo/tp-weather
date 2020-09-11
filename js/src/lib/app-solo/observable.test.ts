import { Observable, RateLimit } from '.';

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

  it('can have its set method passed as a callback safely', () => {
    const observable = new Observable<string>('a string', RateLimit.none);
    let target = '';
    observable.subscribe((value) => {target = value;});

    observable.set('regular call');
    expect(target).toBe('regular call');
    
    const another_context = observable.set;
    another_context('from another context');
    expect(target).toBe('from another context');
  });

  it('allows its methods to be passed as callbacks', () => {});

  it('leaves no danglings subs after a clear', () => {
    // expect(context.pins).toStrictEqual({});
  });
});
