import lexer from 'pug-lexer'
import visitors from './visitors'
import State from './State'

export default function findVariablesInTemplate(template) {
  if (template) {
    const tokens = lexer(template)
    const state = new State()

    tokens.forEach(token => visitors(state, token, template))

    return state.getVariables()
  }

  return []
}
