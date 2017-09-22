const findVariablesInTemplate = require('../../lib/findVariablesInTemplate')

const findVariables = template => findVariablesInTemplate(template.trim())

describe('findVariablesInTemplate', () => {
  it('returns empty array by default', () => {
    expect(findVariablesInTemplate()).toEqual([])
  })

  it('returns empty array if accepts empty string', () => {
    const result = findVariablesInTemplate('')
    expect(result).toEqual([])
  })

  it('returns used variables within attributes', () => {
    const result = findVariables(`
      div(
        justBoolean
        attribute=attribute
        text="string"
        single-quote='text'
        bool=true
        func=executedFunction('text', argInExecutedFunction)
      )
        span(
          nested=nested
          as-object-name=objName.val
          as-object-string=objString['val']
          as-object-var=objKey[key]
          wrapped=(wrapped)
        )
    `)
    const expected = [
      'attribute', 'executedFunction', 'argInExecutedFunction', 'nested', 'objName', 'objString',
      'objKey', 'key', 'wrapped',
    ]

    expect(result).toEqual(expected)
  })

  it('returns used variables in outputting', () => {
    const result = findVariables(`
      div
        p= text
        p= String(textModified).replace(/\\s/g, '*')
        p= object.value
        p= collectionWithString['value']
        p= collectionWithKey[key]
        = paragraph
        = executedFunc()
        = executedFuncWithArgs(argInExecutedFunc)
    `)
    const expected = [
      'text', 'String', 'textModified', 'object', 'collectionWithString', 'collectionWithKey',
      'key', 'paragraph', 'executedFunc', 'executedFuncWithArgs', 'argInExecutedFunc',
    ]

    expect(result).toEqual(expected)
  })

  it('returns used variables in conditions', () => {
    const result = findVariables(`
      div
        if conditionWithBool === true
          p renders first condition

        if conditionWithVariable === truthyOrFalsy
          p renders second condition

        if leftExecutedFunction() === rightExecutedFunction(argInRightExecutedFunc)
          p renderes third condition
    `)
    const expected = [
      'conditionWithBool',
      'conditionWithVariable',
      'truthyOrFalsy',
      'leftExecutedFunction',
      'rightExecutedFunction',
      'argInRightExecutedFunc',
    ]

    expect(result).toEqual(expected)
  })

  // @TODO: Need to remove `a` and duplicated `item` from used variables
  it('returns used variables in loops', () => {
    const result = findVariables(`
      div
        for item, a in collection.filter(filterFunc)
          li(key=item.id)
            p= item.text
            p= a

        p= item
    `)
    const expected = [
      'collection', 'filterFunc', 'item', 'item', 'a', 'item',
    ]

    expect(result).toEqual(expected)
  })

  it('returns used components', () => {
    const result = findVariables(`
      Header(key=item.id)
        Nested(attr=text)= value
    `)
    const expected = [
      'Header', 'item', 'Nested', 'text', 'value',
    ]

    expect(result).toEqual(expected)
  })
})
