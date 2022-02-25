import BTextarea from './b-textarea.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BTextarea,
  title: 'Textarea',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BTextarea },
  props: Object.keys(argTypes),
  template: `
    <b-textarea v-bind="$props"></b-textarea>
  `,
})
Default.args = {
  value: 'Enter some text here',
}
