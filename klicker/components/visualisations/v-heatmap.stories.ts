import CQuery from '../c-query'
import VHeatmap from './v-heatmap.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { CubeQuery } from '../../types'

const meta: Meta<VHeatmap> = {
  component: VHeatmap,
  title: 'Visualisations/Heatmap',
  args: {
    card: {
      title: 'Storybook Demo',
    },
  },
}
export default meta

type Story = StoryObj<VHeatmap>

const query = JSON.stringify({
  cubeId: 'map',
  dimensionsIds: ['brawler', 'mode'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
} as CubeQuery)

export const Default: Story = {
  render: (args) => ({
    components: { CQuery, VHeatmap },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-heatmap style="width: 600px; height: 400px;" v-bind="{ ...data, ...args }"></v-heatmap>
      </template>
    </c-query>
    `,
  }),
}

export const NoCard: Story = {
  render: (args) => ({
    components: { CQuery, VHeatmap },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-heatmap style="width: 600px; height: 400px;" v-bind="{ ...data, ...args }" :card="undefined"></v-heatmap>
      </template>
    </c-query>
    `,
  }),
}
