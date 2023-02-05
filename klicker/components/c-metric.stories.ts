import CMetric from './c-metric.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { CubeQuery } from '../types'

const meta: Meta<CMetric> = {
  component: CMetric,
  title: 'Editor/Metric Configurator',
}
export default meta

type Story = StoryObj<CMetric>

const query: CubeQuery = {
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {
    brawler: ['1'],
  },
  sortId: 'winRate',
  limit: 5,
}

export const Single: Story = {
  render: (args) => ({
    components: { CMetric },
    setup() {
      return { args }
    },
    template: `
      <c-metric v-bind="args"></c-metric>
    `,
  }),
  args: {
    modelValue: query,
  },
}

export const Multiple: Story = {
  render: (args) => ({
    components: { CMetric },
    setup() {
      return { args }
    },
    template: `
      <c-metric v-bind="args"></c-metric>
    `,
  }),
  args: {
    modelValue: query,
    multiple: true,
  },
}
