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
        <b-shimmer slot="content" v-bind="args"></b-shimmer>
      </b-card>
    `,
  }),
  args: {
    heightPx: 100,
    loading: true,
  },
}
