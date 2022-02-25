import BRadio from './b-radio.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BRadio,
  title: 'Radio',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BRadio },
  props: Object.keys(argTypes),
  template: `
    <div style="display: flex; flex-direction: column;">
      <label>
        <b-radio v-bind="$props" name="radio-group" value="1"></b-radio>
        Click me
      </label>
      <label>
        <b-radio v-bind="$props" name="radio-group" value="2"></b-radio>
        Or me
      </label>
    </div>
  `,
})
Default.args = {
  value: '1',
}

export const Primary: Story = (args, { argTypes }) => ({
  components: { BRadio },
  props: Object.keys(argTypes),
  template: `
    <div style="display: flex; flex-direction: column;">
      <label>
        <b-radio v-bind="$props" name="radio-group" value="1"></b-radio>
        Click me
      </label>
      <label>
        <b-radio v-bind="$props" name="radio-group" value="2"></b-radio>
        Or me
      </label>
    </div>
  `,
})
Primary.args = {
  primary: true,
  value: '1',
}
