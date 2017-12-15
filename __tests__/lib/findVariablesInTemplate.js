const findVariablesInTemplate = require('../../lib/findVariablesInTemplate')

const findVariables = template => findVariablesInTemplate(template.trimRight())

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
      'collection', 'filterFunc', 'item',
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

  it('returns variables from interpolation', () => {
    const result = findVariables(`
      div
        p.
          Text #{var1} #{var2}
          Hello #{var3}

        p Text #{var4}

        - const var5 = 'var5'
        p Text #{var5}
    `)
    const expected = [
      'var1', 'var2', 'var3', 'var4',
    ]

    expect(result).toEqual(expected)
  })

  it('handles object spread operator to support jsx', () => {
    const result = findVariables(`
      Component(...field ...props[value])
    `)
    const expected = [
      'Component', 'field', 'props', 'value',
    ]

    expect(result).toEqual(expected)
  })

  it('does not return duplicates of variables', () => {
    const result = findVariables(`
      div(attribute=value)= value
    `)

    expect(result).toEqual(['value'])
  })

  it('does not return variables from defined scope inside pug', () => {
    const result = findVariables(`
      div
        - const test = 'this var should not be returned'
        - const value = 'this var should not ve returned'
        div(attribute=test)= test
        div(attribute=value)= value

        div
          - const nestedVariable = 'nestedVariable'
          - const nestedVariableFake = 'this var should not ve returned'
          div
            - const doubleNestedVariable = 'doubleNestedVariable'
            div= nestedVariableFake
        p= nestedVariable
        p= doubleNestedVariable

        each item, index in collection
          p= item
          p= index
          p= value
          p= outsideVariable

        - const inCondition = true
        if true === inCondition
          p= value

        p= item
    `)
    const expected = [
      'nestedVariable', 'doubleNestedVariable', 'collection', 'outsideVariable', 'item',
    ]

    expect(result).toEqual(expected)
  })

  it('handles more than one root', () => {
    const result = findVariables(`
      if true
        = first

      else if false
        = second

      else
        = third
    `)

    const expected = ['first', 'second', 'third']

    expect(result).toEqual(expected)
  })
})
