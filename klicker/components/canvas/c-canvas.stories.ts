import CCanvas from './c-canvas.vue'
import { CubeQuery, Report } from '../../types'
import { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

const meta: Meta<typeof CCanvas> = {
  component: CCanvas,
  title: 'Canvas/Canvas Editor',
}
export default meta

type Story = StoryObj<typeof CCanvas>

const query = {
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
} satisfies CubeQuery

const Template: StoryObj = {
  render: (args) => ({
    components: { CCanvas },
    setup() {
      const model = ref<Report>({
        id: undefined,
        title: 'New Report',
        width: 1200,
        height: 630,
        widgets: [],
      })
      return { args, model }
    },
    template: `<c-canvas v-bind="args" v-model="model"></c-canvas>`,
  })
}

export const Default: Story = {
  ...Template,
  args: {
    defaultQuery: query,
  },
}
