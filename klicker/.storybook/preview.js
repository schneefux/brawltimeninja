import '../components/index.css'
import '../fixtures/layout.css'
import './theme.css'
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  viewport: {
    viewports: MINIMAL_VIEWPORTS,
  },
  themes: {
    default: 'dark',
    list: [{
      name: 'dark',
      class: ['dark', 'bg-background', 'text-text'],
      color: '#000000',
    }, {
      name: 'light',
      class: ['light', 'bg-background', 'text-text'],
      color: '#ffffff',
    }]
  }
}
