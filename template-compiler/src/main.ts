import { fromHtml } from 'hast-util-from-html'
import { Element, Text } from 'hast-util-from-parse5/lib'
import { isFunctionDeclaration, isImportDeclaration, isImportSpecifier, isVariableDeclaration, isVariableStatement, SourceFile, TransformerFactory, transpileModule, visitEachChild, visitNode } from 'typescript'

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


  const [{ value: sourceText = '' }] = script?.children as Text[] ?? [{ value : '' }]

  const returns: Record<string, 'const' | 'let' | true> = Object.create(null)

  // https://convincedcoder.com/2019/01/19/Processing-TypeScript-using-TypeScript/
  // https://github.com/madou/typescript-transformer-handbook
  const transformer: TransformerFactory<SourceFile> = context => {
    return sourceFile => {

      const node = visitNode(sourceFile, (node) => {
        return visitEachChild(node, (node) => {
          if (isImportDeclaration(node)) {
            const name = node.importClause?.name?.getText()
            if (name) {
              returns[name] = true
              return node
            }

            node.importClause?.namedBindings?.forEachChild((node) => {
              if (isImportSpecifier(node)) {
                const name = node.name.getText()
                if (name) {
                  returns[name] = true
                }
              }

              return node
            })

            return node
          }

          if (isFunctionDeclaration(node)) {
            const name = node.name?.getText()
            if (name) {
              returns[name] = true
              return node
            }
          }

          if (isVariableStatement(node)) {
            const type = (node.declarationList.flags & 2) > 0
              ? 'const'
              : 'let'

            for (const declaration of node.declarationList.declarations) {
              if (isVariableDeclaration(declaration)) {
                const name = declaration.name?.getText()
                if (name) {
                  returns[name] = type
                  continue
                }
              }
            }
            return node
          }
          return node
        }, context)
      })

      return node
    };
  };

  const { outputText } = transpileModule(sourceText, {
    fileName,
    transformers: {
      before: [transformer],
    }
  })

  const scriptContent = `${outputText} ;return {
    ${Object.keys(returns).map(name => {
      if (returns[name] === 'let') {
        return `
          get ${name} () { return ${name} },
          set ${name} (value) { ${name} = value }
        `
      }

      return name
    }).join(', ')}
  }`

  return {
    script,
    scriptContent,
    template
  }
}
