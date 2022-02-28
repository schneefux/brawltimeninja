import BTextbox from './b-textbox.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BTextbox,
  title: 'UI/Textbox',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BTextbox },
  props: Object.keys(argTypes),
  template: `
    <b-textbox v-bind="$props"></b-textbox>
  `,
})
Default.args = {
  value: 'Enter some text here',
}
