import CDimension from './c-dimension.vue'
import type { Meta, StoryObj } from '@storybook/vue3'
import { CubeComparingQuery, CubeQuery } from '../types'

const meta: Meta<typeof CDimension> = {
  component: CDimension,
  title: 'Editor/Dimension Configurator',
}

export default meta
type Story = StoryObj<typeof CDimension>

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

export const Default: Story = {
  render: (args) => ({
    components: { CDimension },
    setup() {
      return { args }
    },
    template: `
      <c-dimension v-bind="args"></c-dimension>
    `,
  }),
  args: {
    modelValue: query,
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
    components: { CDimension },
    setup() {
      return { args }
    },
    template: `
      <div>
        <c-dimension v-bind="args" comparing></c-dimension>
        <c-dimension v-bind="args"></c-dimension>
      </div>
    `,
  }),
  args: {
    modelValue: comparingQuery,
  },
}
