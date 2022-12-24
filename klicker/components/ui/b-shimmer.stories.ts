import BShimmer from './b-shimmer.vue'
import BCard from './b-card.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<BShimmer> = {
  component: BShimmer,
  title: 'UI/Shimmer',
}
export default meta

type Story = StoryObj<BShimmer>

export const Default: Story = {
  render: (args) => ({
    components: { BCard, BShimmer },
    setup() {
      return { args }
    },
    template: `
      <b-card title="Storybook Demo" sm>
        <template v-slot:content>
          <b-shimmer v-bind="args"></b-shimmer>
        </template>
      </b-card>
    `,
  }),
  args: {
    heightPx: 100,
    loading: true,
  },
}
