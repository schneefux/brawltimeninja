import CError from './c-error.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<CError> = {
  component: CError,
  title: 'Editor/Query Error',
}
export default meta

type Story = StoryObj<CError>

const Template: Story = {
  render: (args) => ({
    components: { CError },
    setup() {
      return { args }
    },
    template: `<c-error v-bind="args"></c-error>`,
  }),
}

export const WithMessage: Story = {
  ...Template,
  args: {
    error: 'Connection failed',
  },
}

export const NoMessage: Story = {
  ...Template,
  args: {
    error: new Error(),
  },
}
