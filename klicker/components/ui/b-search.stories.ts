import BSearch from './b-search.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { getCanvasElementFixed } from '../../fix'
import { expect } from '@storybook/jest'
import { userEvent, within } from '@storybook/testing-library'
import { ref } from 'vue'

const meta: Meta<BSearch> = {
  component: BSearch,
  title: 'UI/Search Box',
}
export default meta

type Story = StoryObj<BSearch>

export const Default: Story = {
  render: () => ({
    components: { BSearch },
    setup() {
      const open = ref(false)
      return { open }
    },
    template: `
      <b-search v-model="open">
        <template v-slot="{ query }">
          <p class="bg-black text-white">Results for {{ query }} will be shown here</p>
        </template>
      </b-search>
    `,
  }),
  play: async ({ canvasElement }) => {
    canvasElement = getCanvasElementFixed(canvasElement)
    const canvas = within(canvasElement)

    const input = await canvas.findByLabelText('search')
    await userEvent.type(input, 'my query')

    const popup = await canvas.findByText(/Results for/)
    expect(popup).toBeVisible()

    await userEvent.click(canvasElement)
    expect(popup).not.toBeVisible()
  },
}
