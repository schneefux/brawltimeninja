import CQuery from '../c-query'
import VTestInfo from './v-test-info.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeComparingQuery } from '../../types'

export default {
  component: VTestInfo,
  title: 'Visualisations/Test Info',
} as Meta

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
  components: { CQuery, VTestInfo },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${comparingQuery}'>
    <template v-slot="data">
      <v-test-info v-bind="{ ...data, ...$props }"></v-test-info>
    </template>
  </c-query>
  `,
})
