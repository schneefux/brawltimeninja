import CQuery from '../c-query'
import VKvTable from './v-kv-table.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeComparingQuery, CubeQuery } from '../../types'

export default {
  component: VKvTable,
  title: 'Key-Value Table Visualisation',
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
  metricsIds: ['winRate', 'starRate', 'picks'],
  slices: {},
  sortId: 'winRate',
  limit: 1,
})

export const Default: Story = (args, { argTypes }) => ({
  components: { CQuery, VKvTable },
  props: Object.keys(argTypes),
  template: `
    <div style="width: 20rem;">
      <c-query :query='${query}'>
        <template v-slot="data">
          <v-kv-table v-bind="{ ...data, ...$props }"></v-kv-table>
        </template>
      </c-query>
    </div>
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
  components: { CQuery, VKvTable },
  props: Object.keys(argTypes),
  template: `
    <div style="width: 20rem;">
      <c-query :query='${comparingQuery}'>
        <template v-slot="data">
          <v-kv-table v-bind="{ ...data, ...$props }"></v-kv-table>
        </template>
      </c-query>
    </div>
  `,
})

export const WithSlot: Story = (args, { argTypes }) => ({
  components: { CQuery, VKvTable },
  props: Object.keys(argTypes),
  template: `
    <div style="width: 20rem;">
      <c-query :query='${query}'>
        <template v-slot="data">
          <v-kv-table v-bind="{ ...data, ...$props }">
            <template v-slot:[\`metrics.winRate\`]="{ row }">
              <b>"{{ row.metrics.winRate }}"</b>
            </template>
          </v-kv-table>
        </template>
      </c-query>
    </div>
  `,
})
