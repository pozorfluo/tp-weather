import { deepFreeze } from './deep-freeze';
//------------------------------------------------------------------------------
describe('deepFreeze', () => {
  it('freezes enumerable own properties of given object', () => {
    const obj: any = {
      a: 0,
    };

    deepFreeze(obj);

    expect(() => {
      obj.a = 1;
    }).toThrow();
  });
  //----------------------------------------------------------------------------
  it('freezes non-enumerable own properties of given object', () => {
    const obj: any = {};
    Object.defineProperty(obj, 'a', { value: 0, enumerable: false });

    deepFreeze(obj);

    expect(() => {
      obj.a = 1;
    }).toThrow();
  });
  //----------------------------------------------------------------------------
  it('freezes nested properties of given object', () => {
    const obj: any = {
      a: {
        nested: 0,
      },
    };

    deepFreeze(obj);

    expect(Object.isFrozen(obj.a.nested)).toBe(true);
    expect(() => {
      obj.a.nested = 1;
    }).toThrow();
  });
  //----------------------------------------------------------------------------
  it('freezes nested properties of given object whose value is a function', () => {
    const obj: any = {
      a: {
        func: () => 1,
      },
    };

    deepFreeze(obj);

    expect(Object.isFrozen(obj.a.func)).toBe(true);

    expect(() => {
      obj.a.func = 0;
    }).toThrow();
  });

  // it('does not freeze properties on prototype of given object', () => {
  //   const obj: any = function test(){};
  //   obj.prototype.proto_prop = 0;
  //   const instance = new obj();

  //   deepFreeze(instance);

  //   expect(Object.isFrozen(instance.proto_prop)).toBe(false);
  //   expect(() => {
  //     instance.proto_prop = 1;
  //   }).not.toThrow();
  // });
  //----------------------------------------------------------------------------
  it('does not trip on circular references', () => {
    const obj: any = {
      a: {},
    };

    obj.a.circ_ref = obj;
    expect(Object.isFrozen(deepFreeze(obj))).toBe(true);
  });
});

// const obj = function test(){};
// obj.prototype.proto_prop = 0;
// const instance = new obj();

// Object.freeze(instance);
