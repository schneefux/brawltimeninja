import CQuery from '../c-query'
import VBarplot from './v-barplot.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { CubeComparingQuery, CubeQuery } from '../../types'

const meta: Meta<VBarplot> = {
  component: VBarplot,
  title: 'Visualisations/Bar Plot',
  args: {
    card: {
      title: 'Storybook Demo',
    },
  },
}
export default meta

type Story = StoryObj<VBarplot>

const query = JSON.stringify({
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
} satisfies CubeQuery)

export const Default: Story = {
  render: (args) => ({
    components: { CQuery, VBarplot },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-barplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...args }"></v-barplot>
      </template>
    </c-query>
    `,
  }),
}

const ciQuery = JSON.stringify({
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  confidenceInterval: true,
} satisfies CubeQuery)

export const WithConfidenceInterval: Story = {
  render: (args) => ({
    components: { CQuery, VBarplot },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${ciQuery}'>
      <template v-slot="data">
        <v-barplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...args }"></v-barplot>
      </template>
    </c-query>
    `,
  }),
}

export const NoWrapper: Story = {
  render: (args) => ({
    components: { CQuery, VBarplot },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-barplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...args }" :card="undefined"></v-barplot>
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
    components: { CQuery, VBarplot },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${comparingQuery}'>
      <template v-slot="data">
        <v-barplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...args }"></v-barplot>
      </template>
    </c-query>
    `,
  }),
}
