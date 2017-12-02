const lexer = require('pug-lexer')
const visitors = require('./visitors')
const State = require('./state')

const findVariablesInTemplate = (template) => {
  if (template) {
    const tokens = lexer(template)
    const state = new State()

    tokens.forEach(token => visitors(state, token))

    return state.variables
  }

  return []
}

module.exports = findVariablesInTemplate
