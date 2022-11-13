import { compile } from '../src/main'

describe('test', () => {
  it('should compile', () => {
    const { scriptContent } = compile(`
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
        <div w-if="a === 4">
          {{ a }} is not eight...
        </div>
        <div w-else>
          E I G H T
        </div>
      </template>
    `)
    console.log(scriptContent)
  })
})
