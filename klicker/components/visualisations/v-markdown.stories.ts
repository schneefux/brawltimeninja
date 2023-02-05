import CQuery from '../c-query'
import VMarkdown from './v-markdown.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<VMarkdown> = {
  component: VMarkdown,
  title: 'Visualisations/Markdown',
  args: {
    markdown: `
# Hello World!
This is the *markdown demo*.
    `,
  },
}
export default meta

type Story = StoryObj<VMarkdown>

export const Default: Story = {
  render: (args) => ({
    components: { CQuery, VMarkdown },
    setup() {
      return { args }
    },
    template: `
      <v-markdown v-bind="args" :card="{}"></v-markdown>
    `,
  }),
}

export const NoWrapper: Story = {
  render: (args) => ({
    components: { CQuery, VMarkdown },
    setup() {
      return { args }
    },
    template: `
      <v-markdown v-bind="args"></v-markdown>
    `,
  }),
}
