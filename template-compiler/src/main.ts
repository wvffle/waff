import { fromHtml } from 'hast-util-from-html'
import { Element, Text } from 'hast'
import { compileScript } from './compile-script'
import { compileTemplate } from './compile-template'

export const compile = (content: string, fileName = 'component.waff') => {
  const { children } = fromHtml(content, { fragment: true })

  let script: Element | undefined = undefined
  let template = undefined

  for (const child of children) {
    if (!script && child.type === 'element' && child.tagName === 'script') {
      script = child
    } else if (!template && child.type === 'element' && child.tagName === 'template') {
      template = child.content
    }

    if (script && template) {
      break
    }
  }

  const [{ value: scriptSource = '' }] = script?.children as Text[] ?? [{ value : '' }]
  const setupContent = compileScript(scriptSource, fileName)

  const templateContent = template
    ? compileTemplate(template.children)
    : ''

  return {
    script,
    setupContent,
    template,
    templateContent
  }
}
