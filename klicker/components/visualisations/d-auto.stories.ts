import CQuery from '../c-query'
import DAuto from './d-auto.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { BrawlerRendererParameters } from '../../fixtures/renderers'
import { CubeQuery } from '../../types'

const meta: Meta<DAuto> = {
  component: DAuto,
  title: 'Visualisations/Dimension Renderer',
}
export default meta

type Story = StoryObj<DAuto>

const query = JSON.stringify({
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  limit: 1,
} satisfies CubeQuery)

export const Default: Story = {
  render: (args) => ({
    components: { CQuery, DAuto },
    setup() {
      return { args }
    },
    template: `
      <c-query :query='${query}'>
        <template v-slot="data">
          <d-auto
            v-bind="args"
            :response="data.response"
            :row="data.response.data[0]"
          ></d-auto>
        </template>
      </c-query>
    `,
  }),
}

export const CustomRenderer: Story = {
  render: (args) => ({
    components: { CQuery, DAuto },
    setup() {
      return { args }
    },
    template: `
      <c-query :query='${query}'>
        <template v-slot="data">
          <d-auto
            v-bind="args"
            :response="data.response"
            :row="data.response.data[0]"
          ></d-auto>
        </template>
      </c-query>
    `,
  }),
  parameters: {
    ...BrawlerRendererParameters,
  },
}

export const CustomRendererCaptioned: Story = {
  ...CustomRenderer,
  args: {
    captioned: true
  },
}

const queryMultiple = JSON.stringify({
  cubeId: 'map',
  dimensionsIds: ['brawler', 'mode'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  limit: 1,
} satisfies CubeQuery)

export const MixedWithAndWithoutCustomRenderer: Story = {
  render: (args) => ({
    components: { CQuery, DAuto },
    setup() {
      return { args }
    },
    template: `
      <c-query :query='${queryMultiple}'>
        <template v-slot="data">
          <d-auto
            v-bind="args"
            :response="data.response"
            :row="data.response.data[0]"
          ></d-auto>
        </template>
      </c-query>
    `,
  }),
  parameters: {
    ...BrawlerRendererParameters,
  },
}
