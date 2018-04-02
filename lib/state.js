const pushUniqueVariable = require('./pushUniqueVariable')

function getVariablesInContext(context, column) {
  return Object.keys(context)
    .filter(key => key <= column)
    .map(key => context[key])
    .reduce((flattenArray, array) => flattenArray.concat(array), [])
}

module.exports = class State {
  constructor() {
    this.variables = []
    this.context = {}
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
