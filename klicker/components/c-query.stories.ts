import CQuery from './c-query'
import { Meta, Story } from '@storybook/vue'
import { CubeComparingQuery, CubeQuery } from '../types'

export default {
  component: CQuery,
  title: 'Editor/Renderless Query',
} as Meta

const query = <CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {
    mode: ['gemGrab'],
  },
  sortId: 'winRate',
  limit: 5,
}

export const Default: Story = (args, { argTypes }) => ({
  components: { CQuery },
  props: Object.keys(argTypes),
  template: `
    <c-query
      v-bind="$props"
    >
      <template v-slot="data">
        <pre>{{ data }}</pre>
      </template>
    </c-query>
  `,
})
Default.args = {
  query,
}

const emptyQuery = <CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {
    mode: ['does not exist'],
  },
  sortId: 'winRate',
  limit: 5,
}

export const EmptySlot: Story = (args, { argTypes }) => ({
  components: { CQuery },
  props: Object.keys(argTypes),
  template: `
    <c-query
      v-bind="$props"
    >
      <span slot="empty">Empty</span>
    </c-query>
  `,
})
EmptySlot.args = {
  query: emptyQuery,
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
  components: { CQuery },
  props: Object.keys(argTypes),
  template: `
    <c-query
      v-bind="$props"
    >
      <template v-slot="data">
        <pre>{{ data }}</pre>
      </template>
    </c-query>
  `,
})
Comparing.args = {
  query: comparingQuery,
}

const errorQuery = <CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['does not exist'],
  slices: {},
  sortId: 'winRate',
  limit: 5,
}

export const Error: Story = (args, { argTypes }) => ({
  components: { CQuery },
  props: Object.keys(argTypes),
  template: `
    <c-query
      v-bind="$props"
    >
      <template v-slot:error="{ error }">
        <pre>{{ error }}</pre>
      </template>
    </c-query>
  `,
})
Error.args = {
  query: errorQuery,
}
