import BCheckbox from './b-checkbox.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<BCheckbox> = {
  component: BCheckbox,
  title: 'UI/Checkbox',
}
export default meta

type Story = StoryObj<BCheckbox>

export const Default: Story = {
  render: (args) => ({
    components: { BCheckbox },
    setup() {
      return { args }
    },
    template: `
      <label>
        <b-checkbox v-bind="args"></b-checkbox>
        Check me
      </label>
    `,
  }),
  args: {
    value: true,
  },
}
