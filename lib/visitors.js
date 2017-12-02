const babylon = require('babylon')
const codeWalk = require('babel-traverse').default
const pushTo = require('./pushTo')

function isComponent(string) {
  return /^[A-Z].*$/.test(string)
}

function isSpreadOperator(string) {
  return /^\.{3}[A-z]+$/.test(string)
}

function parseAndFindVarsInProgram(program) {
  let usedVariables = []
  let definedVariables = []
  const code = babylon.parse(program, {
    plugins: [
      'objectRestSpread',
    ],
  })

  codeWalk(code, {
    Program(path) {
      const varsDefined = Object.keys(path.scope.bindings)
      const varsInGlobal = Object.keys(path.scope.globals)

      usedVariables = pushTo(usedVariables, ...varsInGlobal)
      definedVariables = pushTo(definedVariables, ...varsDefined)
    },
  })

  return [usedVariables, definedVariables]
}

module.exports = function visitors(state, token) {
  switch (token.type) {
    case 'outdent': {
      state.clearContext(token.col)

      break
    }

    case 'tag': {
      if (isComponent(token.val)) {
        state.addVariables(token.col, [token.val])
      }

      break
    }

    case 'attribute': {
      const value = isSpreadOperator(token.name)
        ? `({${token.name}})`
        : String(token.val)

      const [used] = parseAndFindVarsInProgram(value)

      state.addVariables(token.col, used)

      break
    }

    case 'if': {
      const [used] = parseAndFindVarsInProgram(token.val)

      state.addVariables(token.col, used)

      break
    }

    case 'code': {
      const [used, defined] = parseAndFindVarsInProgram(token.val)

      state.addToContext(token.col, defined)

      state.addVariables(token.col, used)

      break
    }

    case 'each': {
      const defined = [token.val, token.key]
      const [used] = parseAndFindVarsInProgram(token.code)

      // We need to increase column because 'each' creates own scope and
      // defines variables inside it
      state.addToContext(token.col + 1, defined)

      state.addVariables(token.col, used)

      break
    }

    default:
      break
  }
}
