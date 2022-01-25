module.exports = {
  framework: '@storybook/vue3',
  stories: [
    '../components/**/*.stories.mdx',
    '../components/**/*.stories.@(js|jsx|ts|tsx)'
  ],
  core: {
    builder: 'storybook-builder-vite',
  },
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    'storybook-dark-mode',
  ],
  /*
  webpackFinal: (config) => {
    // modify Vue and CSS rule to add postcss loader

    const vueRule = config.module.rules.find(r => r.loader == require.resolve('vue-loader'))
    vueRule.options = {
      loaders: {
        postcss: 'vue-style-loader!css-loader!postcss-loader',
      }
    }
    console.log(JSON.stringify(vueRule, null, 2))

    config.module.rules.push({
      test: /\.css$/,
      use: [
        'vue-style-loader',
        {
          loader: 'css-loader',
          options: { importLoaders: 1 }
        },
        'postcss-loader'
      ]
    })

    return config;
  },
  */
}
