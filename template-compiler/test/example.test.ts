import { compile } from '../src/main'

describe('test', () => {
  it('should compile', () => {
    const { templateContent } = compile(`
      <script>
        const a: number = 7
        var b = 1
        let c = a + b
        function d () {
          c = c * 2
        }

        if (c === 8) {
          const u = 4
        }

        setTimeout(() => {
          const z = a + b
          return z
        }, 400)
      </script>

      <template>
        <p>test1</p>
        <div w-if="a === 4">
          {{ a }} is not eight...
        </div>
        <div w-else-if="a === 3">
          {{ a }} is not eight... IT IS 3!
        </div>
        <div w-else>
          E I G H T
        </div>
        <span>test2</span>
      </template>
    `)
    console.log(templateContent)
  })
})
