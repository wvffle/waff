import { Element } from 'hast'
import { fromHtml } from 'hast-util-from-html'
import { compileElement, compileTemplate, compileText, createContext } from '../src/compile-template'

describe('compileText', () => {
  it('should inline expression', () => {
    const context = createContext()
    const content = compileText('{{ a }} === {{ "8" }}', context)
    expect(content).to.eq('`${a.value} === ${\\"8\\"}`,')
  })
})

describe('compileElement', () => {
  it('should compile div', () => {
    const context = createContext()
    const { children: [element] } = fromHtml('<div></div>', { fragment: true })
    const content = compileElement(element as Element, 0, context)
    expect(content).to.eq('$createElement(\'div\', {})')
  })

  it('should compile div with content', () => {
    const context = createContext()
    const { children: [element] } = fromHtml('<div>content</div>', { fragment: true })
    const content = compileElement(element as Element, 0, context)
    expect(content).to.eq('$createElement(\'div\', {}, [\n  `content`,\n])')
  })

  it('should compile div with inline expression', () => {
    const context = createContext()
    const { children: [element] } = fromHtml('<div>content {{a}}</div>', { fragment: true })
    const content = compileElement(element as Element, 0, context)
    expect(content).to.eq('$createElement(\'div\', {}, [\n  `content ${a.value}`,\n])')
  })

  describe('attributes', () => {
    it('should compile div with attributes', () => {
      const context = createContext()
      const { children: [element] } = fromHtml('<div id="eight">8</div>', { fragment: true })
      const content = compileElement(element as Element, 0, context)
      expect(content).to.eq('$createElement(\'div\', {"id":"eight"}, [\n  `8`,\n])')
    })

    it('should compile div with event attributes', () => {
      const context = createContext()
      const { children: [element] } = fromHtml('<div @click="eight">8</div>', { fragment: true })
      const content = compileElement(element as Element, 0, context)
      expect(content).to.eq('$createElement(\'div\', {"on":{"click":()=>{eight.value}}}, [\n  `8`,\n])')
    })

    // it('should compile div with dynamic attribute', () => {
    //   const context = createContext()
    //   const { children: [element] } = fromHtml('<div :id="eight">8</div>', { fragment: true })
    //   const content = compileElement(element as Element, 0, context)
    //   expect(content).to.eq('$createElement(\'div\', {"id":`${$unwrap("eight")}`}, [\n  `8`,\n])')
    // })

    describe('conditional rendering', () => {
      it('w-if', () => {
        const context = createContext()
        const { children: [element] } = fromHtml('<div w-if="eight">8</div>', { fragment: true })
        const content = compileElement(element as Element, 0, context)
        expect(content).to.eq('eight.value && $createElement(\'div\', {}, [\n  `8`,\n])')
      })

      it('w-else', () => {
        const context = createContext()
        const { children: [element] } = fromHtml('<div><div w-if="true"></div><div w-else>not 8</div></div>', { fragment: true })
        const content = compileElement(element as Element, 0, context)
        expect(content).to.eq('$createElement(\'div\', {}, [\n  true && $createElement(\'div\', {}) || $createElement(\'div\', {}, [\n    `not 8`,\n  ])\n])')
      })

      it('w-else-if', () => {
        const context = createContext()
        const { children: [element] } = fromHtml('<div><div w-if="true"></div><div w-else-if="seven">7</div></div>', { fragment: true })
        const content = compileElement(element as Element, 0, context)
        expect(content).to.eq('$createElement(\'div\', {}, [\n  true && $createElement(\'div\', {}) || seven.value && $createElement(\'div\', {}, [\n    `7`,\n  ])\n])')
      })
    })
  })

  describe('indentation', () => {
    it('indent level 1', () => {
      const context = createContext()
      const { children: [element] } = fromHtml('<div>content</div>', { fragment: true })
      const content = compileElement(element as Element, 1, context)
      expect(content).to.eq('$createElement(\'div\', {}, [\n    `content`,\n  ])')
    })

    it('indent level 2', () => {
      const context = createContext()
      const { children: [element] } = fromHtml('<div>content</div>', { fragment: true })
      const content = compileElement(element as Element, 2, context)
      expect(content).to.eq('$createElement(\'div\', {}, [\n      `content`,\n    ])')
    })

    it('indent level 3', () => {
      const context = createContext()
      const { children: [element] } = fromHtml('<div>content</div>', { fragment: true })
      const content = compileElement(element as Element, 3, context)
      expect(content).to.eq('$createElement(\'div\', {}, [\n        `content`,\n      ])')
    })

    it('indent level 4', () => {
      const context = createContext()
      const { children: [element] } = fromHtml('<div>content</div>', { fragment: true })
      const content = compileElement(element as Element, 4, context)
      expect(content).to.eq('$createElement(\'div\', {}, [\n          `content`,\n        ])')
    })
  })
})

describe('compileTemplate', () => {
  it('should compile template with single root element', () => {
    const { children } = fromHtml('<div>content</div>', { fragment: true })
    const content = compileTemplate(children, 'file.waff')
    expect(content).to.eq('$createElement(\'div\', {}, [\n    `content`,\n  ])')
  })

  it('should compile template with multiple root elements', () => {
    const { children } = fromHtml('<div>1</div><div>2</div>', { fragment: true })
    const content = compileTemplate(children, 'file.waff')
    expect(content).to.eq('$createElement(\'div\', {}, [\n  $createElement(\'div\', {}, [\n    `1`,\n  ]),\n  $createElement(\'div\', {}, [\n    `2`,\n  ])\n])')
  })
})
