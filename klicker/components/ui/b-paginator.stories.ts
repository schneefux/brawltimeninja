import BPaginator from './b-paginator.vue'
import { Meta, Story } from '@storybook/vue'
import { userEvent, within } from '@storybook/testing-library'
import { expect } from '@storybook/jest'
import { ref } from 'vue-demi'
import { getCanvasElementFixed } from '../../fix'

export default {
  component: BPaginator,
  title: 'UI/Paginator',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BPaginator },
  props: Object.keys(argTypes),
  template: `
    <b-paginator
      v-model="v"
      v-bind="$props"
    ></b-paginator>
  `,
  setup() {
    const v = ref(0)

    return {
      v,
    }
  },
})
Default.args = {
  pages: 3,
}
Default.play = async ({ canvasElement }) => {
  canvasElement = getCanvasElementFixed(canvasElement)
  const canvas = within(canvasElement)

  await canvas.findByText('1 / 3')
  const previous = await canvas.findByLabelText('previous')
  const next = await canvas.findByLabelText('next')
  expect(previous).not.toBeVisible()
  expect(next).toBeVisible()
  await userEvent.click(next)
  await canvas.findByText('2 / 3')
  await userEvent.click(next)
  expect(next).not.toBeVisible()
}
