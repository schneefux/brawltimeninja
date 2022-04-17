import CQuery from '../c-query'
import DAuto from './d-auto.vue'
import { Meta, Story } from '@storybook/vue'
import { BrawlerRendererHooks } from '../../fixtures/renderers'
import { CubeQuery } from '../../types'

export default {
  component: DAuto,
  title: 'Visualisations/Dimension Renderer',
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
  components: { CQuery, DAuto },
  props: Object.keys(argTypes),
  template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <d-auto
          v-bind="$props"
          :response="data.response"
          :row="data.response.data[0]"
        ></d-auto>
      </template>
    </c-query>
  `,
})

export const CustomRenderer: Story = (args, { argTypes }) => ({
  components: { CQuery, DAuto },
  props: Object.keys(argTypes),
  template: `
    <c-query :query='${query}'>
      <template v-slot="data">
        <d-auto
          v-bind="$props"
          :response="data.response"
          :row="data.response.data[0]"
        ></d-auto>
      </template>
    </c-query>
  `,
  ...BrawlerRendererHooks,
})

export const CustomRendererCaptioned: Story = CustomRenderer.bind({})
CustomRendererCaptioned.args = {
  captioned: true
}

const queryMultiple = JSON.stringify(<CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler', 'mode'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  limit: 1,
})

export const MixedWithAndWithoutCustomRenderer: Story = (args, { argTypes }) => ({
  components: { CQuery, DAuto },
  props: Object.keys(argTypes),
  template: `
    <c-query :query='${queryMultiple}'>
      <template v-slot="data">
        <d-auto
          v-bind="$props"
          :response="data.response"
          :row="data.response.data[0]"
        ></d-auto>
      </template>
    </c-query>
  `,
  ...BrawlerRendererHooks,
})
