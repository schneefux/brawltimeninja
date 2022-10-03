import CQuery from '../c-query'
import MAuto from './m-auto.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeQuery } from '../../types'
import { WinRateRendererParameters } from '../../fixtures/renderers'

export default {
  component: MAuto,
  title: 'Visualisations/Metric Renderer',
  args: {
    metricId: 'winRate',
  },
} as Meta

const query = JSON.stringify(<CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  limit: 1,
})

export const Default: Story = (args, { argTypes }) => ({
  components: { CQuery, MAuto },
  props: Object.keys(argTypes),
  template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <m-auto
          v-bind="$props"
          :response="data.response"
          :row="data.response.data[0]"
        ></m-auto>
      </template>
    </c-query>
  `,
})

export const CustomRenderer: Story = (args, { argTypes }) => ({
  components: { CQuery, MAuto },
  props: Object.keys(argTypes),
  template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <m-auto
          v-bind="$props"
          :response="data.response"
          :row="data.response.data[0]"
        ></m-auto>
      </template>
    </c-query>
  `,
})
CustomRenderer.parameters = {
  ...WinRateRendererParameters,
}
