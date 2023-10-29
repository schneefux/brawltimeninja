import { vueDocgen } from "./vue-docgen";

module.exports = {
  framework: '@storybook/vue3-vite',
  features: {
    interactionsDebugger: true,
  },
  stories: ['../components/**/*.stories.mdx', '../components/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions', 'storybook-addon-themes'],
  async viteFinal(c) {
    c.plugins = c.plugins.filter(p => p.name != 'storybook:vue-docgen-plugin')
    c.plugins.push(vueDocgen()) // patched so that it does not crash when docgen cannot parse a SFC

    c.optimizeDeps.exclude = undefined

    return c
  },
};
