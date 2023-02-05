import BTextbox from './b-textbox.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<BTextbox> = {
  component: BTextbox,
  title: 'UI/Textbox',
}
export default meta

type Story = StoryObj<BTextbox>

export const Default: Story = {
  render: (args) => ({
    components: { BTextbox },
    setup() {
      return { args }
    },
    template: `
      <b-textbox v-bind="args"></b-textbox>
    `,
  }),
  args: {
    modelValue: 'Enter some text here',
  },
}
