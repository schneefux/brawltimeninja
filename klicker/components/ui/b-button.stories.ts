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

export const Dark: Story = Template.bind({})
Dark.args = {
  dark: true,
  md: true,
}

export const Light: Story = Template.bind({})
Light.args = {
  light: true,
  md: true,
}

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

export const Small: Story = Template.bind({})
Small.args = {
  primary: true,
  sm: true,
}

export const ExtraSmall: Story = Template.bind({})
ExtraSmall.args = {
  primary: true,
  xs: true,
}

export const Large: Story = Template.bind({})
Large.args = {
  primary: true,
  lg: true,
}

export const Round: Story = Template.bind({})
Round.args = {
  primary: true,
  round: true,
  md: true,
}

