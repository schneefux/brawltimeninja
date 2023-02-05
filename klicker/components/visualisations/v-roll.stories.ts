import CQuery from '../c-query'
import VRoll from './v-roll.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { CubeComparingQuery, CubeQuery } from '../../types'
import { BrawlerRendererParameters, WinRateRendererParameters } from '../../fixtures/renderers'

const meta: Meta<VRoll> = {
  component: VRoll,
  title: 'Visualisations/Roll',
}
export default meta

type Story = StoryObj<VRoll>

const query = JSON.stringify({
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  limit: 5,
} satisfies CubeQuery)

const Template: Story = {
  render: (args) => ({
    components: { CQuery, VRoll },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-roll v-bind="{ ...data, ...args }"></v-roll>
      </template>
    </c-query>
    `,
  }),
}

export const Default: Story = {
  ...Template
}

export const DimensionRenderer: Story = {
  render: (args) => ({
    components: { CQuery, VRoll },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-roll v-bind="{ ...data, ...args }"></v-roll>
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
    components: { CQuery, VRoll },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-roll v-bind="{ ...data, ...args }"></v-roll>
      </template>
    </c-query>
    `,
  }),
  parameters: {
    ...WinRateRendererParameters,
  },
}

const queryMultiple = JSON.stringify({
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate', 'starRate'],
  slices: {},
  sortId: 'winRate',
  limit: 5,
} satisfies CubeQuery)

export const MultipleMetrics: Story = {
  render: (args) => ({
    components: { CQuery, VRoll },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${queryMultiple}'>
      <template v-slot="data">
        <v-roll v-bind="{ ...data, ...args }"></v-roll>
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
    components: { CQuery, VRoll },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${comparingQuery}'>
      <template v-slot="data">
        <v-roll v-bind="{ ...data, ...args }"></v-roll>
      </template>
    </c-query>
    `,
  }),
}
