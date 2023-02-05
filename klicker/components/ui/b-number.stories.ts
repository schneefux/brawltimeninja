import BNumber from './b-number.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<BNumber> = {
  component: BNumber,
  title: 'UI/Number Input',
}
export default meta

type Story = StoryObj<BNumber>

export const Default: Story = {
  render: (args) => ({
    components: { BNumber },
    setup() {
      return { args }
    },
    template: `
      <b-number v-bind="args"></b-number>
    `,
  }),
  args: {
    value: 123,
  },
}
