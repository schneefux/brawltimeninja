import BTabs from './b-tabs.vue'
import { within, userEvent, waitFor } from '@storybook/testing-library'
import { expect } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/vue3'
import { getCanvasElementFixed } from '../../fix'

const meta: Meta<BTabs> = {
  component: BTabs,
  title: 'UI/Tabs',
}
export default meta

type Story = StoryObj<BTabs>

export const Horizontal: Story = {
  render: () => ({
    components: {
      BTabs,
    },
    template: `
      <b-tabs
        :tabs="[{ slot: '1', title: 'Tab 1' }, { slot: '2', title: 'Tab 2' }, { slot: '3', title: 'Tab 3' }]"
      >
        <div
          v-for="i in 3"
          :key="i"
          :slot="i"
          style="border: dashed gray; height: 100vh;"
        >Content {{ i }}</div>
      </b-tabs>
    `,
  }),
  args: {},
  play: async ({ canvasElement }) => {
    canvasElement = getCanvasElementFixed(canvasElement)
    const canvas = within(canvasElement)

    // FIXME workaround for https://github.com/storybookjs/storybook/issues/15934
    canvasElement.querySelectorAll('a').forEach((a) => a.setAttribute('target', '_self'))

    const tab2Button = await canvas.findByText('Tab 2')
    expect(tab2Button).toHaveAttribute('aria-selected', 'false')
    await userEvent.click(tab2Button)
    await waitFor(() => expect(tab2Button).toHaveAttribute('aria-selected', 'true'))
  },
}
