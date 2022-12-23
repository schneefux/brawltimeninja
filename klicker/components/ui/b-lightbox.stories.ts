import BLightbox from './b-lightbox.vue'
import BButton from './b-button.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { userEvent, within } from '@storybook/testing-library'
import { expect } from '@storybook/jest'
import { getCanvasElementFixed } from '../../fix'

const meta: Meta<BLightbox> = {
  component: BLightbox,
  title: 'UI/Lightbox',
}
export default meta

type Story = StoryObj<BLightbox>

export const Default: Story = {
  render: () => ({
    components: { BLightbox, BButton },
    template: `
      <div>
        <b-button primary md @click="triggered = true">Open Lightbox</b-button>
        <b-lightbox v-model="triggered">
          Content goes here
        </b-lightbox>
      </div>
    `,
    data() {
      return {
        triggered: false,
      }
    },
  }),
  args: {},
  play: async ({ canvasElement }) => {
    canvasElement = getCanvasElementFixed(canvasElement)
    const canvas = within(canvasElement)
    const body = within(document.body)

    const button = await canvas.findByRole('button')
    await userEvent.click(button)
    const content = await body.findByText(/Content goes here/)
    expect(content).toBeVisible()
    const close = await body.findByLabelText('close')
    expect(close).toBeVisible()
    await userEvent.click(close)
    expect(close).not.toBeVisible()
    expect(content).not.toBeVisible()
  },
}
