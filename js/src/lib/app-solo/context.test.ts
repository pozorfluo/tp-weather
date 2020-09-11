import { Context, Observable } from '.';

it('uses jsdom in this test file', () => {
  const element = document.createElement('div');
  expect(element).not.toBeNull();
});

describe('Context', () => {
  let context: Context;
  let element: HTMLElement;

  beforeEach(() => {
    context = new Context();
    expect(context.subs).toStrictEqual([]);

    element = document.createElement('div');
    element.innerHTML = `
      <span data-pub="test">test string</span>
      <span data-sub="test"></span>
      <input type="text" data-sub="test" data-prop="value" />
    `;
  });

  it('can create a new Context', () => {
    expect(context).toEqual(expect.any(Context));
    // expect(context.pins).toStrictEqual({});
  });

  it('can muster pubs and subs from a parent Node', () => {
    context.muster(element);
    expect(context.pins).toEqual(
      expect.objectContaining({
        test: expect.any(Observable),
      })
    );
    expect(context.subs.length).toBe(3);
    expect(context.subs).toEqual(
      expect.arrayContaining(
        // [expect.any(Sub)],
        [
          expect.objectContaining({
            source: expect.anything(),
            target: expect.any(String),
            type: expect.any(String),
            node: expect.any(Node),
          }),
        ]
      )
    );
  });

  it('throws when trying to muster an pin-less sub', () => {
    element = document.createElement('div');
    element.innerHTML = `
      <span data-sub="pinDoesNotExist"></span>
    `;
    expect(() => {
      context.muster(element);
    }).toThrow();
  });

  it('throws when trying to activate a sub with an invalid data-prop', () => {
    element = document.createElement('div');
    element.innerHTML = `
      <span data-sub="test" data-prop="invalidTarget"></span>
    `;
    expect(() => {
      context.muster(element).activateSubs();
    }).toThrow();
  });

  it('can pub Observable of any type', () => {
    context
      .pub('test_string', new Observable<string>('a string'))
      .pub('test_number', new Observable<number>(1980))
      .pub(
        'test_object',
        new Observable<Object>({ test: 'a value' })
      );
    expect(context.pins).toEqual(
      expect.objectContaining({
        test_string: expect.any(Observable),
        test_number: expect.any(Observable),
        test_object: expect.any(Observable),
      })
    );
  });

  it('can pub Observable of any type with optional subscribers', () => {
    let target_a = '';
    let target_b = '';
    context.pub(
      'test_string',
      new Observable<string>('a string'),
      (value) => {
        target_a = value;
      },
      (value) => {
        target_b = value + value;
      }
    );
    // .activateSubs()

    expect(context.subs).toStrictEqual([]);
    context.pins.test_string.set('test');

    expect(target_a).toBe('test');
    expect(target_b).toBe('testtest');
  });

  it('allows its methods to be passed as callbacks', () => {});

  it('throws when trying to sub to an invalid pin', () => {});
  it('return null when trying to sub to an invalid pin', () => {});
  it('leaves no danglings subs after a clear', () => {
    // expect(context.pins).toStrictEqual({});
  });
});