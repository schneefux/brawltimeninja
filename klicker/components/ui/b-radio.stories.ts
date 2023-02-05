import BRadio from './b-radio.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<BRadio> = {
  component: BRadio,
  title: 'UI/Radio',
}
export default meta

type Story = StoryObj<BRadio>

export const Default: Story = {
  render: (args) => ({
    components: { BRadio },
    setup() {
      return { args }
    },
    template: `
      <div style="display: flex; flex-direction: column;">
        <label>
          <b-radio v-bind="args" name="radio-group" value="1"></b-radio>
          Click me
        </label>
        <label>
          <b-radio v-bind="args" name="radio-group" value="2"></b-radio>
          Or me
        </label>
      </div>
    `,
  }),
  args: {
    value: '1',
  },
}

export const Primary: Story = {
  render: (args) => ({
    components: { BRadio },
    setup() {
      return { args }
    },
    template: `
      <div style="display: flex; flex-direction: column;">
        <label>
          <b-radio v-bind="args" name="radio-group" value="1"></b-radio>
          Click me
        </label>
        <label>
          <b-radio v-bind="args" name="radio-group" value="2"></b-radio>
          Or me
        </label>
      </div>
    `,
  }),
  args: {
    primary: true,
    value: '1',
  },
}
