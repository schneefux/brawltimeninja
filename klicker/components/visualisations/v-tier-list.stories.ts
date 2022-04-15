import CQuery from '../c-query'
import VTierList from './v-tier-list.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeQuery } from '../../types'
import { BrawlerRendererHooks } from '../../fixtures/renderers'

export default {
  component: VTierList,
  title: 'Visualisations/Tier List',
  args: {
    card: {
      title: 'Storybook Demo',
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
      <v-tier-list v-bind="{ ...data, ...$props }"></v-tier-list>
    </template>
  </c-query>
  `,
  ...BrawlerRendererHooks,
})

export const NoCard: Story = (args, { argTypes }) => ({
  components: { CQuery, VTierList },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-tier-list
        v-bind="{ ...data, ...$props }"
        :card="undefined"
      ></v-tier-list>
    </template>
  </c-query>
  `,
  ...BrawlerRendererHooks,
})
