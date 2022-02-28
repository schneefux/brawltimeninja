import BCheckbox from './b-checkbox.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BCheckbox,
  title: 'UI/Checkbox',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BCheckbox },
  props: Object.keys(argTypes),
  template: `
    <label>
      <b-checkbox v-bind="$props"></b-checkbox>
      Check me
    </label>
  `,
})
Default.args = {
  value: true,
}
