//-------------------------------------------------------------------- sequencer
/**
 * Return a generator that wraps around a given array of steps.
 *
 * Created generator will move its internal cursor to optional given step on
 * next() call if given step exists.
 *   i.e.: generator.next('stepValue');
 * 
 * @note Sequencing array of objects is possible with the following caveat :
 *         - Objects are only referenced,not deep copied i.e., it is these 
 *           references that will be sequenced. If the referenced objects are
 *           mutated outside the sequencer, the value returned from the 
 *           sequencer will reflect that.
 *         - To set the internal cursor to a specific step, a reference to the
 *           original object must be passed. An otherwise equivalent object 
 *           will not work.
 */
export const sequencer = function* <T>(steps: T[]): Generator<T, never, T> {
  const length = steps.length;
  for (let i = 0; ; ) {
    if (i >= length) {
      i = 0;
    }
    const requested = yield steps[i];
    const requested_index =
      requested !== undefined ? steps.indexOf(requested) : -1;
    i = requested_index !== -1 ? requested_index : i + 1;
  }
};
