import BMarkdown from './b-markdown.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<BMarkdown> = {
  component: BMarkdown,
  title: 'UI/Markdown Input',
}
export default meta

type Story = StoryObj<BMarkdown>

export const Default: Story = {
  render: (args) => ({
    components: { BMarkdown },
    setup() {
      return { args }
    },
    template: `
      <b-markdown v-bind="args"></b-markdown>
    `,
  }),
  args: {
    modelValue:
  `
  # Hello world!

  This is a *markdown editor demo*.
  `,
  },
}
