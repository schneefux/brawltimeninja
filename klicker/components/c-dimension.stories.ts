import CDimension from './c-dimension.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeComparingQuery, CubeQuery } from '../types'

export default {
  component: CDimension,
  title: 'Dimension Configurator',
} as Meta

const query = <CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  measurementsIds: ['winRate'],
  slices: {
    brawler: ['1'],
  },
  sortId: 'winRate',
  limit: 5,
}

export const Default: Story = (args, { argTypes }) => ({
  components: { CDimension },
  props: Object.keys(argTypes),
  template: `
    <c-dimension v-bind="$props"></c-dimension>
  `,
})
Default.args = {
  value: query,
}

const comparingQuery = <CubeComparingQuery>{
  cubeId: 'map',
  name: 'Test Dataset',
  dimensionsIds: ['brawler'],
  measurementsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  comparing: true,
  reference: {
    name: 'Reference Dataset',
    cubeId: 'map',
    dimensionsIds: ['brawler'],
    measurementsIds: ['winRate'],
    slices: {
      mode: ['gemGrab'],
    },
    sortId: 'winRate',
  },
}

export const Comparing: Story = (args, { argTypes }) => ({
  components: { CDimension },
  props: Object.keys(argTypes),
  template: `
    <div>
      <c-dimension v-bind="$props" comparing></c-dimension>
      <c-dimension v-bind="$props"></c-dimension>
    </div>
  `,
})
Comparing.args = {
  value: comparingQuery,
}
