import '../components/index.css'
import '../fixtures/layout.css'
import './theme.css'
import { MINIMAL_VIEWPORTS } from '@storybook/addon-viewport'
import { decorator as klickerConfigDecorator } from '../fixtures/klicker.service';

// FIXME remove after upgrading jest https://github.com/storybookjs/storybook/issues/15391#issuecomment-873472669
import * as jest from "jest-mock";
window.jest = jest;

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

export const decorators = [klickerConfigDecorator]
