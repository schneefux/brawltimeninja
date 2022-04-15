import CQuery from '../c-query'
import VTable from './v-table.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeComparingQuery, CubeQuery } from '../../types'
import { WinRateRendererHooks, BrawlerRendererHooks } from '../../fixtures/renderers'

export default {
  component: VTable,
  title: 'Visualisations/Table',
  args: {
    card: {
      title: 'Storybook Demo',
    },
  },
} as Meta

const query = JSON.stringify(<CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
})

export const Default: Story = (args, { argTypes }) => ({
  components: { CQuery, VTable },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-table v-bind="{ ...data, ...$props }"></v-table>
    </template>
  </c-query>
  `,
})

export const DimensionRenderer: Story = (args, { argTypes }) => ({
  components: { CQuery, VTable },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-table v-bind="{ ...data, ...$props }"></v-table>
    </template>
  </c-query>
  `,
  ...BrawlerRendererHooks,
})

const queryMultipleDimensions = JSON.stringify(<CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler', 'mode'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
})

export const MultipleDimensionOneRenderer: Story = (args, { argTypes }) => ({
  components: { CQuery, VTable },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${queryMultipleDimensions}'>
    <template v-slot="data">
      <v-table v-bind="{ ...data, ...$props }"></v-table>
    </template>
  </c-query>
  `,
  ...BrawlerRendererHooks,
})

export const MetricRenderer: Story = (args, { argTypes }) => ({
  components: { CQuery, VTable },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-table v-bind="{ ...data, ...$props }"></v-table>
    </template>
  </c-query>
  `,
  ...WinRateRendererHooks,
})

export const NoCard: Story = (args, { argTypes }) => ({
  components: { CQuery, VTable },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-table v-bind="{ ...data, ...$props }" :card="undefined"></v-table>
    </template>
  </c-query>
  `,
})

const comparingQuery = JSON.stringify(<CubeComparingQuery>{
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
})

export const Comparing: Story = (args, { argTypes }) => ({
  components: { CQuery, VTable },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${comparingQuery}'>
    <template v-slot="data">
      <v-table v-bind="{ ...data, ...$props }"></v-table>
    </template>
  </c-query>
  `,
})
