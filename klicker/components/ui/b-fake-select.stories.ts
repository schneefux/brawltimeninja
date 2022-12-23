import BFakeSelect from './b-fake-select.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { userEvent, within } from '@storybook/testing-library'
import { expect } from '@storybook/jest'
import { getCanvasElementFixed } from '../../fix'

const meta: Meta<BFakeSelect> = {
  component: BFakeSelect,
  title: 'UI/Custom Select',
}
export default meta

type Story = StoryObj<BFakeSelect>

export const Default: Story = {
  render: (args) => ({
    components: { BFakeSelect },
    setup() {
      return { args }
    },
    template: `
      <b-fake-select v-bind="args">
        <span slot="preview">Preview</span>
        <div style="width: 200px">
          <p>Inner content can be anything</p>
          <div style="display: flex;">
            <img width="50" src="https://media.brawltime.ninja/brawlers/shelly/avatar.png?size=160">
            <img width="50" src="https://media.brawltime.ninja/brawlers/colt/avatar.png?size=160">
            <img width="50" src="https://media.brawltime.ninja/brawlers/dynamike/avatar.png?size=160">
          </div>
        </div>
      </b-fake-select>
    `,
  }),
  args: {},
  play: async ({ canvasElement }) => {
    canvasElement = getCanvasElementFixed(canvasElement)
    const canvas = within(canvasElement)

    const button = await canvas.findByRole('button')
    await userEvent.click(button)
    const content = await canvas.findByText(/Inner content/)
    expect(content).toBeVisible()
    await userEvent.click(button)
    expect(content).not.toBeVisible()
  },
}
