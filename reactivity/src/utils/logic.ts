import { MaybeRef, unwrap } from '../ref'

export const not = <T>(ref1: MaybeRef<T>, ref2: MaybeRef<T>) => !equals(ref1, ref2)
export const equals = <T>(ref1: MaybeRef<T>, ref2: MaybeRef<T>) => {
  return unwrap(ref1) === unwrap(ref2)
}
