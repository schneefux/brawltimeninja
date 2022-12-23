import BTextarea from './b-textarea.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<BTextarea> = {
  component: BTextarea,
  title: 'UI/Textarea',
}
export default meta

type Story = StoryObj<BTextarea>

export const Default: Story = {
  render: (args) => ({
    components: { BTextarea },
    setup() {
      return { args }
    },
    template: `
      <b-textarea v-bind="args"></b-textarea>
    `,
  }),
  args: {
    value: 'Enter some text here',
  },
}
