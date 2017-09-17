const lexer = require('pug-lexer')
const parser = require('pug-parser')
const pugWalk = require('pug-walk')
const babylon = require('babylon')
const codeWalk = require('babel-traverse').default

const isComponent = string => /^[A-Z].*$/.test(string)

const parseAndFindVarsInProgram = (program) => {
  const out = []
  const code = babylon.parse(program)

  codeWalk(code, {
    enter(path) {
      if (path.type === 'ExpressionStatement') {
        const varsInGlobal = Object.keys(path.scope.globals)

        out.push(...varsInGlobal)
      }
    },
  })

  return out
}

const findVariablesInTemplate = (template) => {
  if (template) {
    const tokens = lexer(template)
    const ast = parser(tokens)

    const variables = []

    pugWalk(ast, (node) => {
      if (node.type === 'Tag') {
        if (isComponent(node.name)) {
          variables.push(node.name)
        }

        node.attrs.forEach((attribute) => {
          const code = babylon.parseExpression(attribute.val)

          if (code.type === 'Identifier') {
            variables.push(code.name)
            return
          }

          if (code.type === 'MemberExpression') {
            variables.push(code.object.name)

            if (code.computed && code.property.type === 'Identifier') {
              variables.push(code.property.name)
            }
          }
        })

        return
      }

      if (node.type === 'Code') {
        const vars = parseAndFindVarsInProgram(node.val)

        variables.push(...vars)

        return
      }

      if (node.type === 'Conditional') {
        const vars = parseAndFindVarsInProgram(node.test)

        variables.push(...vars)

        return
      }

      if (node.type === 'Each') {
        const vars = parseAndFindVarsInProgram(node.obj)

        variables.push(...vars)
      }
    })

    return variables
  }

  return []
}

module.exports = findVariablesInTemplate
