import { fromHtml } from 'hast-util-from-html'
import { Element, Text } from 'hast'
import { compileScript } from './compile-script'
import { compileTemplate } from './compile-template'
import { pascalCase } from 'pascal-case'

const getName = (name: string) => pascalCase(name.replace(/\.waff$/, ''))


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
  const { setupText, returns, imports, props } = compileScript(scriptSource, fileName)

  const render = template
    ? compileTemplate(template.children, fileName, 4)
    : ''

  const name = getName(fileName)
  return `import { defineComponent as $defineComponent, createElement as $createElement, toRefs as $toRefs } from '@waff/core'
${imports.join('\n')}
let $name = '${name}';
export default $defineComponent($name, {
  setup ($props) {\n${setupText}\n  },
  render ($props, $data) {
    ${props.length > 0 ? `const { ${props.join(', ')} } = $toRefs($props);` : ''}
    {
      const { ${Object.keys(returns).join(', ')} } = $toRefs($data);
      return ${render}
    }
  }
})`
}
