import BCookieConsent from './b-cookie-consent.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BCookieConsent,
  title: 'UI/Cookie Consent',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BCookieConsent },
  props: Object.keys(argTypes),
  template: `
    <b-cookie-consent v-bind="$props"></b-cookie-consent>
  `,
})
Default.args = {}
