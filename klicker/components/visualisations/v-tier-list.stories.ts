import CQuery from '../c-query'
import VTierList from './v-tier-list.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeQuery } from '../../types'

export default {
  component: VTierList,
  title: 'Visualisations/Tier List',
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
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
})

export const Default: Story = (args, { argTypes }) => ({
  components: { CQuery, VTierList },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-tier-list v-bind="{ ...data, ...$props }">
        <template v-slot:dimensions="row">
          <img width="50" :src="'https://media.brawltime.ninja/brawlers/' + row.row.dimensions.brawler.toLowerCase() + '/avatar.png?size=160'">
        </template>
      </v-tier-list>
    </template>
  </c-query>
  `,
})

export const NoCard: Story = (args, { argTypes }) => ({
  components: { CQuery, VTierList },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-tier-list v-bind="{ ...data, ...$props }" :card="undefined">
        <template v-slot:dimensions="row">
          <img width="50" :src="'https://media.brawltime.ninja/brawlers/' + row.row.dimensions.brawler.toLowerCase() + '/avatar.png?size=160'">
        </template>
      </v-tier-list>
    </template>
  </c-query>
  `,
})
