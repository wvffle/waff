import ts from 'typescript'

export const compileScript = (content: string, fileName: string) => {
  const returns: Record<string, 'const' | 'let' | true> = Object.create(null)
  const imports: string[] = []
  const props: string[] = []
  // https://convincedcoder.com/2019/01/19/Processing-TypeScript-using-TypeScript/
  // https://github.com/madou/typescript-transformer-handbook
  const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
    return sourceFile => {
      const { factory } = context

      const handleDefineProps = (node: ts.CallExpression) => {
        if (ts.isIdentifier(node.expression) && node.expression.getText() === 'defineProps') {
          const type = node.typeArguments?.at(0)
          type?.forEachChild((child) => {
            if (ts.isPropertySignature(child)) {
              const name = child.name.getText()
              if (name[0] !== '$') {
                props.push(name)
              }
            }
          })

          if (ts.isVariableDeclaration(node.parent)) {
            return factory.createIdentifier('$props')
          }

          return undefined
        }

        return node
      }

      const node = ts.visitNode(sourceFile, (node) => {
        return ts.visitEachChild(node, (node) => {
          // Props
          if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression)) {
            return handleDefineProps(node.expression)
          }

          // Import returns
          if (ts.isImportDeclaration(node) && node.importClause && ts.isImportClause(node.importClause)) {
            imports.push(node.getText())

            const child = node.importClause.getChildAt(0)
            const name = ts.isIdentifier(child)
              ? child.getText()
              : ts.isNamespaceImport(child)
                ? child.name.getText()
                : ''

            if (name && name[0] !== '$') {
              returns[name] = true
              return undefined
            } else if (ts.isNamedImports(child)) {
              for (const specifier of child.elements) {
                const name = specifier.name.getText()
                if (name[0] !== '$') {
                  returns[name] = true
                }
              }
              return undefined
            }

            return undefined
          }

          // Function returns
          if (ts.isFunctionDeclaration(node)) {
            const name = node.name?.getText()
            if (name && name[0] !== '$') {
              returns[name] = true
              return node
            }
          }

          // Variable returns
          if (ts.isVariableStatement(node)) {
            const type = (node.declarationList.flags & 2) > 0
              ? 'const'
              : 'let'

            const visitor = (node: ts.Node): ts.Node => {
              if (ts.isVariableDeclaration(node)) {
                const name = node.name?.getText()
                if (name && name[0] !== '$') {
                  returns[name] = type
                }

                // Handle defineProps assignment
                if (node.initializer && ts.isCallExpression(node.initializer)) {
                  const props = handleDefineProps(node.initializer)
                  if (props && props !== node.initializer) {
                    return factory.updateVariableDeclaration(node, node.name, node.exclamationToken, node.type, props)
                  }
                }

                return node
              }

              return ts.visitEachChild(node, visitor, context)
            }

            return ts.visitNode(node, visitor)
          }

          return node
        }, context)
      })

      return node
    }
  }

  const { outputText } = ts.transpileModule(content, {
    fileName,
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
    },
    transformers: {
      before: [transformer],
    }
  })

  return {
    returns,
    imports,
    props,
    setupText:`${outputText.trim().split('\n').map(line => `    ${line}`).join('\n').replace('export {};', '')}\n    return {
      ${Object.keys(returns).map(name => {
        if (returns[name] === 'let') {
          return `get ${name} () { return ${name} },\n      set ${name} (value) { ${name} = value }`
        }

        return name
      }).join(',\n      ')}
    }`.replace(/^    \n/, '')
  }
}
