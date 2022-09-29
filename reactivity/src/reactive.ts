import { IS_REACTIVE, REACTIVE_TARGET, isReactive, isRef } from './utils/shared'
import { arrayAccessors, arrayModifiers, isNewArrayKey } from './utils/array'
import { track, trigger } from './effect'
import { not } from './utils/logic'

const NEW_KEY_ADDED = Symbol('NEW_KEY_ADDED')

export type Reactive<T = object> = T & {
  [REACTIVE_TARGET]: T,
  [IS_REACTIVE]: true
}

interface CreateReactiveOptions {
  shallow: boolean
}

export const createReactive = <T extends object | Array<K>, K>(target: T, options: Partial<CreateReactiveOptions> = {}) => {
  const trackableNewKey = Array.isArray(target) ? 'length' : NEW_KEY_ADDED

  const get = (target: object, key: string | symbol, receiver: object) => {
    if (key === IS_REACTIVE) return true
    if (key === REACTIVE_TARGET) return target

    if (Array.isArray(target) && typeof key === 'string') {
      if (key in arrayAccessors) {
        return Reflect.get(arrayAccessors, key, receiver)
      }

      if (key in arrayModifiers) {
        return Reflect.get(arrayModifiers, key, receiver)
      }
    }

    const value = Reflect.get(target, key, receiver)

    // Do not track prototype and symbols
    if (key === '__proto__' || typeof key === 'symbol') {
      return value
    }

    track(target, key)

    if (options.shallow) {
      return value
    }

    if (isRef(value)) {
      return value.value
    }

    // Deep reactivity
    if (typeof value === 'object') {
      return reactive(value)
    }

    return value
  }

  const set = (target: object, key: string | symbol, value: unknown, receiver: object) => {
    const oldValue: unknown = target[key as keyof typeof target]

    // Update ref keys
    // NOTE: If value itself is a ref, then we overwrite the key
    if (!isRef(value) && isRef(oldValue)) {
      oldValue.value = value
      return true
    }

    const existed = Array.isArray(target)
      ? isNewArrayKey(target, key)
      : key in target

    const result = Reflect.set(target as object, key, value, receiver)

    // Trigger id didn't have that key before
    if (!existed) {
      trigger(target, trackableNewKey)
    }

    // Trigger only on change
    if (not(value, oldValue)) {
      trigger(target, key)
    }

    return result
  }

  const deleteProperty = (target: object, key: string | symbol) => {
    const existed = key in target
    const result = Reflect.deleteProperty(target, key)

    if (result && existed) {
      trigger(target, key)
    }

    return result
  }

  const has = (target: object, key: string | symbol) => {
    const result =  Reflect.has(target, key)
    if (typeof key !== 'symbol') {
      track(target, key)
    }

    return result
  }

  const ownKeys = (target: object) => {
    track(target, trackableNewKey)
    return Reflect.ownKeys(target)
  }

  return new Proxy(target, {
    get,
    set,
    deleteProperty,
    has,
    ownKeys
  })
}

export const reactive = <T extends object>(target: T, shallow = false): Reactive<T> => {
  if (isReactive(target)) {
    return target
  }

  return createReactive(target, {
    shallow
  }) as Reactive<T>
}
