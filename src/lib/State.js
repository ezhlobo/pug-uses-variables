// @flow

import pushUniqueVariable from '../helpers/pushUniqueVariable'

type Context = {
  [number]: Array<VariableName>,
}

function getVariablesInContext(context: Context, column: number) {
  return Object.keys(context)
    .filter(key => Number(key) <= column)
    // $FlowFixMe
    .map(key => context[key])
    .reduce((flattenArray, array) => flattenArray.concat(array), [])
}

export default class State {
  variables: VariableList
  context: Context

  constructor() {
    // Array of variable Nodes
    this.variables = []

    // Map of variable names
    this.context = {}
  }

  getVariables() {
    return this.variables
  }

  addVariables(column: number, variables: VariableList) {
    const contextVars = getVariablesInContext(this.context, column)

    variables
      .filter(variable => contextVars.indexOf(variable.value) === -1)
      .forEach((variable) => {
        this.variables = [...this.variables, variable]
      })
  }

  addToContext(column: number, variables: Array<VariableName>) {
    if (variables.length > 0) {
      if (this.context[column]) {
        this.context[column] = pushUniqueVariable(this.context[column], variables)
      } else {
        this.context[column] = variables
      }
    }
  }

  clearContext(column: number) {
    Object.keys(this.context)
      .filter(key => Number(key) > column)
      .forEach((key) => {
        // $FlowFixMe
        this.context[key] = []
      })
  }
}
