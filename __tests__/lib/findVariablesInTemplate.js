import findVariablesInTemplate from '../../src/lib/findVariablesInTemplate'
import { buildVariable } from '../../src/helpers/variables'

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
          plain-array=[ plainArrayOne, plainArrayTwo ]
          plain-object={ one: plainObjectOne, two: plainObjectTwo }
          function=() => alert(withinFunction)
        )
    `)
    const expected = [
      buildVariable('attribute', [4, 18], [4, 27]),
      buildVariable('executedFunction', [8, 13], [8, 29]),
      buildVariable('argInExecutedFunction', [8, 38], [8, 59]),
      buildVariable('nested', [11, 17], [11, 23]),
      buildVariable('objName', [12, 25], [12, 32]),
      buildVariable('objString', [13, 27], [13, 36]),
      buildVariable('objKey', [14, 24], [14, 30]),
      buildVariable('key', [14, 31], [14, 34]),
      buildVariable('wrapped', [15, 19], [15, 26]),
      buildVariable('plainArrayOne', [16, 24], [16, 37]),
      buildVariable('plainArrayTwo', [16, 39], [16, 52]),
      buildVariable('plainObjectOne', [17, 30], [17, 44]),
      buildVariable('plainObjectTwo', [17, 51], [17, 65]),
      buildVariable('alert', [18, 25], [18, 30]),
      buildVariable('withinFunction', [18, 31], [18, 45]),
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
      buildVariable('text', [3, 11], [3, 15]),
      buildVariable('String', [4, 11], [4, 17]),
      buildVariable('textModified', [4, 18], [4, 30]),
      buildVariable('object', [5, 11], [5, 17]),
      buildVariable('collectionWithString', [6, 11], [6, 31]),
      buildVariable('collectionWithKey', [7, 11], [7, 28]),
      buildVariable('key', [7, 29], [7, 32]),
      buildVariable('paragraph', [8, 10], [8, 19]),
      buildVariable('executedFunc', [9, 10], [9, 22]),
      buildVariable('executedFuncWithArgs', [10, 10], [10, 30]),
      buildVariable('argInExecutedFunc', [10, 31], [10, 48]),
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
      buildVariable('conditionWithBool', [3, 11], [3, 28]),
      buildVariable('conditionWithVariable', [6, 11], [6, 32]),
      buildVariable('truthyOrFalsy', [6, 37], [6, 50]),
      buildVariable('leftExecutedFunction', [9, 11], [9, 31]),
      buildVariable('rightExecutedFunction', [9, 38], [9, 59]),
      buildVariable('argInRightExecutedFunc', [9, 60], [9, 82]),
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
      buildVariable('collection', [3, 23], [3, 33]),
      buildVariable('filterFunc', [3, 41], [3, 51]),
      buildVariable('item', [8, 11], [8, 15]),
    ]

    expect(result).toEqual(expected)
  })

  it('returns used components', () => {
    const result = findVariables(`
      Header(key=item.id)
        Nested(attr=text)= value
      Box Hello from Box's child
    `)
    const expected = [
      buildVariable('Header', [2, 6], [2, 12]),
      buildVariable('item', [2, 17], [2, 21]),
      buildVariable('Nested', [3, 8], [3, 14]),
      buildVariable('text', [3, 20], [3, 24]),
      buildVariable('value', [3, 27], [3, 32]),
      buildVariable('Box', [4, 6], [4, 9]),
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
      buildVariable('var1', [4, 17], [4, 21]),
      buildVariable('var2', [4, 25], [4, 29]),
      buildVariable('var3', [5, 18], [5, 22]),
      buildVariable('var4', [7, 17], [7, 21]),
    ]

    expect(result).toEqual(expected)
  })

  it('handles object spread operator to support jsx', () => {
    const result = findVariables(`
      Component(
        ...field
        ...props[value]
        ...object.property
        ...withSymbols_0123456789$
        ...withSymbolsAndProperty_0123456789$._0123456789$
      )
    `)
    const expected = [
      buildVariable('Component', [2, 6], [2, 15]),
      buildVariable('field', [3, 11], [3, 16]),
      buildVariable('props', [4, 11], [4, 16]),
      buildVariable('value', [4, 17], [4, 22]),
      buildVariable('object', [5, 11], [5, 17]),
      buildVariable('withSymbols_0123456789$', [6, 11], [6, 34]),
      buildVariable('withSymbolsAndProperty_0123456789$', [7, 11], [7, 45]),
    ]

    expect(result).toEqual(expected)
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
      buildVariable('nestedVariable', [14, 11], [14, 25]),
      buildVariable('doubleNestedVariable', [15, 11], [15, 31]),
      buildVariable('collection', [17, 28], [17, 38]),
      buildVariable('outsideVariable', [21, 13], [21, 28]),
      buildVariable('item', [27, 11], [27, 15]),
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

    const expected = [
      buildVariable('first', [3, 10], [3, 15]),
      buildVariable('second', [6, 10], [6, 16]),
      buildVariable('third', [9, 10], [9, 15]),
    ]

    expect(result).toEqual(expected)
  })

  it('returns correct source locations', () => {
    const result = findVariables(`
      div(
        sameName=sameName
        withGap  =  withGapAttribute
        multiline=[  lineOneA   ,  lineOneB   ,
            lineTwo  ,
          lineThree
        ]
      )
        p=   withGapTagOutput
        =    withGapOutput
        V(  ...spread[key]   ...spreadTwo  )=  result
    `)
    const expected = [
      buildVariable('sameName', [3, 17], [3, 25]),
      buildVariable('withGapAttribute', [4, 20], [4, 36]),
      buildVariable('lineOneA', [5, 21], [5, 29]),
      buildVariable('lineOneB', [5, 35], [5, 43]),
      buildVariable('lineTwo', [6, 12], [6, 19]),
      buildVariable('lineThree', [7, 10], [7, 19]),
      buildVariable('withGapTagOutput', [10, 13], [10, 29]),
      buildVariable('withGapOutput', [11, 13], [11, 26]),
      buildVariable('V', [12, 8], [12, 9]),
      buildVariable('spread', [12, 15], [12, 21]),
      buildVariable('key', [12, 22], [12, 25]),
      buildVariable('spreadTwo', [12, 32], [12, 41]),
      buildVariable('result', [12, 47], [12, 53]),
    ]

    expect(result).toEqual(expected)
  })

  it('returns functions', () => {
    const result = findVariables(`
      div
        = first('one')

        each item in [1, 2]
          = second(item, another)

        - const staticVariable = 'String'
        - const newVariable = getVariable(staticVariable)
    `)

    const expected = [
      buildVariable('first', [3, 10], [3, 15]),
      buildVariable('second', [6, 12], [6, 18]),
      buildVariable('another', [6, 25], [6, 32]),
      buildVariable('getVariable', [9, 30], [9, 41]),
    ]

    expect(result).toEqual(expected)
  })
})
