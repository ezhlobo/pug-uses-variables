const lexer = require('pug-lexer')
const parser = require('pug-parser')
const pugWalk = require('pug-walk')
const babylon = require('babylon')
const codeWalk = require('babel-traverse').default

const isComponent = string => /^[A-Z].*$/.test(string)
const isSpreadOperator = string => /^\.{3}[A-z]+$/.test(string)

const parseAndFindVarsInProgram = (program) => {
  const out = []
  const code = babylon.parse(program, {
    plugins: [
      'objectRestSpread',
    ],
  })

  codeWalk(code, {
    Program(path) {
      const varsInGlobal = Object.keys(path.scope.globals)

      out.push(...varsInGlobal)
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
          const value = isSpreadOperator(attribute.name)
            ? `({${attribute.name}})`
            : String(attribute.val)

          const vars = parseAndFindVarsInProgram(value)

          variables.push(...vars)
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
