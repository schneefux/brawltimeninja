import BCheckbox from './b-checkbox.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BCheckbox,
  title: 'Checkbox',
} as Meta

export const Dark: Story = (args, { argTypes }) => ({
  components: { BCheckbox },
  props: Object.keys(argTypes),
  template: `
    <label>
      <b-checkbox v-bind="$props"></b-checkbox>
      Check me
    </label>
  `,
})
Dark.args = {
  dark: true,
  value: true,
}
