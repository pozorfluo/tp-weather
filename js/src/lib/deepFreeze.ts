/**
 * Freeze recursively enumerable and non-enumerable properties found directly
 * on given object.
 */
export const deepFreeze = function (obj: object): object {
  const props = Object.getOwnPropertyNames(obj);
  const length = props.length;

  Object.freeze(obj);

  for (let i = 0; i < length; i++) {
    const value = (<any>obj)[props[i]];
    if (value) {
      const type = typeof value;
      /** @todo Check if isFrozen() is enough to avoid circular refs. */
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