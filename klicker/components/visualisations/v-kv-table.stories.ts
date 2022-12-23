import CQuery from '../c-query'
import VKvTable from './v-kv-table.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { CubeComparingQuery, CubeQuery } from '../../types'
import { WinRateRendererParameters } from '../../fixtures/renderers'

const meta: Meta<VKvTable> = {
  component: VKvTable,
  title: 'Visualisations/Key-Value Table',
  args: {
    card: {
      title: 'Storybook Demo',
    },
  },
}
export default meta

type Story = StoryObj<VKvTable>

const query = JSON.stringify({
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate', 'starRate', 'picks'],
  slices: {},
  sortId: 'winRate',
  limit: 1,
} as CubeQuery)

export const Default: Story = {
  render: (args) => ({
    components: { CQuery, VKvTable },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 20rem;">
        <c-query :query='${query}'>
          <template v-slot="data">
            <v-kv-table v-bind="{ ...data, ...args }"></v-kv-table>
          </template>
        </c-query>
      </div>
    `,
  }),
}

const comparingQuery = JSON.stringify({
  cubeId: 'map',
  name: 'Test Dataset',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  comparing: true,
  reference: {
    name: 'Reference Dataset',
    cubeId: 'map',
    dimensionsIds: ['brawler'],
    metricsIds: ['winRate'],
    slices: {
      mode: ['gemGrab'],
    },
    sortId: 'winRate',
  },
} as CubeComparingQuery)

export const Comparing: Story = {
  render: (args) => ({
    components: { CQuery, VKvTable },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 20rem;">
        <c-query :query='${comparingQuery}'>
          <template v-slot="data">
            <v-kv-table v-bind="{ ...data, ...args }"></v-kv-table>
          </template>
        </c-query>
      </div>
    `,
  }),
}

export const MetricRenderer: Story = {
  render: (args) => ({
    components: { CQuery, VKvTable },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 20rem;">
        <c-query :query='${query}'>
          <template v-slot="data">
            <v-kv-table v-bind="{ ...data, ...args }"></v-kv-table>
          </template>
        </c-query>
      </div>
    `,
  }),
  parameters: {
    ...WinRateRendererParameters,
  },
}
