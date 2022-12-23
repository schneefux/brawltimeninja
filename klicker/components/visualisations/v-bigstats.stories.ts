import CQuery from '../c-query'
import VBigstats from './v-bigstats.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { CubeComparingQuery, CubeQuery } from '../../types'
import { WinRateRendererParameters } from '../../fixtures/renderers'

const meta: Meta<VBigstats> = {
  component: VBigstats,
  title: 'Visualisations/Big Statistics',
  args: {
    card: {
      title: 'Storybook Demo',
    },
  },
}
export default meta

type Story = StoryObj<VBigstats>

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
    components: { CQuery, VBigstats },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-bigstats v-bind="{ ...data, ...args }"></v-bigstats>
      </template>
    </c-query>
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
    components: { CQuery, VBigstats },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${comparingQuery}'>
      <template v-slot="data">
        <v-bigstats v-bind="{ ...data, ...args }"></v-bigstats>
      </template>
    </c-query>
    `,
  }),
}

export const MetricRenderer: Story = {
  render: (args) => ({
    components: { CQuery, VBigstats },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-bigstats v-bind="{ ...data, ...args }"></v-bigstats>
      </template>
    </c-query>
    `,
  }),
  parameters: {
    ...WinRateRendererParameters,
  },
}
