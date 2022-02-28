import CConfigurator from './c-configurator.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeComparingQuery, CubeQuery } from '../types'

export default {
  component: CConfigurator,
  title: 'Editor/Query Configurator',
} as Meta

const query = <CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  limit: 5,
}

export const Default: Story = (args, { argTypes }) => ({
  components: { CConfigurator },
  props: Object.keys(argTypes),
  template: `
    <c-configurator v-bind="$props"></c-configurator>
  `,
})
Default.args = {
  value: query,
}

const comparingQuery = <CubeComparingQuery>{
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
}

export const Comparing: Story = (args, { argTypes }) => ({
  components: { CConfigurator },
  props: Object.keys(argTypes),
  template: `
    <c-configurator v-bind="$props"></c-configurator>
  `,
})
Comparing.args = {
  value: comparingQuery,
}
