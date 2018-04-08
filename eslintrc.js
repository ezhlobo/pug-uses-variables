module.exports = {
  parser: 'babel-eslint',
  plugins: [
    'flowtype',
  ],
  extends: [
    'airbnb-base',
    'plugin:flowtype/recommended',
  ],
  env: {
    jest: true,
  },
  rules: {
    'max-len': ['error', 120],
    'no-multiple-empty-lines': [
      'error', {
        max: 1,
        maxBOF: 0,
        maxEOF: 0,
      },
    ],
    'no-undef': 'error',
    'padded-blocks': ['error', {
      blocks: 'never',
      classes: 'never',
      switches: 'never',
    }],
    'prefer-destructuring': 'off',
    semi: ['error', 'never'],
  },
}
