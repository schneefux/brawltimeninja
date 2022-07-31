import BAppHeadNav from './b-app-head-nav.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BAppHeadNav,
  title: 'UI/App Head Navigation',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BAppHeadNav },
  props: Object.keys(argTypes),
  template: `
    <b-app-head-nav v-bind="$props">Header content goes here</b-app-head-nav>
  `,
})
Default.args = {}
