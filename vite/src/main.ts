import type { Plugin } from "vite"
import { compile } from '@waff/template-compiler'

export default (): Plugin => {
  return {
    name: 'waff',
    transform (code, id) {
      if (id.endsWith('.waff')) {
        const compiledCode = compile(code, id)
        console.log(compiledCode)
        return compiledCode
      }

      return code
    }
  }
}
