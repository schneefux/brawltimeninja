import CQuery from '../c-query'
import VTierList from './v-tier-list.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { CubeQuery } from '../../types'
import { BrawlerRendererParameters } from '../../fixtures/renderers'

const meta: Meta<VTierList> = {
  component: VTierList,
  title: 'Visualisations/Tier List',
  args: {
    card: {
      title: 'Storybook Demo',
    },
  },
}
export default meta

type Story = StoryObj<VTierList>

const query = JSON.stringify({
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
} satisfies CubeQuery)

export const Default: Story = {
  render: (args) => ({
    components: { CQuery, VTierList },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-tier-list v-bind="{ ...data, ...args }"></v-tier-list>
      </template>
    </c-query>
    `,
  }),
  parameters: {
    ...BrawlerRendererParameters,
  },
}

export const NoCard: Story = {
  render: (args) => ({
    components: { CQuery, VTierList },
    setup() {
      return { args }
    },
    template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <v-tier-list
          v-bind="{ ...data, ...args }"
          :card="undefined"
        ></v-tier-list>
      </template>
    </c-query>
    `,
  }),
  parameters: {
    ...BrawlerRendererParameters,
  },
}
