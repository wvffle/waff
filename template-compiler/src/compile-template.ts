import { RootContent, Element } from "hast"
import { compileExpression } from "./compile-expression"
import { escape } from './utils'

interface CompilerContext {
  previous?: Element
  parent?: Element
  isInsideCondition: boolean
  conditionText: string
  fileName: string,
  isChild: boolean
}

export const createContext = (): CompilerContext => ({
  fileName: '',
  conditionText: '',
  isInsideCondition: false,
  isChild: false
})

export const compileText = (content: string, context: CompilerContext) => {
  return '`' + escape(content.trim().replace(/{{\s*(.+?)\s*}}/g, (_, expression) => {
    return '${' + compileExpression(expression, context.fileName).replace(/;?\n?$/, '') + '}'
  })) + '`,'
}

export const compileElement = (element: Element, level: number, context: CompilerContext): string => {
  const attrs = element.properties ?? {}

  let condition = ''
  for (const attr in attrs) {
    if (attr[0] === ':') {
      delete attrs[attr]
      // TODO: Prop passing
    }

    if (/^w-\w+/.test(attr)) {
      const value = compileExpression(attrs[attr] as string, context.fileName)
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

    const { isChild } = context
    context.isChild = true
    const childArray = compileTemplate(element.children, context.fileName, level + 1, context)
    context.isChild = isChild

    context.parent = undefined

    return `${condition}$createElement('${element.tagName}', ${JSON.stringify(attrs)}, ${childArray})`
  } else {
    return `${condition}$createElement('${element.tagName}', ${JSON.stringify(attrs)})`
  }
}

export const compileTemplate = (children: RootContent[], fileName: string, level = 1, context = createContext()) => {
  context.fileName = fileName

  const result = []
  for (const child of children) {
    switch (child.type) {
      case 'text':
        if (!/^\s+$/.test(child.value)) {
          result.push(compileText(child.value, context))
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
  if (context.isChild) {
    return `[\n${spacing}${result.join(`,\n${spacing}`)}\n${spacing.slice(2)}]`
  }

  return result.length === 1 && result[0].startsWith('$createElement(')
    ? result[0]
    : `$createElement('div', {}, [\n${spacing}${result.join(`,\n${spacing}`)}\n${spacing.slice(2)}])`
}
