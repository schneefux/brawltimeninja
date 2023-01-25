import CMoveableWidget from './c-moveable-widget.vue'
import { CubeQuery, ReportWidget } from '../../types'
import { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

const meta: Meta<typeof CMoveableWidget> = {
  component: CMoveableWidget,
  title: 'Canvas/Moveable Widget',
}
export default meta

type Story = StoryObj<typeof CMoveableWidget>

const query = {
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
} satisfies CubeQuery

const Template: StoryObj = {
  render: (args) => ({
    components: { CMoveableWidget },
    setup() {
      const model = ref<ReportWidget>({
        id: '1',
        query,
        component: 'v-barplot',
        props: {},
        frame: {
          translate: [200, 300],
          scale: [1, 1],
          rotate: 0,
          width: 200,
          height: 300,
        },
      })
      const container = ref()
      return { args, model, container }
    },
    template: `<div ref="container" class="relative">
      <c-moveable-widget v-bind="args" v-model="model" :container="container"></c-moveable-widget>
    </div>`,
  })
}

export const Default: Story = {
  ...Template,
  args: {
    bounds: {
      left: 0,
      top: 0,
      right: 800,
      bottom: 600,
    },
  },
}
