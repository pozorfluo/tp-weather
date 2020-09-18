/**
 * Return a generator that wraps around a given array of steps.
 *
 * Created generator will move its internal cursor to optional given step on
 * next() call if given step exists.
 *   i.e.: generator.next('stepValue');
 */
export const sequencer = function* <T>(steps: T[]): Generator<T, never, T> {
  const length = steps.length;
  for (let i = 0; ; ) {
    if (i >= length) {
      i = 0;
    }
    // } else if (i < 0) {
    //   i = length - 1;
    // }
    const requested = yield steps[i];
    const requested_index =
      requested !== undefined ? steps.indexOf(requested) : -1;
    i = requested_index !== -1 ? requested_index : i + 1;
  }
};
