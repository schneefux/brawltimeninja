import CQuery from '../c-query'
import VBigstats from './v-bigstats.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeComparingQuery, CubeQuery } from '../../types'
import { WinRateRendererParameters } from '../../fixtures/renderers'

export default {
  component: VBigstats,
  title: 'Visualisations/Big Statistics',
  args: {
    card: {
      title: 'Storybook Demo',
    },
  },
} as Meta

const query = JSON.stringify(<CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate', 'starRate', 'picks'],
  slices: {},
  sortId: 'winRate',
  limit: 1,
})

export const Default: Story = (args, { argTypes }) => ({
  components: { CQuery, VBigstats },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-bigstats v-bind="{ ...data, ...$props }"></v-bigstats>
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
  components: { CQuery, VBigstats },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${comparingQuery}'>
    <template v-slot="data">
      <v-bigstats v-bind="{ ...data, ...$props }"></v-bigstats>
    </template>
  </c-query>
  `,
})

export const MetricRenderer: Story = (args, { argTypes }) => ({
  components: { CQuery, VBigstats },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-bigstats v-bind="{ ...data, ...$props }"></v-bigstats>
    </template>
  </c-query>
  `,
})
MetricRenderer.parameters = {
  ...WinRateRendererParameters,
}
