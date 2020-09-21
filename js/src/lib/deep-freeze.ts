//------------------------------------------------------------------ deep-freeze
/**
 * Freeze own enumerable and non-enumerable properties of given object 
 * recursively.
 */
export const deepFreeze = function (obj: object): object {
  const props = Object.getOwnPropertyNames(obj);
  const length = props.length;

  Object.freeze(obj);

  for (let i = 0; i < length; i++) {
    const value = (<any>obj)[props[i]];
    if (value) {
      const type = typeof value;
      if (
        (type === 'object' || type === 'function') &&
        !Object.isFrozen(value)
      ) {
        deepFreeze(value);
      }
    }
  }
  return obj;
};