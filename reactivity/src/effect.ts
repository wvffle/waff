import { isNewArrayKey } from "./utils"

const targetMap = new WeakMap<object, Map<string | symbol, Set<Effect>>>()

let activeEffect: Effect | undefined
let shouldTrack = false

const trackStack: boolean[] = []
const stack: Effect[] = []

export class Effect {
  #deps = new Set<Set<Effect>>()
  #runner: Function

  constructor (runner: () => void) {
    this.#runner = runner
    this.run()
  }

  track (dep: Set<Effect>) {
    this.#deps.add(dep)
    dep.add(this)
  }

  run () {
    if (stack.includes(this)) {
      return
    }

    activeEffect = this
    stack.push(this)
    resumeTracking()

    this.#runner()

    resetTracking()
    stack.pop()

    activeEffect = stack[stack.length - 1]
  }

  stop () {
    for (const dep of this.#deps) {
      dep.delete(this)
      this.#deps.delete(dep)
    }
  }
}

export const createEffect = (runner: () => void) => new Effect(runner)

export const resetTracking = () => {
  shouldTrack = trackStack.pop() || true
}

export const resumeTracking = () => {
  trackStack.push(shouldTrack)
  shouldTrack = true
}

export const pauseTracking = () => {
  trackStack.push(shouldTrack)
  shouldTrack = false
}

export const track = (target: object, key: string | symbol) => {
  if (!shouldTrack || activeEffect === undefined) {
    return
  }

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, depsMap = new Map<string | symbol, Set<Effect>>())
  }

  let dep = depsMap.get(key)

  if (!dep) {
    depsMap.set(key, dep = new Set())
  }

  activeEffect.track(dep)
}

export const trigger = (target: object, key: string | symbol) => {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const deps: Set<Effect>[] = []
  if (depsMap.has(key)) {
    deps.push(depsMap.get(key)!)

    if (key === 'length' && Array.isArray(target)) {
      for (const [key, dep] of depsMap.entries()) {
        if (isNewArrayKey(target, key)) {
          deps.push(dep)
        }
      }
    }
  }

  for (const dep of deps) {
    for (const effect of dep) {
      if (effect !== activeEffect) {
        effect.run()
      }
    }
  }
}
