import CQuery from '../c-query'
import VHeatmap from './v-heatmap.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeQuery } from '../../types'

export default {
  component: VHeatmap,
  title: 'Heatmap',
  args: {
    card: {
      title: 'Storybook Demo',
      fullHeight: true,
    },
  },
} as Meta

const query = JSON.stringify(<CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler', 'mode'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
})

export const Default: Story = (args, { argTypes }) => ({
  components: { CQuery, VHeatmap },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-heatmap style="width: 600px; height: 400px;" v-bind="{ ...data, ...$props }"></v-heatmap>
    </template>
  </c-query>
  `,
})

export const NoCard: Story = (args, { argTypes }) => ({
  components: { CQuery, VHeatmap },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-heatmap style="width: 600px; height: 400px;" v-bind="{ ...data, ...$props }" :card="undefined"></v-heatmap>
    </template>
  </c-query>
  `,
})
