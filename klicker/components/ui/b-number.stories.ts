import BNumber from './b-number.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BNumber,
  title: 'Number Input',
} as Meta

export const Dark: Story = (args, { argTypes }) => ({
  components: { BNumber },
  props: Object.keys(argTypes),
  template: `
    <b-number v-bind="$props"></b-number>
  `,
})
Dark.args = {
  dark: true,
  value: 123,
}
