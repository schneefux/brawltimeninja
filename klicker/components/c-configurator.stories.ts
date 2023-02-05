import CConfigurator from './c-configurator.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { CubeComparingQuery, CubeQuery } from '../types'

const meta: Meta<CConfigurator> = {
  component: CConfigurator,
  title: 'Editor/Query Configurator',
}
export default meta

type Story = StoryObj<CConfigurator>

const query: CubeQuery = {
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  limit: 5,
}

export const Default: Story = {
  render: (args) => ({
    components: { CConfigurator },
    setup() {
      return { args }
    },
    template: `
      <c-configurator v-bind="args"></c-configurator>
    `,
  }),
  args: {
    modelValue: query,
    configureCube: true,
    configureMetrics: true,
    configureMultipleMetrics: true,
    configureDimensions: true,
    configureCompareMode: true,
  },
}

const comparingQuery: CubeComparingQuery = {
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

export const Comparing: Story = {
  render: (args) => ({
    components: { CConfigurator },
    setup() {
      return { args }
    },
    template: `
      <c-configurator v-bind="args"></c-configurator>
    `,
  }),
  args: {
    modelValue: comparingQuery,
    configureCube: true,
    configureMetrics: true,
    configureMultipleMetrics: true,
    configureDimensions: true,
    configureCompareMode: true,
  },
}
