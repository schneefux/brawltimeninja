import BSelect from './b-select.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<BSelect> = {
  component: BSelect,
  title: 'UI/Select',
}
export default meta

type Story = StoryObj<BSelect>

export const Default: Story = {
  render: (args) => ({
    components: { BSelect },
    setup() {
      return { args }
    },
    template: `
      <b-select v-bind="args">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </b-select>
    `,
  }),
  args: {
    modelValue: '1',
  },
}

export const Multiple: Story = {
  render: (args) => ({
    components: { BSelect },
    setup() {
      return { args }
    },
    template: `
      <b-select v-bind="args">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </b-select>
    `,
  }),
  args: {
    modelValue: '1',
    multiple: true,
  },
}
