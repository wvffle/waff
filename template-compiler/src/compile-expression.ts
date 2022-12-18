import ts from 'typescript'

export const compileExpression = (content: string, fileName = 'file.ts') => {
  const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
    const { factory } = context

    const createGetter = (expression: ts.Expression) => factory.createPropertyAccessExpression(
      expression,
      factory.createIdentifier('value')
    )

    return sourceFile => {
      const visitor = (node: ts.Node): ts.Node => {
        if (ts.isIdentifier(node)) {
          // Deeoply nestend object expressions
          if (ts.isPropertyAccessExpression(node.parent) && node === node.parent.expression) {
            return createGetter(node)
          }

          // Dynamic object access
          if (ts.isElementAccessExpression(node.parent)) {
            return createGetter(node)
          }

          // String templates
          if (ts.isTemplateSpan(node.parent)) {
            return createGetter(node)
          }

          // Functions
          if (ts.isCallExpression(node.parent)) {
            return createGetter(node)
          }

          // Comparisons, math operations
          if (ts.isBinaryExpression(node.parent)) {
            return createGetter(node)
          }

          // Pre/post increment/decrement
          if (ts.isPrefixUnaryExpression(node.parent) || ts.isPostfixUnaryExpression(node.parent)) {
            return createGetter(node)
          }

          // Variable expressions
          if (ts.isExpressionStatement(node.parent)) {
            return createGetter(node)
          }


          return node
        }

        return ts.visitEachChild(node, visitor, context)
      }

      return ts.visitNode(sourceFile, visitor)
    }
  }

  const { outputText } = ts.transpileModule(content, {
    fileName,
    transformers: {
      before: [transformer],
    }
  })

  return outputText.replace(/;?\n?$/, '')
}
