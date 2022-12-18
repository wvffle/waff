import type { Ref, MaybeRef } from '../ref'
import type { Reactive } from '../reactive'

import { unwrap } from '../ref'

export const REACTIVE_TARGET = Symbol('TARGET')

export const IS_COMPUTED = Symbol('IS_COMPUTED')
export const IS_REACTIVE = Symbol('IS_REACTIVE')
export const IS_REF = Symbol('IS_REF')

export const isReactive = <T>(target: T): target is Reactive<T> => typeof target === 'object' && (target as any)[IS_REACTIVE] === true

export function isRef<T>(target: MaybeRef<T>): target is Ref<T>
export function isRef(target: any): target is Ref {
  return typeof target === 'object' && target[IS_REF] === true
}

export const toRaw = <T>(target: MaybeRef<T>): T => {
  if (isRef(target)) {
    return unwrap(target)
  }

  if (isReactive(target)) {
    return target[REACTIVE_TARGET]
  }

  return target
}

export const toRefs = <T extends object>(target: T): Record<keyof T, Ref<T[keyof T]>> => {
  const refs = Object.create(null)

  for (const key in target) {
    refs[key] = {
      get [IS_REF] (): true {
        return true
      },

      get value () {
        return isRef(target[key])
          ? (target[key] as Ref<T[Extract<keyof T, string>]>).value
          : target[key]

      },

      set value (value) {
        target[key] = value
      }
    }
  }

  return refs
}
