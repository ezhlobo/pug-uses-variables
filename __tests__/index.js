const { findVariablesInTemplate } = require('../index')

describe('main', () => {
  it('exports "findVariablesInTemplate"', () => {
    expect(findVariablesInTemplate).toBeInstanceOf(Function)
  })
})
