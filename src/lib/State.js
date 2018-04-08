import pushUniqueVariable from '../helpers/pushUniqueVariable'

function getVariablesInContext(context, column) {
  return Object.keys(context)
    .filter(key => key <= column)
    .map(key => context[key])
    .reduce((flattenArray, array) => flattenArray.concat(array), [])
}

export default class State {
  constructor() {
    // Array of variable Nodes
    this.variables = []

    // Map of variable names
    this.context = {}
  }

  getVariables() {
    return this.variables
  }

  addVariables(column, variables) {
    const contextVars = getVariablesInContext(this.context, column)

    variables
      .filter(variable => contextVars.indexOf(variable.value) === -1)
      .forEach((variable) => {
        this.variables = [...this.variables, variable]
      })
  }

  addToContext(column, variables) {
    if (variables.length > 0) {
      if (this.context[column]) {
        this.context[column] = pushUniqueVariable(this.context[column], variables)
      } else {
        this.context[column] = variables
      }
    }
  }

  clearContext(column) {
    Object.keys(this.context).filter(key => key > column).forEach((key) => {
      this.context[key] = []
    })
  }
}
