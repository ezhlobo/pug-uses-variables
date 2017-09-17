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
    
`.trim()

const variables = findVariablesInTemplate(pugTemplate)
// is equal ['ReactComponent', 'object', 'item', 'content', 'condition', 'matcher']
```

## Value

This plugin helps us to integrate [babel-plugin-transform-react-pug](https://github.com/pugjs/babel-plugin-transform-react-pug) and [eslint](http://eslint.org).

## Development

* `yarn test`
* `yarn lint`

## License

[MIT](https://tldrlegal.com/license/mit-license)
