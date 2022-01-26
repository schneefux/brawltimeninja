import BMarkdown from './b-markdown.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BMarkdown,
  title: 'Markdown Input',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BMarkdown },
  props: Object.keys(argTypes),
  template: `
    <b-markdown v-bind="$props"></b-markdown>
  `,
})
Default.args = {
  value:
`
# Hello world!

This is a *markdown editor demo*.
`,
}
