import BShimmer from './b-shimmer.vue'
import BCard from './b-card.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BShimmer,
  title: 'Shimmer',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BCard, BShimmer },
  props: Object.keys(argTypes),
  template: `
    <b-card title="Storybook Demo" sm>
      <b-shimmer slot="content" v-bind="$props"></b-shimmer>
    </b-card>
  `,
})
Default.args = {
  heightPx: 100,
  loading: true,
}
