import { newContext } from './lib/app-solo';
import { Context } from 'vm';

// const sum = require('./script');

// import { newTimer } from './script';

it('uses jsdom in this test file', () => {
  const element = document.createElement('div');
  expect(element).not.toBeNull();
});

describe('Context', () => {
  let context: Context;
  let element: HTMLElement;

  beforeEach(() => {
    context = newContext();
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

  it('can muster pubs and subs from a parent element', () => {
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

  it('leaves no danglings subs after a clear', () => {
    expect(context.pins).toStrictEqual({});
  });
});
