import { compileScript } from '../src/compile-script'

describe('returns', () => {
  describe('imports', () => {
    it('aggregates import default returns', () => {
      const { returns } = compileScript('import x from "y"', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq(['x'])
    })

    it('does not aggregate import default returns starting with \'$\'', () => {
      const { returns } = compileScript('import $x from "y"', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq([])
    })

    it('aggregates named import returns', () => {
      const { returns } = compileScript('import { x, y, $z } from "q"', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq(['x', 'y'])
    })

    it('aggregates named import as other name returns', () => {
      const { returns } = compileScript('import { x, y, z as a, q as $q } from "q"', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq(['x', 'y', 'a'])
    })

    it('aggregates import * returns', () => {
      const { returns } = compileScript('import * as x from "q"', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq(['x'])
    })

    it('does not aggregate import * returns starting with \'$\'', () => {
      const { returns } = compileScript('import * as $x from "q"', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq([])
    })
  })

  describe('functions', () => {
    it('aggregates function names', () => {
      const { returns } = compileScript('function a() {}', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq(['a'])
    })

    it('does not aggregate function names starting with \'$\'', () => {
      const { returns } = compileScript('function $unwrap() {}', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq([])
    })

    it('aggregates async function names', () => {
      const { returns } = compileScript('async function a() {}', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq(['a'])
    })

    it('aggregates generator function names', () => {
      const { returns } = compileScript('function* a() {}', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq(['a'])
    })
  })

  describe('variables', () => {
    it('aggregates const names', () => {
      const { returns } = compileScript('const a = () => {}', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq(['a'])
    })

    it('does not aggregate const names starting with \'$\'', () => {
      const { returns } = compileScript('const $a = () => {}', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq([])
    })

    it('aggregates let names', () => {
      const { returns } = compileScript('let a = () => {}', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq(['a'])
    })

    it('does not aggregate let names starting with \'$\'', () => {
      const { returns } = compileScript('let $a = () => {}', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq([])
    })

    it('aggregates var names', () => {
      const { returns } = compileScript('var a = () => {}', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq(['a'])
    })

    it('does not aggregate var names starting with \'$\'', () => {
      const { returns } = compileScript('var $a = () => {}', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq([])
    })

    it('aggregates multiple var names', () => {
      const { returns } = compileScript('var a = 1, b = 4, $c = 2', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq(['a', 'b'])
    })

    it('aggregates multiple let names', () => {
      const { returns } = compileScript('let a = 1, b = 4, $c = 2', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq(['a', 'b'])
    })

    it('aggregates multiple const names', () => {
      const { returns } = compileScript('const a = 1, b = 4, $c = 2', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq(['a', 'b'])
    })
  })

  describe('block', () => {
    it('does not aggregate names from inner blocks', () => {
      const { returns } = compileScript('{ const a = () => {} }', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq([])
    })

    it('does not aggregate names from for loop', () => {
      const { returns } = compileScript('for (0 a = 0; a < 8; ++a) { const a = () => {} }', 'file.waff')
      expect(Object.keys(returns)).to.deep.eq([])
    })
  })
})

describe('setupText', () => {
  it('empty setup returns object', () => {
    const { setupText } = compileScript('', 'file.waff')
    expect(setupText).to.eq('    return {\n      \n    }')
  })

  it('const is handled correctly', () => {
    const { setupText } = compileScript('const a = 8', 'file.waff')
    expect(setupText).to.eq('    const a = 8;\n    return {\n      a\n    }')
  })

  it('let is handled correctly', () => {
    const { setupText } = compileScript('let a = 8', 'file.waff')
    expect(setupText).to.eq('    let a = 8;\n    return {\n      get a () { return a },\n      set a (value) { a = value }\n    }')
  })
})

describe('defineProps', () => {
  it('compiler should find all props defined by defineProps()', () => {
    const { props } = compileScript('defineProps<{ a: number, b: number }>()', 'file.waff')
    expect(props).to.deep.eq(['a', 'b'])
  })

  it('compiler shouldn\'t find props starting with \'$\'', () => {
    const { props } = compileScript('defineProps<{ a: number, $b: number }>()', 'file.waff')
    expect(props).to.deep.eq(['a'])
  })

  it('plain call to defineProps() shouldn\'t generate new code', () => {
    const { setupText } = compileScript('defineProps<{ a: number, b: number }>()', 'file.waff')
    expect(setupText).to.eq('    return {\n      \n    }')
  })

  it('compiler should find all props defined by const props = defineProps()', () => {
    const { props } = compileScript('const props = defineProps<{ a: number, b: number }>()', 'file.waff')
    expect(props).to.deep.eq(['a', 'b'])
  })

  it('const props = defineProps() should generate new code', () => {
    const { setupText } = compileScript('const props = defineProps<{ a: number, b: number }>()', 'file.waff')
    expect(setupText).to.eq('    const props = $props;\n    return {\n      props\n    }')
  })

  it('const props = dontDefineProps() shouldn\'t be handled by defineProps handler', () => {
    const { setupText } = compileScript('const props = dontDefineProps<{ a: number, b: number }>()', 'file.waff')
    expect(setupText).to.eq('    const props = dontDefineProps();\n    return {\n      props\n    }')
  })
})
