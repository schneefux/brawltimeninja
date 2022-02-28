import CMetric from './c-metric.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeQuery } from '../types'

export default {
  component: CMetric,
  title: 'Editor/Metric Configurator',
} as Meta

const query = <CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {
    brawler: ['1'],
  },
  sortId: 'winRate',
  limit: 5,
}

export const Single: Story = (args, { argTypes }) => ({
  components: { CMetric },
  props: Object.keys(argTypes),
  template: `
    <c-metric v-bind="$props"></c-metric>
  `,
})
Single.args = {
  value: query,
}

export const Multiple: Story = (args, { argTypes }) => ({
  components: { CMetric },
  props: Object.keys(argTypes),
  template: `
    <c-metric v-bind="$props"></c-metric>
  `,
})
Multiple.args = {
  value: query,
  multiple: true,
}
