const babylon = require('babylon')
const codeWalk = require('babel-traverse').default
const pushUniqueVariable = require('./pushUniqueVariable')

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

module.exports = parseAndFindVarsInProgram
