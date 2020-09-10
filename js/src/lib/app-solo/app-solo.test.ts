import {Context} from '.';

it('uses jsdom in this test file', () => {
  const element = document.createElement('div');
  expect(element).not.toBeNull();
});

describe('Context', () => {
  let context: Context;
  let element: HTMLElement;

  beforeEach(() => {
    context = new Context();
    element = document.createElement('div');
    element.innerHTML = `
      <span data-pub="test">test string</span>
      <span data-sub="test"></span>
      <input type="text" data-sub="test" data-prop="value" />
    `;
  });

  it('can create a new context', () => {
    // expect(context).any(Context);
    expect(context.pins).toStrictEqual({});
  });

  it('can muster pubs and subs from a parent Node', () => {
    context.muster(element);
    expect(context.pins).toEqual(
      expect.objectContaining({
        // test : expect.any(Observable);
        test: expect.anything(),
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

  it('throws when trying to muster an observable-less sub', () => {
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

  // it('leaves no danglings subs after a clear', () => {
  //   expect(context.pins).toStrictEqual({});
  // });
});
