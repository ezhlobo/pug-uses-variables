// @flow

import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import pushUniqueVariable from './pushUniqueVariable'

export default function parseAndFindVarsInProgram(program: string): {
  used: Array<string>,
  defined: Array<string>,
} {
  let usedVariables = []
  let definedVariables = []
  const code = parse(program, {
    plugins: [
      'objectRestSpread',
    ],
  })

  traverse(code, {
    Program(path: Object) {
      const varsDefined: Array<string> = Object.keys(path.scope.bindings)
      const varsInGlobal: Array<string> = Object.keys(path.scope.globals)

      usedVariables = pushUniqueVariable(usedVariables, varsInGlobal)
      definedVariables = pushUniqueVariable(definedVariables, varsDefined)
    },
  })

  return {
    used: usedVariables,
    defined: definedVariables,
  }
}
