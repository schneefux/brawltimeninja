import CError from './c-error.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: CError,
  title: 'Query Error',
} as Meta

const Template: Story = (args) => ({
  components: { CError },
  template: `<c-error v-bind="args"></c-error>`,
  setup() {
    return { args }
  },
})

export const WithMessage: Story = Template.bind({})
WithMessage.args = {
  error: 'Connection failed',
}

export const NoMessage: Story = Template.bind({})
NoMessage.args = {
  error: new Error(),
}
