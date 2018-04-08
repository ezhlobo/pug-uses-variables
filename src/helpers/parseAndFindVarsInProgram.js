import { parse } from 'babylon'
import codeWalk from 'babel-traverse'
import pushUniqueVariable from './pushUniqueVariable'

export default function parseAndFindVarsInProgram(program) {
  let usedVariables = []
  let definedVariables = []
  const code = parse(program, {
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
