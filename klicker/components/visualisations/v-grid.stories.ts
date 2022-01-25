import CQuery from '../c-query'
import VGrid from './v-grid.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeQuery } from '../../types'

export default {
  component: VGrid,
  title: 'Grid',
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
  measurementsIds: ['winRate', 'trophyChange'],
  slices: {},
  sortId: 'winRate',
})

export const Default: Story = (args, { argTypes }) => ({
  components: { CQuery, VGrid },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-grid v-bind="{ ...data, ...$props }">
        <template v-slot:dimensions="row">
          <img width="50" :src="'https://media.brawltime.ninja/brawlers/' + row.row.dimensions.brawler.toLowerCase() + '/avatar.png?size=160'">
        </template>
      </v-grid>
    </template>
  </c-query>
  `,
})

export const NoCard: Story = (args, { argTypes }) => ({
  components: { CQuery, VGrid },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-grid v-bind="{ ...data, ...$props }" :card="undefined">
        <template v-slot:dimensions="row">
          <img width="50" :src="'https://media.brawltime.ninja/brawlers/' + row.row.dimensions.brawler.toLowerCase() + '/avatar.png?size=160'">
        </template>
      </v-grid>
    </template>
  </c-query>
  `,
})
