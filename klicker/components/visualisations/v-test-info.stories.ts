import CQuery from '../c-query'
import VTestInfo from './v-test-info.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { CubeComparingQuery } from '../../types'

const meta: Meta<VTestInfo> = {
  component: VTestInfo,
  title: 'Visualisations/Test Info',
}
export default meta

type Story = StoryObj<VTestInfo>

const comparingQuery = JSON.stringify({
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
} satisfies CubeComparingQuery)

export const Comparing: Story = {
  render: (args) => ({
    components: { CQuery, VTestInfo },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${comparingQuery}'>
      <template v-slot="data">
        <v-test-info v-bind="{ ...data, ...args }"></v-test-info>
      </template>
    </c-query>
    `,
  }),
}
