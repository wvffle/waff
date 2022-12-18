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

export const compileAttr = (attr: string, value: string, context: CompilerContext) => {
  switch (attr) {
    case 'w-for': {
      const [variable, ...exprParts] = value.split(' in ')
      const expr = exprParts.join(' in ')
      return {
        value: compileExpression(expr, context.fileName),
        forVarName: variable
      }
    }

    default:
      return {
        value: compileExpression(value, context.fileName)
      }
  }
}

export const compileElement = (element: Element, level: number, context: CompilerContext): string => {
  const attrs = element.properties ?? {}
  const events: Record<string, string> = {}

  const forContext = {
    isFor: false,
    expression: '',
    variableName: 'iter',
    prefix: '',
    suffix: ''
  }

  let condition = ''
  for (const attr in attrs) {
    if (attr[0] === ':') {
      delete attrs[attr]
      // TODO: Prop passing
    }

    if (attr[0] === '@') {
      events[attr.slice(1)] = compileExpression(attrs[attr] as string, context.fileName)
      delete attrs[attr]
    }

    if (/^w-\w+/.test(attr)) {
      const attrData = compileAttr(attr, attrs[attr] as string, context)
      delete attrs[attr]

      switch (attr) {
        case 'w-if':
          condition = `${attrData.value} && `
          context.isInsideCondition = true
          break
        case 'w-else-if':
          if (!context.isInsideCondition) {
            throw new Error(`${attr} has to be directly after an element with w-if or w-else-if attribute`)
          }
          condition = ` || ${attrData.value} && `
          break
        case 'w-else':
          if (!context.isInsideCondition) {
            throw new Error(`${attr} has to be directly after an element with w-if or w-else-if attribute`)
          }
          condition = ' || '
          break
        case 'w-for':
          forContext.isFor = true
          forContext.variableName = attrData.forVarName ?? forContext.variableName
          forContext.expression = attrData.value
          break
        default:
          // TODO: Handle custom directives
      }
    }
  }

  let attrsString = JSON.stringify(attrs)

  const compiledEvents = Object.entries(events).map(([event, handler]) => {
    return `"${event}":()=>{${handler}}`
  })

  if (compiledEvents.length) {
    attrsString = `{"on":{${compiledEvents.join(',')}}${Object.keys(attrs).length ? ',' : ''}${attrsString.slice(1)}`
  }

  if (condition === '') {
    context.isInsideCondition = false
  } else if (forContext.isFor) {
    throw new Error('cannot use w-for with w-if, w-else-if and w-else')
  }

  if (forContext.isFor) {
    forContext.prefix = `...${forContext.expression}.map($forItem => { const ${forContext.variableName} = { value: $forItem }; return `
    forContext.suffix = ' })'
  }


  if (element.children.length) {
    context.previous = undefined
    context.parent = element

    const { isChild, isInsideCondition, conditionText } = context
    context.isInsideCondition = false
    context.conditionText = ''
    context.isChild = true
    const childArray = compileTemplate(element.children, context.fileName, level + 1, context)
    context.isInsideCondition = isInsideCondition
    context.conditionText = conditionText
    context.isChild = isChild

    context.parent = undefined

    return `${forContext.prefix}${condition}$createElement('${element.tagName}', ${attrsString}, ${childArray})${forContext.suffix}`
  } else {
    return `${forContext.prefix}${condition}$createElement('${element.tagName}', ${attrsString})${forContext.suffix}`
  }
}

export const compileTemplate = (children: RootContent[], fileName: string, level = 1, context = createContext()) => {
  context.fileName = fileName

  if (children.length > 1 && !context.isChild) {
    return compileElement({
      // @ts-expect-error Type is compatible even though typescript is screaming
      children,
      tagName: 'div'
    }, level - 1, context)
  }

  const result = []
  for (const child of children) {
    let text = ''
    if (child.type === 'text' && !/^\s+$/.test(child.value)) {
      text = compileText(child.value, context)
      context.previous = undefined
      context.isInsideCondition = false
    }

    if (!context.isInsideCondition && context.conditionText !== '') {
      result.push(context.conditionText)
      context.conditionText = ''
    }

    switch (child.type) {
      case 'text':
        if (text !== '') {
          result.push(text)
        }
        break

      case 'element': {
        const text = compileElement(child, level, context)

        if (context.isInsideCondition) {
          context.conditionText += text
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

      // Ignore comments
      case 'comment': break

      default:
        throw new Error(`Unknown type: ${child.type}`)
    }
  }

  context.isInsideCondition = false
  if (context.conditionText !== '') {
    result.push(context.conditionText)
    context.conditionText = ''
  }

  const spacing = '  '.repeat(level)
  if (context.isChild) {
    return `[\n${spacing}${result.join(`,\n${spacing}`)}\n${spacing.slice(2)}]`
  }

  return result.length === 1 && result[0].startsWith('$createElement(')
    ? result[0]
    :`[\n${spacing}${result.join(`,\n${spacing}`)}\n${spacing.slice(2)}]`
}
