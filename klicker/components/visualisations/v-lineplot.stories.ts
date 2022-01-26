import CQuery from '../c-query'
import VLineplot from './v-lineplot.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeComparingQuery, CubeQuery } from '../../types'

export default {
  component: VLineplot,
  title: 'Line Plot',
  args: {
    card: {
      title: 'Storybook Demo',
      fullHeight: true,
    },
  },
} as Meta

const query = JSON.stringify(<CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['season'],
  measurementsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
})

export const Default: Story = (args, { argTypes }) => ({
  components: { CQuery, VLineplot },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-lineplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...$props }"></v-lineplot>
    </template>
  </c-query>
  `,
})

const ciQuery = JSON.stringify(<CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['season'],
  measurementsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  confidenceInterval: true,
})

export const WithConfidenceInterval: Story = (args, { argTypes }) => ({
  components: { CQuery, VLineplot },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${ciQuery}'>
    <template v-slot="data">
      <v-lineplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...$props }"></v-lineplot>
    </template>
  </c-query>
  `,
})

export const NoCard: Story = (args, { argTypes }) => ({
  components: { CQuery, VLineplot },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-lineplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...$props }" :card="undefined"></v-lineplot>
    </template>
  </c-query>
  `,
})

const comparingQuery = JSON.stringify(<CubeComparingQuery>{
  cubeId: 'map',
  name: 'Test Dataset',
  dimensionsIds: ['brawler'],
  measurementsIds: ['winRate'],
  slices: {
    seasonBetween: ['2021-11-01', '2021-12-31'],
  },
  sortId: 'winRate',
  comparing: true,
  reference: {
    name: 'Reference Dataset',
    cubeId: 'map',
    dimensionsIds: ['brawler'],
    measurementsIds: ['winRate'],
    slices: {
      mode: ['gemGrab'],
      seasonBetween: ['2021-11-01', '2021-12-31'],
    },
    sortId: 'winRate',
  },
})

export const Comparing: Story = (args, { argTypes }) => ({
  components: { CQuery, VLineplot },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${comparingQuery}'>
    <template v-slot="data">
      <v-lineplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...$props }"></v-lineplot>
    </template>
  </c-query>
  `,
})
