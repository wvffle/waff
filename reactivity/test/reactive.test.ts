import { reactive, isReactive, toRaw, watchEffect } from '../src/main'

describe('reactive', () => {
  it('should return proxied object', () => {
    const data = {
      a: 1,
      b: 'waff',
      c: true,
    }

    const state = reactive(data)
    expect(data).toEqual(state)
  })

  it('should trigger effect', async () => {
    const state = reactive({ a: 1 })

    return new Promise(resolve => {
      let effectsCalled = 0
      watchEffect(() => {
        effectsCalled += 1

        if (state.a === 2) {
          expect(effectsCalled).toEqual(2)
          resolve(undefined)
        }
      })

      state.a += 1
    })
  })

  it('should trigger deep effect', async () => {
    const state = reactive({ a: 1, b: { c: 1 } })

    return new Promise(resolve => {
      let effectsCalled = 0
      watchEffect(() => {
        effectsCalled += 1

        if (state.b.c === 2) {
          expect(effectsCalled).toEqual(2)
          resolve(undefined)
        }
      })

      state.b.c += 1
    })
  })

  it('should not trigger deep effect with shallow reactive', async () => {
    const state = reactive({ a: 1, b: { c: 1 } }, true)

    return new Promise(resolve => {
      let effectsCalled = 0
      watchEffect(() => {
        effectsCalled += 1
        if (state.b.c === 2) {}
      })

      state.b.c += 1

      setTimeout(() => {
        expect(effectsCalled).toEqual(1)
        resolve(undefined)
      }, 100)
    })
  })

  it('should trigger effect with new key', async () => {
    const state = reactive<{ a: number, b?: number }>({ a: 1 })

    return new Promise(resolve => {
      let effectsCalled = 0
      watchEffect(() => {
        effectsCalled += 1

        if (state.b === 1) {
          expect(effectsCalled).toEqual(2)
          resolve(undefined)
        }
      })

      state.b = 1
    })
  })
})

describe('isReactive', () => {
  it('should be reactive', () => {
    const state = reactive({ a: 1 })
    expect(isReactive(state)).toBe(true)
  })

  it('should not be reactive', () => {
    expect(isReactive({ a: 1 })).toBe(false)
  })
})

describe('toRaw', () => {
  it('should return original object', () => {
    const data = { a: 1 }
    expect(toRaw(reactive(data)) === data).toBe(true)
  })
})
