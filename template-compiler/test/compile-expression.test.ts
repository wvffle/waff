import { compileExpression } from '../src/compile-expression'

describe('getters', () => {
  it('should create getter from variable', () => {
    const content = compileExpression('a')
    expect(content).to.eq('a.value')
  })

  it('should create getter for object variable', () => {
    const content = compileExpression('a.b')
    expect(content).to.eq('a.value.b')
  })

  it('should create getter for nested object variable', () => {
    const content = compileExpression('a.b.c')
    expect(content).to.eq('a.value.b.c')
  })

  it('should create getter for dynamic object variable', () => {
    const content = compileExpression('a[b]')
    expect(content).to.eq('a.value[b.value]')
  })
})

describe('string templates', () => {
  it('should substitute variable', () => {
    const content = compileExpression('`a${a}a`')
    expect(content).to.eq('`a${a.value}a`')
  })
})

describe('functions', () => {
  it('should create a getter for a function', () => {
    const content = compileExpression('a()')
    expect(content).to.eq('a.value()')
  })

  it('should create a getter for a nested function', () => {
    const content = compileExpression('a.b()')
    expect(content).to.eq('a.value.b()')
  })

  it('should create a getter for a deeply nested function', () => {
    const content = compileExpression('a.b.c()')
    expect(content).to.eq('a.value.b.c()')
  })

  it('should create a getter for a function arguments', () => {
    const content = compileExpression('a(b, c, d)')
    expect(content).to.eq('a.value(b.value, c.value, d.value)')
  })
})

describe('comparison and math', () => {
  it('should compare', () => {
    const content = compileExpression('a === 8')
    expect(content).to.eq('a.value === 8')
  })

  it('should add', () => {
    const content = compileExpression('a + b')
    expect(content).to.eq('a.value + b.value')
  })

  it('should work with or', () => {
    const content = compileExpression('a || b')
    expect(content).to.eq('a.value || b.value')
  })

  it('should work with BITOR', () => {
    const content = compileExpression('a | b')
    expect(content).to.eq('a.value | b.value')
  })

  it('should reassign variable', () => {
    const content = compileExpression('a = 8')
    expect(content).to.eq('a.value = 8')
  })

  it('should add and reassign variable', () => {
    const content = compileExpression('a += 8')
    expect(content).to.eq('a.value += 8')
  })

  it('should preincrement variable', () => {
    const content = compileExpression('++a')
    expect(content).to.eq('++a.value')
  })

  it('should postincrement variable', () => {
    const content = compileExpression('a++')
    expect(content).to.eq('a.value++')
  })

  it('should postincrement nested variable', () => {
    const content = compileExpression('a.b++')
    expect(content).to.eq('a.value.b++')
  })
})

describe('integration', () => {
  it('should not modify const variable', () => {
    const content = compileExpression('const a = 8')
    expect(content).to.eq('const a = 8')
  })

  it('should not modify let variable', () => {
    const content = compileExpression('let a = 8')
    expect(content).to.eq('let a = 8')
  })

  it('should not modify var variable', () => {
    const content = compileExpression('var a = 8')
    expect(content).to.eq('var a = 8')
  })
})
