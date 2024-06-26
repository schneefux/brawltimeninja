import BSplitDashboard from './b-split-dashboard.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<BSplitDashboard> = {
  component: BSplitDashboard,
  title: 'UI/Split Dashboard',
}
export default meta

type Story = StoryObj<BSplitDashboard>

export const Default: Story = {
  render: (args) => ({
    components: { BSplitDashboard },
    setup() {
      return { args }
    },
    template: `
      <b-split-dashboard
        v-bind="args"
      >
        <template v-slot:aside>
          <p>Sticky on the left side</p>
        </template>
        <div style="height: 200vh;">Main content</div>
      </b-split-dashboard>
    `,
  }),
  args: {},
}
