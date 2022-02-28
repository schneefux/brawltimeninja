import BTabs from './b-tabs.vue'
import { within, userEvent, waitFor } from '@storybook/testing-library'
import { expect } from '@storybook/jest'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BTabs,
  title: 'UI/Tabs',
} as Meta

export const Horizontal: Story = (args, { argTypes }) => ({
  components: {
    BTabs,
  },
  props: Object.keys(argTypes),
  template: `
    <b-tabs
      :tabs="[{ slot: '1', title: 'Tab 1' }, { slot: '2', title: 'Tab 2' }, { slot: '3', title: 'Tab 3' }]"
    >
      <div
        v-for="i in 5"
        :key="i"
        :slot="i"
        style="border: dashed gray; height: 100vh;"
      >Content {{ i }}</div>
    </b-tabs>
  `,
})
Horizontal.args = {}
Horizontal.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement)

  const tab2Button = await canvas.findByText('Tab 2')
  expect(tab2Button).toHaveAttribute('aria-selected', 'false')
  await userEvent.click(tab2Button)
  await waitFor(() => expect(tab2Button).toHaveAttribute('aria-selected', 'true'))
}

export const Vertical: Story = (args, { argTypes }) => ({
  components: {
    BTabs,
  },
  props: Object.keys(argTypes),
  template: `
    <b-tabs
      :tabs="[{ slot: '1', title: 'Tab 1' }, { slot: '2', title: 'Tab 2' }, { slot: '3', title: 'Tab 3' }]"
      vertical
    >
      <div
        v-for="i in 5"
        :key="i"
        :slot="i"
        style="border: dashed gray; height: 100vh;"
      >Content {{ i }}</div>
    </b-tabs>
  `,
})
Vertical.args = {}
Vertical.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement)

  const tab2Button = await canvas.findByText('Tab 2')
  expect(tab2Button).toHaveAttribute('aria-selected', 'false')
  await userEvent.click(tab2Button)
  await waitFor(() => expect(tab2Button).toHaveAttribute('aria-selected', 'true'))
}
