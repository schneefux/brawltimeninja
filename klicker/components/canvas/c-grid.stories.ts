import CGrid from './c-grid.vue'
import { CubeQuery, Grid } from '../../types'
import { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

const meta: Meta<typeof CGrid> = {
  component: CGrid,
  title: 'Canvas/Grid Editor',
}
export default meta

type Story = StoryObj<typeof CGrid>

const query = {
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
} satisfies CubeQuery

const Template: StoryObj = {
  render: (args) => ({
    components: { CGrid },
    setup() {
      const model = ref<Grid>({
        id: undefined,
        title: 'New Dashboard',
        widgets: [],
        columns: undefined,
      })
      return { args, model }
    },
    template: `<c-grid v-bind="args" v-model="model"></c-grid>`,
  })
}

export const Default: Story = {
  ...Template,
  args: {
    defaultQuery: query,
  },
}
