import CQuery from '../c-query'
import VScatterplot from './v-scatterplot.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeQuery } from '../../types'

export default {
  component: VScatterplot,
  title: 'Scatter Plot',
  args: {
    card: {
      title: 'Storybook Demo',
      fullHeight: true,
    },
  },
} as Meta

const query = JSON.stringify(<CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate', 'trophyChange'],
  slices: {},
  sortId: 'winRate',
})

export const Default: Story = (args, { argTypes }) => ({
  components: { CQuery, VScatterplot },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-scatterplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...$props }"></v-scatterplot>
    </template>
  </c-query>
  `,
})

export const NoCard: Story = (args, { argTypes }) => ({
  components: { CQuery, VScatterplot },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-scatterplot style="width: 600px; height: 400px;" v-bind="{ ...data, ...$props }" :card="undefined"></v-scatterplot>
    </template>
  </c-query>
  `,
})
