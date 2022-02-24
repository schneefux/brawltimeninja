import BScrollingDashboard from './b-scrolling-dashboard.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BScrollingDashboard,
  title: 'Horizontally Scrolling Dashboard',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BScrollingDashboard },
  props: Object.keys(argTypes),
  template: `
    <b-scrolling-dashboard v-bind="$props">
    </b-scrolling-dashboard>
  `,
})
Default.args = {}
