import BButton from './b-button.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BButton,
  title: 'Button',
} as Meta

const Template: Story = (args, { argTypes }) => ({
  components: { BButton },
  props: Object.keys(argTypes),
  template: `<b-button v-bind="$props">Click me</b-button>`,
})

export const Primary: Story = Template.bind({})
Primary.args = {
  primary: true,
  md: true,
}

export const Secondary: Story = Template.bind({})
Secondary.args = {
  secondary: true,
  md: true,
}
