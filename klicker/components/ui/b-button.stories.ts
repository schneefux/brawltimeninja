import BButton from './b-button.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<typeof BButton> = {
  component: BButton,
  title: 'UI/Button',
}
export default meta

type Story = StoryObj<typeof BButton>

const Template: StoryObj = {
  render: (args) => ({
    components: { BButton },
    setup() {
      return { args }
    },
    template: `<b-button v-bind="args">Click me</b-button>`,
  })
}

export const Dark: Story = {
  ...Template,
  args: {
    dark: true,
    md: true,
  },
}

export const Light: Story = {
  ...Template,
  args: {
    light: true,
    md: true,
  },
}

export const Primary: Story = {
  ...Template,
  args: {
    primary: true,
    md: true,
  },
}

export const Secondary: Story = {
  ...Template,
  args: {
    secondary: true,
    md: true,
  },
}

export const Small: Story = {
  ...Template,
  args: {
    primary: true,
    sm: true,
  },
}

export const ExtraSmall: Story = {
  ...Template,
  args: {
    primary: true,
    xs: true,
  },
}

export const Large: Story = {
  ...Template,
  args: {
    primary: true,
    lg: true,
  },
}

export const Round: Story = {
  ...Template,
  args: {
    primary: true,
    round: true,
    md: true,
  },
}

