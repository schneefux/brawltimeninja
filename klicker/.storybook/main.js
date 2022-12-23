import {
  mergeConfig
} from "vite";
import alias from "@rollup/plugin-alias";
import path from "path";

module.exports = {
  framework: '@storybook/vue3-vite',
  features: {
    interactionsDebugger: true,
  },
  stories: ['../components/**/*.stories.mdx', '../components/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions', 'storybook-addon-themes', {
    name: '@storybook/addon-postcss',
    options: {
      postcssLoaderOptions: {
        implementation: require('postcss')
      }
    }
  }],
  async viteFinal(config) {
    const c = mergeConfig(config, {
      plugins: [
        alias({
          entries: [{
            find: path.resolve(__dirname, '../composables/klicker.ts'),
            replacement: path.resolve(__dirname, '../fixtures/klicker.shim.ts')
          }, {
            find: '#imports',
            replacement: path.resolve(__dirname, '../fixtures/nuxt.shim.ts')
          }]
        }),
      ],
    })

    c.build = { target: 'es2017' }
    c.optimizeDeps.exclude = undefined

    return c
  },
};
