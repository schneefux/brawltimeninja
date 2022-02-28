import BFakeSelect from './b-fake-select.vue'
import { Meta, Story } from '@storybook/vue'
import { userEvent, within } from '@storybook/testing-library'
import { expect } from '@storybook/jest'

export default {
  component: BFakeSelect,
  title: 'UI/Custom Select',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BFakeSelect },
  props: Object.keys(argTypes),
  template: `
    <b-fake-select v-bind="$props">
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
})
Default.args = {}
Default.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement)

  const button = await canvas.findByRole('button')
  await userEvent.click(button)
  const content = await canvas.findByText(/Inner content/)
  expect(content).toBeVisible()
  await userEvent.click(button)
  expect(content).not.toBeVisible()
}
