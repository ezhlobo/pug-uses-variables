// @flow

import parseAndFindVarsInProgram from '../helpers/parseAndFindVarsInProgram'
import { buildVariable, findVariable } from '../helpers/variables'

import type State from './State'

function isComponent(input: string): boolean {
  return /^[A-Z].*$/.test(input)
}

function isSpreadOperator(input: string): boolean {
  return /^\.{3}[A-z]+$/.test(input)
}

export default function visitors(state: State, token: Token, template: string) {
  const location = token.loc
  const source = template.split('\n').slice(location.start.line - 1, location.end.line)

  switch (token.type) {
    case 'outdent': {
      state.clearContext(location.end.column)

      break
    }

    case 'tag': {
      if (isComponent(token.val)) {
        const variable = findVariable(token.val, location, source)

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
      const usedVariables = parseAndFindVarsInProgram(token.val)
        .used
        .map(name => findVariable(name, location, source))

      state.addVariables(location.start.column, usedVariables)

      break
    }

    case 'code': {
      const variables = parseAndFindVarsInProgram(token.val)

      state.addToContext(location.start.column, variables.defined)

      const usedVariables = variables
        .used
        .map(name => findVariable(name, location, source))

      state.addVariables(location.start.column, usedVariables)

      break
    }

    case 'each': {
      const defined = [token.val, token.key]

      // We need to increase column because 'each' creates own scope and
      // defines variables inside it
      state.addToContext(location.start.column + 1, defined)

      const usedVariables = parseAndFindVarsInProgram(token.code)
        .used
        .map(name => findVariable(name, location, source))

      state.addVariables(location.start.column, usedVariables)

      break
    }

    default:
      break
  }
}
