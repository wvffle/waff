import { ref, watch } from '../src/main'

describe('watch', () => {
  it('should watch ref', () => {
    const data = ref(1)

    let effectsCalled = 0
    watch(data, (to, from) => {
      effectsCalled += 1
      expect(to).toBe(2)
      expect(from).toBe(1)
    })

    expect(effectsCalled).toBe(0)
    data.value += 1
    expect(effectsCalled).toBe(1)
  })

  it('should not infinite loop', () => {
    const data = ref(1)

    let effectsCalled = 0
    watch(data, (to, from) => {
      effectsCalled += 1
      expect(to).toBe(2)
      expect(from).toBe(1)
      expect(data.value).toBe(2)
    })

    data.value += 1
    expect(effectsCalled).toBe(1)
  })

  it('should watch ref immediately', () => {
    const data = ref(1)

    let effectsCalled = 0
    watch(data, (to, from) => {
      effectsCalled += 1

      if (effectsCalled === 1) {
        expect(to).toBe(1)
        expect(from).toBe(undefined)
      } else {
        expect(to).toBe(2)
        expect(from).toBe(1)
      }
    }, { immediate: true })

    expect(effectsCalled).toBe(1)
    data.value += 1
    expect(effectsCalled).toBe(2)
  })
})
