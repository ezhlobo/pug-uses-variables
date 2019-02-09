# pug-uses-variables [![circleci](https://circleci.com/gh/ezhlobo/pug-uses-variables/tree/master.svg)](https://circleci.com/gh/ezhlobo/pug-uses-variables/tree/master)

Find all JavaScript variables used in pug template.

## Usage

```
$ npm install --save pug-uses-variables
```

```js
const { findVariablesInTemplate } = require('pug-uses-variables')

const pugTemplate = `

  ReactComponent(property=object[item])
    = content

    if condition === matcher
      p Truthy

`.trimRight()

const variables = findVariablesInTemplate(pugTemplate)
```
```js
// `variables` is equal:
[{
  value: 'ReactComponent',
  loc: {
    start: { line: 3,  column: 2 },
    end:   { line: 3,  column: 14 }
  }
}, {
  value: 'object',
  loc: {
    start: { line: 3,  column: 24 },
    end:   { line: 3,  column: 30 }
  }
}, {
  value: 'item',
  loc: {
    start: { line: 3,  column: 31 },
    end:   { line: 3,  column: 35 }
  }
}, {
  value: 'content',
  loc: {
    start: { line: 4,  column: 4 },
    end:   { line: 4,  column: 11 }
  }
}, {
  value: 'condition',
  loc: {
    start: { line: 6,  column: 5 },
    end:   { line: 6,  column: 14 }
  }
}, {
  value: 'condition',
  loc: {
    start: { line: 6,  column: 19 },
    end:   { line: 6,  column: 26 }
  }
}]
```

**Important**: templates should be right-trimmed. Usually it means that you have to execute `.trimRight` on your template-string as in the example above.

### Get variable names only

```js
const variableNames = variables.map(variable => variable.value)
// > ['ReactComponent', 'object', 'item', 'content', 'condition', 'matcher']
```

## Value

This plugin helps us to integrate [babel-plugin-transform-react-pug](https://github.com/pugjs/babel-plugin-transform-react-pug) and [eslint](http://eslint.org).

## Development

* `yarn test`
* `yarn lint`

## License

[MIT](https://tldrlegal.com/license/mit-license)
