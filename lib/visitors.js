const parseAndFindVarsInProgram = require('./parseAndFindVarsInProgram')
const buildVariable = require('./buildVariable')

function isComponent(string) {
  return /^[A-Z].*$/.test(string)
}

function isSpreadOperator(string) {
  return /^\.{3}[A-z]+$/.test(string)
}

module.exports = function visitors(state, token, template) {
  const location = token.loc
  const locs = template.split('\n')

  switch (token.type) {
    case 'outdent': {
      state.clearContext(location.end.column)

      break
    }

    case 'tag': {
      if (isComponent(token.val)) {
        const source = locs.slice(location.start.line - 1, location.end.line)
        const name = token.val

        const line = location.start.line
        const valueStartsAt = location.start.column
        const columnStart = valueStartsAt + source[0].substring(valueStartsAt).indexOf(name)
        const columnEnd = columnStart + name.length
        const variable = buildVariable(token.val, [line, columnStart], [line, columnEnd])

        state.addVariables(location.start.column, [variable])
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

      const source = locs.slice(location.start.line - 1, location.end.line)

      const usedVariables = parseAndFindVarsInProgram(normalizedValue)
        .used
        .map((name) => {
          const localLine = source.findIndex(loc => loc.indexOf(name) > -1)
          const line = location.start.line + localLine

          const valueStartsAt = isSpreadOperator(token.name)
            ? location.start.column
            : location.start.column + (token.name.length - 1)

          const columnStart = localLine > 0
            ? source[localLine].indexOf(name)
            : valueStartsAt + source[0].substring(valueStartsAt).indexOf(name)

          const columnEnd = columnStart + name.length

          return buildVariable(name, [line, columnStart], [line, columnEnd])
        })

      state.addVariables(location.start.column, usedVariables)

      break
    }

    case 'interpolated-code':
    case 'if': {
      const source = locs.slice(location.start.line - 1, location.end.line)
      const usedVariables = parseAndFindVarsInProgram(token.val)
        .used
        .map((name) => {
          const line = location.start.line
          const valueStartsAt = location.start.column
          const columnStart = valueStartsAt + source[0].substring(valueStartsAt).indexOf(name)
          const columnEnd = columnStart + name.length

          return buildVariable(name, [line, columnStart], [line, columnEnd])
        })

      state.addVariables(location.start.column, usedVariables)

      break
    }

    case 'code': {
      const variables = parseAndFindVarsInProgram(token.val)

      state.addToContext(location.start.column, variables.defined)

      const source = locs.slice(location.start.line - 1, location.end.line)
      const usedVariables = variables
        .used
        .map((name) => {
          const line = location.start.line
          const valueStartsAt = location.start.column
          const columnStart = valueStartsAt + source[0].substring(valueStartsAt).indexOf(name)
          const columnEnd = columnStart + name.length

          return buildVariable(name, [line, columnStart], [line, columnEnd])
        })

      state.addVariables(location.start.column, usedVariables)

      break
    }

    case 'each': {
      const defined = [token.val, token.key]
      const variables = parseAndFindVarsInProgram(token.code)

      // We need to increase column because 'each' creates own scope and
      // defines variables inside it
      state.addToContext(location.start.column + 1, defined)

      const source = locs.slice(location.start.line - 1, location.end.line)
      const usedVariables = variables
        .used
        .map((name) => {
          const line = location.start.line
          const valueStartsAt = location.start.column
          const columnStart = valueStartsAt + source[0].substring(valueStartsAt).indexOf(name)
          const columnEnd = columnStart + name.length

          return buildVariable(name, [line, columnStart], [line, columnEnd])
        })

      state.addVariables(location.start.column, usedVariables)

      break
    }

    default:
      break
  }
}
