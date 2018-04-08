const { findVariablesInTemplate } = require('../src/index')

describe('main', () => {
  it('exports "findVariablesInTemplate"', () => {
    expect(findVariablesInTemplate).toBeInstanceOf(Function)
  })
})
