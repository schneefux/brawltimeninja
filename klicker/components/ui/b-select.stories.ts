import BSelect from './b-select.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BSelect,
  title: 'Select',
} as Meta

export const Dark: Story = (args, { argTypes }) => ({
  components: { BSelect },
  props: Object.keys(argTypes),
  template: `
    <b-select v-bind="$props">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </b-select>
  `,
})
Dark.args = {
  dark: true,
  value: '1',
}

export const Multiple: Story = (args, { argTypes }) => ({
  components: { BSelect },
  props: Object.keys(argTypes),
  template: `
    <b-select v-bind="$props">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </b-select>
  `,
})
Multiple.args = {
  dark: true,
  value: '1',
  multiple: true,
}
