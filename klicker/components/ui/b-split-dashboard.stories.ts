import BSplitDashboard from './b-split-dashboard.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BSplitDashboard,
  title: 'UI/Split Dashboard',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BSplitDashboard },
  props: Object.keys(argTypes),
  template: `
    <b-split-dashboard
      v-bind="$props"
    >
      <p slot="aside">Sticky on the left side</p>
      <div style="height: 200vh;">Main content</div>
    </b-split-dashboard>
  `,
})
Default.args = {}
