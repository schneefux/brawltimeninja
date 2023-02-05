import BCookieConsent from './b-cookie-consent.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<BCookieConsent> = {
  component: BCookieConsent,
  title: 'UI/Cookie Consent',
}
export default meta

type Story = StoryObj<BCookieConsent>

export const Default: Story = {
  render: (args) => ({
    components: { BCookieConsent },
    setup() {
      return { args }
    },
    template: `
      <b-cookie-consent v-bind="args"></b-cookie-consent>
    `,
  }),
  args: {},
}
