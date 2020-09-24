import { sequencer } from './sequencer';
//------------------------------------------------------------------------------
describe('sequencer', () => {
  //----------------------------------------------------------------------------
  describe('using array of primitives', () => {
    const numbers = [0, 1, 2];

    let sequencer_num: Generator<number, never, number>;

    beforeEach(() => {
      sequencer_num = sequencer(numbers);
    });
    //--------------------------------------------------------------------------
    it('wraps around its steps', () => {
      expect(sequencer_num.next().value).toBe(0);
      expect(sequencer_num.next().value).toBe(1);
      expect(sequencer_num.next().value).toBe(2);
      expect(sequencer_num.next().value).toBe(0);
    });
    //--------------------------------------------------------------------------
    it('after the first call to next(), can set its internal cursor to given existing step', () => {
      expect(sequencer_num.next().value).toBe(0);
      expect(sequencer_num.next(2).value).toBe(2);
      expect(sequencer_num.next(1).value).toBe(1);
    });
    //--------------------------------------------------------------------------
    it('yields next value when given invalid step', () => {
      expect(sequencer_num.next(3).value).toBe(0);
      expect(sequencer_num.next(400).value).toBe(1);
      expect(sequencer_num.next(-1).value).toBe(2);
    });
  });
  //----------------------------------------------------------------------------
  describe('using array of objects', () => {
    const objects = [{ a: 0 }, { a: 1 }, { a: 2 }];

    let sequencer_obj: Generator<object, never, object>;

    beforeEach(() => {
      sequencer_obj = sequencer(objects);
    });
    //--------------------------------------------------------------------------
    it('wraps around its steps', () => {
      expect(sequencer_obj.next().value).toBe(objects[0]);
      expect(sequencer_obj.next().value).toBe(objects[1]);
      expect(sequencer_obj.next().value).toBe(objects[2]);
      expect(sequencer_obj.next().value).toBe(objects[0]);
    });
    //--------------------------------------------------------------------------
    it('after the first call to next(), can set its internal cursor to given existing step', () => {
      expect(sequencer_obj.next().value).toBe(objects[0]);
      expect(sequencer_obj.next(objects[2]).value).toBe(objects[2]);
      expect(sequencer_obj.next(objects[1]).value).toBe(objects[1]);
    });
    //--------------------------------------------------------------------------
    it('yields next value when given invalid step', () => {
      expect(sequencer_obj.next({ random: 1 }).value).toBe(objects[0]);
      expect(sequencer_obj.next({ a: 0 }).value).toBe(objects[1]);
      expect(sequencer_obj.next({ a: 1 }).value).toBe(objects[2]);
    });
    //--------------------------------------------------------------------------
    it('yields references to given objects, not new objects', () => {
      expect(sequencer_obj.next().value).toBe(objects[0]);
      objects[1] = { mutated: true } as any;
      expect(sequencer_obj.next().value).toEqual({ mutated: true });
    });
  });
});
