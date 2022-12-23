import CQuery from '../c-query'
import VGrid from './v-grid.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { CubeQuery } from '../../types'
import { BrawlerRendererParameters, WinRateRendererParameters } from '../../fixtures/renderers'

const meta: Meta<VGrid> = {
  component: VGrid,
  title: 'Visualisations/Grid',
  args: {
    card: {
      title: 'Storybook Demo',
    },
  },
}
export default meta

type Story = StoryObj<VGrid>

const query = JSON.stringify({
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate', 'trophyChange'],
  slices: {},
  sortId: 'winRate',
} as CubeQuery)

export const Default: Story = {
  render: (args) => ({
    components: { CQuery, VGrid },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-grid v-bind="{ ...data, ...args }"></v-grid>
      </template>
    </c-query>
    `,
  }),
  parameters: {
    ...BrawlerRendererParameters,
  },
}

export const NoCard: Story = {
  render: (args) => ({
    components: { CQuery, VGrid },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-grid
          v-bind="{ ...data, ...args }"
          :card="undefined"
        ></v-grid>
      </template>
    </c-query>
    `,
  }),
  parameters: {
    ...BrawlerRendererParameters,
  },
}

export const MetricRenderer: Story = {
  render: (args) => ({
    components: { CQuery, VGrid },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-grid v-bind="{ ...data, ...args }"></v-grid>
      </template>
    </c-query>
    `,
  }),
  parameters: {
    ...WinRateRendererParameters,
  },
}
