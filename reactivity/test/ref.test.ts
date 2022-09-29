import { ref, isRef, toRaw, unwrap, watchEffect } from '../src/main'

describe('ref', () => {
  it('should return ref object', () => {
    const data = 1
    const state = ref(data)

    expect(state.value).toEqual(data)
  })

  it('should flatten nested ref', async () => {
    const state = ref(ref(1))
    expect(state.value).toBe(1)
  })

  it('should trigger effect', async () => {
    const state = ref(1)

    return new Promise(resolve => {
      let effectsCalled = 0
      watchEffect(() => {
        effectsCalled += 1
        if (state.value === 2) {
          expect(effectsCalled).toEqual(2)
          resolve(undefined)
        }
      })

      state.value += 1
    })
  })
})

describe('isRef', () => {
  it('should be ref', () => {
    const state = ref({ a: 1 })
    expect(isRef(state)).toBe(true)
  })

  it('should not be ref', () => {
    expect(isRef({ a: 1 })).toBe(false)
  })
})

describe('toRaw', () => {
  it('should return original object', () => {
    const data = { a: 1 }
    expect(toRaw(ref(data)) === data).toBe(true)
  })
})

describe('unwrap', () => {
  it('should unwrap ref', () => {
    const data = { a: 1 }
    expect(unwrap(ref(data)) === data).toBe(true)
  })

  it('should unwrap data', () => {
    const data = { a: 1 }
    expect(unwrap(data) === data).toBe(true)
  })
})
