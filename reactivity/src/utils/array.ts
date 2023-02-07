import { track, pauseTracking, resumeTracking } from '../effect'
import { toRaw } from './shared'

export const ARRAY_MODIFIERS = ['push', 'pop', 'splice', 'shift', 'unshift'] as const
export const ARRAY_ACCESSORS = ['includes', 'indexOf', 'lastIndexOf'] as const

const createArrayAccessor = (key: keyof typeof ARRAY_ACCESSORS) => function (this: unknown[], ...args: unknown[]) {
  const target = toRaw(this)
  const fn = (target as any)[key]

  for (let i = 0; i < target.length; ++i) {
    track(target, `${i}`)
  }

  const res = fn(...args)
  if (res === false || res === -1) {
    return fn(...args.map(toRaw))
  }

  return res
}

const createArrayModifier = (key: keyof typeof ARRAY_MODIFIERS) => function (this: unknown[], ...args: unknown[]) {
  const fn = toRaw(this as any)[key]

  pauseTracking()
  const result = fn.apply(this, args)
  resumeTracking()
  return result
}

export const arrayAccessors = {} as Record<keyof typeof ARRAY_ACCESSORS, Function>
for (const key of ARRAY_ACCESSORS) {
  arrayAccessors[key] = createArrayAccessor(key)
}

export const arrayModifiers = {} as Record<keyof typeof ARRAY_MODIFIERS, Function>
for (const key of ARRAY_MODIFIERS) {
  // @ts-expect-error Typescript is shit sometimes...
  arrayModifiers[key] = createArrayModifier(key)
}

export const isNewArrayKey = (target: unknown[], key: string | symbol) => {
  const numberKey = Number(key)
  return numberKey % 1 === 0 && numberKey >= 0 && numberKey < target.length
}
