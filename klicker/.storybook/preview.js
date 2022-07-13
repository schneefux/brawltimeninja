import '../components/index.css'
import '../fixtures/layout.css'
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport'

import Vue from 'vue'
import VueCompositionApi from '@vue/composition-api'
Vue.use(VueCompositionApi)

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  viewport: {
    viewports: MINIMAL_VIEWPORTS,
  },
  themes: {
    default: 'dark',
    target: 'body',
    list: [{
      name: 'dark',
      class: ['dark'],
      color: '#000000',
    }, {
      name: 'light',
      class: [],
      color: '#ffffff',
    }]
  }
}
