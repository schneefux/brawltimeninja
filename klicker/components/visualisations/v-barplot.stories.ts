import CQuery from '../c-query'
import VBarplot from './v-barplot.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeComparingQuery, CubeQuery } from '../../types'

export default {
  component: VBarplot,
  title: 'Bar Plot',
  args: {
    card: {
      title: 'Storybook Demo',
      fullHeight: true,
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
  components: { CQuery, VBarplot },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-barplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...$props }"></v-barplot>
    </template>
  </c-query>
  `,
})

const ciQuery = JSON.stringify(<CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  confidenceInterval: true,
})

export const WithConfidenceInterval: Story = (args, { argTypes }) => ({
  components: { CQuery, VBarplot },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${ciQuery}'>
    <template v-slot="data">
      <v-barplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...$props }"></v-barplot>
    </template>
  </c-query>
  `,
})

export const NoCard: Story = (args, { argTypes }) => ({
  components: { CQuery, VBarplot },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-barplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...$props }" :card="undefined"></v-barplot>
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
  components: { CQuery, VBarplot },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${comparingQuery}'>
    <template v-slot="data">
      <v-barplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...$props }"></v-barplot>
    </template>
  </c-query>
  `,
})
