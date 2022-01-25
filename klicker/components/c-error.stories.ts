import CError from './c-error.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: CError,
  title: 'Query Error',
} as Meta

const Template: Story = (args, { argTypes }) => ({
  components: { CError },
  props: Object.keys(argTypes),
  template: `<c-error v-bind="$props"></c-error>`,
})

export const WithMessage: Story = Template.bind({})
WithMessage.args = {
  error: 'Connection failed',
}

export const NoMessage: Story = Template.bind({})
NoMessage.args = {
  error: new Error(),
}
