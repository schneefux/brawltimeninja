import CQuery from '../c-query'
import VTable from './v-table.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { CubeComparingQuery, CubeQuery } from '../../types'
import { BrawlerRendererParameters, WinRateRendererParameters } from '../../fixtures/renderers'

const meta: Meta<VTable> = {
  component: VTable,
  title: 'Visualisations/Table',
  args: {
    card: {
      title: 'Storybook Demo',
    },
  },
}
export default meta

type Story = StoryObj<VTable>

const query = JSON.stringify({
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
} satisfies CubeQuery)

export const Default: Story = {
  render: (args) => ({
    components: { CQuery, VTable },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-table v-bind="{ ...data, ...args }"></v-table>
      </template>
    </c-query>
    `,
  }),
}

export const DimensionRenderer: Story = {
  render: (args) => ({
    components: { CQuery, VTable },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-table v-bind="{ ...data, ...args }"></v-table>
      </template>
    </c-query>
    `,
  }),
  parameters: {
    ...BrawlerRendererParameters,
  },
}

const queryMultipleDimensions = JSON.stringify({
  cubeId: 'map',
  dimensionsIds: ['brawler', 'mode'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
} satisfies CubeQuery)

export const MultipleDimensionOneRenderer: Story = {
  render: (args) => ({
    components: { CQuery, VTable },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${queryMultipleDimensions}'>
      <template v-slot="data">
        <v-table v-bind="{ ...data, ...args }"></v-table>
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
    components: { CQuery, VTable },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-table v-bind="{ ...data, ...args }"></v-table>
      </template>
    </c-query>
    `,
  }),
  parameters: {
    ...WinRateRendererParameters,
  },
}

export const NoCard: Story = {
  render: (args) => ({
    components: { CQuery, VTable },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-table v-bind="{ ...data, ...args }" :card="undefined"></v-table>
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
} satisfies CubeComparingQuery)

export const Comparing: Story = {
  render: (args) => ({
    components: { CQuery, VTable },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${comparingQuery}'>
      <template v-slot="data">
        <v-table v-bind="{ ...data, ...args }"></v-table>
      </template>
    </c-query>
    `,
  }),
};
