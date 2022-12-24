import CQuery from './c-query'
import type { Meta, StoryObj } from '@storybook/vue3'
import { CubeComparingQuery, CubeQuery } from '../types'

const meta: Meta<typeof CQuery> = {
  component: CQuery,
  title: 'Editor/Renderless Query',
}

export default meta
type Story = StoryObj<typeof CQuery>

const query: CubeQuery = {
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {
    mode: ['gemGrab'],
  },
  sortId: 'winRate',
  limit: 5,
}

export const Default: StoryObj = {
  render: (args) => ({
    components: { CQuery },
    setup() {
      return { args }
    },
    template: `
      <c-query v-bind="args">
        <template v-slot="data">
          <pre>{{ data }}</pre>
        </template>
      </c-query>
    `,
  }),
  args: {
    query,
  },
}

const emptyQuery: CubeQuery = {
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {
    mode: ['does not exist'],
  },
  sortId: 'winRate',
  limit: 5,
}

export const EmptySlot: Story = {
  render: (args) => ({
    components: { CQuery },
    setup() {
      return { args }
    },
    template: `
      <c-query v-bind="args">
        <template v-slot:empty>
          <span>Empty</span>
        </template>
      </c-query>
    `,
  }),
  args: {
    query: emptyQuery,
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
    components: { CQuery },
    setup() {
      return { args }
    },
    template: `
      <c-query v-bind="args">
        <template v-slot="data">
          <pre>{{ data }}</pre>
        </template>
      </c-query>
    `,
  }),
  args: {
    query: comparingQuery,
  },
}

const errorQuery: CubeQuery = {
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['does not exist'],
  slices: {},
  sortId: 'winRate',
  limit: 5,
}

export const Error: Story = {
  render: (args) => ({
    components: { CQuery },
    setup() {
      return { args }
    },
    template: `
      <c-query v-bind="args">
        <template v-slot:error="{ error }">
          <pre>{{ error }}</pre>
        </template>
      </c-query>
    `,
  }),
  args: {
    query: errorQuery,
  },
}
