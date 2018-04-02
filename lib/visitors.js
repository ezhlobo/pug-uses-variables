const parseAndFindVarsInProgram = require('./parseAndFindVarsInProgram')

function isComponent(string) {
  return /^[A-Z].*$/.test(string)
}

function isSpreadOperator(string) {
  return /^\.{3}[A-z]+$/.test(string)
}

module.exports = function visitors(state, token) {
  const location = token.loc

  switch (token.type) {
    case 'outdent': {
      state.clearContext(location.end.column)

      break
    }

    case 'tag': {
      if (isComponent(token.val)) {
        state.addVariables(location.start.column, [token.val])
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

      state.addVariables(location.start.column, variables.used)

      break
    }

    case 'interpolated-code':
    case 'if': {
      const variables = parseAndFindVarsInProgram(token.val)

      state.addVariables(location.start.column, variables.used)

      break
    }

    case 'code': {
      const variables = parseAndFindVarsInProgram(token.val)

      state.addToContext(location.start.column, variables.defined)

      state.addVariables(location.start.column, variables.used)

      break
    }

    case 'each': {
      const defined = [token.val, token.key]
      const variables = parseAndFindVarsInProgram(token.code)

      // We need to increase column because 'each' creates own scope and
      // defines variables inside it
      state.addToContext(location.start.column + 1, defined)

      state.addVariables(location.start.column, variables.used)

      break
    }

    default:
      break
  }
}
