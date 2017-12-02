const babylon = require('babylon')
const codeWalk = require('babel-traverse').default
const pushUniqueVariable = require('./pushUniqueVariable')

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

      usedVariables = pushUniqueVariable(usedVariables, ...varsInGlobal)
      definedVariables = pushUniqueVariable(definedVariables, ...varsDefined)
    },
  })

  return {
    used: usedVariables,
    defined: definedVariables,
  }
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
      const normalizedValue = isSpreadOperator(token.name)
        // `({ ...props })` is a valid code when `...props` is not, so we
        // are making this normalization to avoid syntax errors
        ? `({${token.name}})`
        // Pug can return a boolean variable for attribute value, but babel
        // can parses only strings
        : String(token.val)

      const variables = parseAndFindVarsInProgram(normalizedValue)

      state.addVariables(token.col, variables.used)

      break
    }

    case 'interpolated-code':
    case 'if': {
      const variables = parseAndFindVarsInProgram(token.val)

      state.addVariables(token.col, variables.used)

      break
    }

    case 'code': {
      const variables = parseAndFindVarsInProgram(token.val)

      state.addToContext(token.col, variables.defined)

      state.addVariables(token.col, variables.used)

      break
    }

    case 'each': {
      const defined = [token.val, token.key]
      const variables = parseAndFindVarsInProgram(token.code)

      // We need to increase column because 'each' creates own scope and
      // defines variables inside it
      state.addToContext(token.col + 1, defined)

      state.addVariables(token.col, variables.used)

      break
    }

    default:
      break
  }
}
