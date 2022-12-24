import CQuery from '../c-query'
import VScatterplot from './v-scatterplot.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { CubeQuery } from '../../types'

const meta: Meta<VScatterplot> = {
  component: VScatterplot,
  title: 'Visualisations/Scatter Plot',
  args: {
    card: {
      title: 'Storybook Demo',
    },
  },
}
export default meta

type Story = StoryObj<VScatterplot>

const query = JSON.stringify({
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate', 'trophyChange'],
  slices: {},
  sortId: 'winRate',
} satisfies CubeQuery)

export const Default: Story = {
  render: (args) => ({
    components: { CQuery, VScatterplot },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-scatterplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...args }"></v-scatterplot>
      </template>
    </c-query>
    `,
  }),
}

export const NoCard: Story = {
  render: (args) => ({
    components: { CQuery, VScatterplot },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-scatterplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...args }" :card="undefined"></v-scatterplot>
      </template>
    </c-query>
    `,
  }),
}
