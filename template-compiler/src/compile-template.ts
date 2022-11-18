import { RootContent, Element } from "hast"

interface CompilerContext {
  previous?: Element
  parent?: Element
  isInsideCondition: boolean
  conditionText: string
}

const createContext = (): CompilerContext => ({
  conditionText: '',
  isInsideCondition: false
})

const compileText = (content: string) => {
  // TODO: parse expression
  return JSON.stringify(content.trim().replace(/{{\s*(.+?)\s*}}/g, 'EXPR<$1>')) + ','
}

const compileElement = (element: Element, level: number, context: CompilerContext): string => {
  const attrs = element.properties ?? {}

  let condition = ''
  for (const attr in attrs) {
    if (/^w-\w+/.test(attr)) {
      // TODO: parse expression
      const value = attrs[attr]
      delete attrs[attr]

      switch (attr) {
        case 'w-if':
          condition = `${value} && `
          context.isInsideCondition = true
          break
        case 'w-else-if':
          condition = `|| ${value} && `
          context.isInsideCondition = true
          break
        case 'w-else':
          condition = '|| '
          context.isInsideCondition = true
          break
        default:
          // TODO: Handle custom directives
      }
    }
  }

  if (element.children.length) {
    context.previous = undefined
    context.parent = element
    const childArray = compileTemplate(element.children, level + 1)
    context.parent = undefined

    return `${condition}createElement('${element.tagName}', ${JSON.stringify(attrs)}, ${childArray})`
  } else {
    return `${condition}createElement('${element.tagName}', ${JSON.stringify(attrs)})`
  }
}

export const compileTemplate = (children: RootContent[], level = 1, context = createContext()) => {
  const result = []
  for (const child of children) {
    switch (child.type) {
      case 'text':
        if (!/^\s+$/.test(child.value)) {
          result.push(compileText(child.value))
          context.previous = undefined
        }
        break

      case 'element': {
        const text = compileElement(child, level, context)

        if (context.isInsideCondition) {
          context.conditionText += text
          context.isInsideCondition = false
        } else {
          if (context.conditionText !== '') {
            result.push(context.conditionText)
            context.conditionText = ''
          }

          result.push(text)
        }

        context.previous = child
        break
      }

      default:
        throw new Error(`Unknown type: ${child.type}`)
    }
  }

  const spacing = '  '.repeat(level)
  return `[\n${spacing}${result.join(`,\n${spacing}`)}\n${spacing.slice(2)}]`
}
