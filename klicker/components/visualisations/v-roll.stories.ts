import CQuery from '../c-query'
import VRoll from './v-roll.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeComparingQuery, CubeQuery } from '../../types'

export default {
  component: VRoll,
  title: 'Visualisations/Roll',
} as Meta

const query = JSON.stringify(<CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  limit: 5,
})

const Template: Story = (args, { argTypes }) => ({
  components: { CQuery, VRoll },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-roll v-bind="{ ...data, ...$props }"></v-roll>
    </template>
  </c-query>
  `,
})

export const Default: Story = Template.bind({})

const ImageTemplate: Story = (args, { argTypes }) => ({
  components: { CQuery, VRoll },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-roll v-bind="{ ...data, ...$props }">
        <template v-slot:dimensions="row">
          <img width="50" :src="'https://media.brawltime.ninja/brawlers/' + row.row.dimensions.brawler.toLowerCase() + '/avatar.png?size=160'">
        </template>
      </v-roll>
    </template>
  </c-query>
  `,
})

export const Image: Story = ImageTemplate.bind({})

const queryMultiple = JSON.stringify(<CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate', 'starRate'],
  slices: {},
  sortId: 'winRate',
  limit: 5,
})

export const MultipleMetrics: Story = (args, { argTypes }) => ({
  components: { CQuery, VRoll },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${queryMultiple}'>
    <template v-slot="data">
      <v-roll v-bind="{ ...data, ...$props }"></v-roll>
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
  components: { CQuery, VRoll },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${comparingQuery}'>
    <template v-slot="data">
      <v-roll v-bind="{ ...data, ...$props }"></v-roll>
    </template>
  </c-query>
  `,
})
