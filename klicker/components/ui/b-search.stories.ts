import BSearch from './b-search.vue'
import { Meta, Story } from '@storybook/vue'
import { getCanvasElementFixed } from '../../fix'
import { expect } from '@storybook/jest'
import { userEvent, within } from '@storybook/testing-library'

export default {
  component: BSearch,
  title: 'UI/Search Box',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BSearch },
  props: Object.keys(argTypes),
  template: `
    <b-search
      v-bind="$props"
      v-model="open"
    >
      <template v-slot="{ query }">
        <p class="bg-black text-white">Results for {{ query }} will be shown here</p>
      </template>
    </b-search>
  `,
  data() {
    return {
      open: false,
    }
  },
})
Default.args = {}
Default.play = async ({ canvasElement }) => {
  canvasElement = getCanvasElementFixed(canvasElement)
  const canvas = within(canvasElement)

  const input = await canvas.findByLabelText('search')
  await userEvent.type(input, 'my query')

  const popup = await canvas.findByText(/Results for/)
  expect(popup).toBeVisible()

  await userEvent.click(canvasElement)
  expect(popup).not.toBeVisible()
}
