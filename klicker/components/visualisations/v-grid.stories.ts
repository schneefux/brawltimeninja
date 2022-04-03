import CQuery from '../c-query'
import VGrid from './v-grid.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeQuery } from '../../types'
import { BrawlerRendererHooks, WinRateRendererHooks } from '../../fixtures/renderers'

export default {
  component: VGrid,
  title: 'Visualisations/Grid',
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
  components: { CQuery, VGrid },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-grid v-bind="{ ...data, ...$props }"></v-grid>
    </template>
  </c-query>
  `,
  ...BrawlerRendererHooks,
})

export const NoCard: Story = (args, { argTypes }) => ({
  components: { CQuery, VGrid },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-grid
        v-bind="{ ...data, ...$props }"
        :card="undefined"
      ></v-grid>
    </template>
  </c-query>
  `,
  ...BrawlerRendererHooks,
})

export const MetricRenderer: Story = (args, { argTypes }) => ({
  components: { CQuery, VGrid },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-grid v-bind="{ ...data, ...$props }"></v-grid>
    </template>
  </c-query>
  `,
  ...WinRateRendererHooks,
})
