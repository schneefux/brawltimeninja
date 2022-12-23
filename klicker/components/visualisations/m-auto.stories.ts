import CQuery from '../c-query'
import MAuto from './m-auto.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { CubeQuery } from '../../types'
import { WinRateRendererParameters } from '../../fixtures/renderers'

const meta: Meta<MAuto> = {
  component: MAuto,
  title: 'Visualisations/Metric Renderer',
  args: {
    metricId: 'winRate',
  },
}
export default meta

type Story = StoryObj<MAuto>

const query = JSON.stringify({
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  limit: 1,
} as CubeQuery)

export const Default: Story = {
  render: (args) => ({
    components: { CQuery, MAuto },
    setup() {
      return { args }
    },
    template: `
      <c-query :query='${query}'>
        <template v-slot="data">
          <m-auto
            v-bind="args"
            :response="data.response"
            :row="data.response.data[0]"
          ></m-auto>
        </template>
      </c-query>
    `,
  }),
}

export const CustomRenderer: Story = {
  render: (args) => ({
    components: { CQuery, MAuto },
    setup() {
      return { args }
    },
    template: `
      <c-query :query='${query}'>
        <template v-slot="data">
          <m-auto
            v-bind="args"
            :response="data.response"
            :row="data.response.data[0]"
          ></m-auto>
        </template>
      </c-query>
    `,
  }),
  parameters: {
    ...WinRateRendererParameters,
  },
}
