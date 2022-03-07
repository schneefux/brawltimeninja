import '../components/index.css'
import '../fixtures/layout.css'
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport'
import { addDecorator } from '@storybook/vue'
import { withThemes } from 'storybook-addon-themes/vue'

import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
Vue.use(VueCompositionApi)

addDecorator(withThemes)

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  viewport: {
    viewports: MINIMAL_VIEWPORTS,
  },
  themes: {
    default: 'dark',
    list: [{
      name: 'dark',
      class: ['dark'],
      color: '#000000',
      default: true,
    }, {
      name: 'light',
      class: [],
      color: '#ffffff',
      default: true,
    }]
  }
}
