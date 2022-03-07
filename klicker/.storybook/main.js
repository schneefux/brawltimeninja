const path = require('path')

module.exports = {
  framework: '@storybook/vue',
  features: {
    interactionsDebugger: true,
  },
  stories: [
    '../components/**/*.stories.mdx',
    '../components/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-addon-themes',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss'),
        },
      },
    },
  ],
  core: {
    builder: 'webpack5',
  },
  webpackFinal: (config) => {
    config.module.rules.push({
      test: /\.postcss$/, // for lang="postcss"
      sideEffects: true,
      use: [
        'vue-style-loader', {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
          },
        }, {
          loader: 'postcss-loader',
          options: {
            implementation: require('postcss'),
          },
        },
      ],
    })

    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    })

    config.resolve.alias[path.resolve(__dirname, '../composables/klicker.ts')] = path.resolve(__dirname, '../fixtures/klicker.shim.ts')
    config.resolve.alias['@nuxtjs/composition-api'] = path.resolve(__dirname, '../fixtures/nuxtjs-composition-api.shim.ts')

    return config
  },
}
