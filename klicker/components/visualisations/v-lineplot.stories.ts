import CQuery from '../c-query'
import VLineplot from './v-lineplot.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { CubeComparingQuery, CubeQuery } from '../../types'

const meta: Meta<VLineplot> = {
  component: VLineplot,
  title: 'Visualisations/Line Plot',
  args: {
    card: {
      title: 'Storybook Demo',
    },
  },
}
export default meta

type Story = StoryObj<VLineplot>

const query = JSON.stringify({
  cubeId: 'map',
  dimensionsIds: ['season'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
} satisfies CubeQuery)

export const Default: Story = {
  render: (args) => ({
    components: { CQuery, VLineplot },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-lineplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...args }"></v-lineplot>
      </template>
    </c-query>
    `,
  }),
}

const ciQuery = JSON.stringify({
  cubeId: 'map',
  dimensionsIds: ['season'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  confidenceInterval: true,
} satisfies CubeQuery)

export const WithConfidenceInterval: Story = {
  render: (args) => ({
    components: { CQuery, VLineplot },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${ciQuery}'>
      <template v-slot="data">
        <v-lineplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...args }"></v-lineplot>
      </template>
    </c-query>
    `,
  }),
}

export const NoCard: Story = {
  render: (args) => ({
    components: { CQuery, VLineplot },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-lineplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...args }" :card="undefined"></v-lineplot>
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
  slices: {
    seasonBetween: ['2021-11-01', '2021-12-31'],
  },
  sortId: 'winRate',
  comparing: true,
  reference: {
    name: 'Reference Dataset',
    cubeId: 'map',
    dimensionsIds: ['brawler'],
    metricsIds: ['winRate'],
    slices: {
      mode: ['gemGrab'],
      seasonBetween: ['2021-11-01', '2021-12-31'],
    },
    sortId: 'winRate',
  },
} satisfies CubeComparingQuery)

export const Comparing: Story = {
  render: (args) => ({
    components: { CQuery, VLineplot },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${comparingQuery}'>
      <template v-slot="data">
        <v-lineplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...args }"></v-lineplot>
      </template>
    </c-query>
    `,
  }),
}
