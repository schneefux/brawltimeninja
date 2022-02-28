import CQuery from '../c-query'
import VMarkdown from './v-markdown.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: VMarkdown,
  title: 'Visualisations/Markdown',
  args: {
    markdown: `
# Hello World!
This is the *markdown demo*.
    `,
  },
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { CQuery, VMarkdown },
  props: Object.keys(argTypes),
  template: `
    <v-markdown v-bind="$props" :card="{}"></v-markdown>
  `,
})

export const NoCard: Story = (args, { argTypes }) => ({
  components: { CQuery, VMarkdown },
  props: Object.keys(argTypes),
  template: `
    <v-markdown v-bind="$props"></v-markdown>
  `,
})
