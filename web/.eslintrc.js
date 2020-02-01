module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    '@nuxtjs/eslint-config-typescript'
  ],
  // add your custom rules here
  rules: {
    'no-console': 'off',
    'comma-dangle': [ 2, 'only-multiline' ],
  }
}
