const { loadConfigFromFile, mergeConfig } = require("vite")
const path = require("path")

module.exports = {
  framework: '@storybook/vue3',
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
    builder: '@storybook/builder-vite',
  },
  async viteFinal(previousConfig) {
    const { config } = await loadConfigFromFile(
      path.resolve(__dirname, "../vite.config.ts")
    )
    return mergeConfig(previousConfig, {
      ...config,
    })
  },
}
