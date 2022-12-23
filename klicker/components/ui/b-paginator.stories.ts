import BPaginator from './b-paginator.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { userEvent, within } from '@storybook/testing-library'
import { expect } from '@storybook/jest'
import { ref } from 'vue'
import { getCanvasElementFixed } from '../../fix'

const meta: Meta<BPaginator> = {
  component: BPaginator,
  title: 'UI/Paginator',
}
export default meta

type Story = StoryObj<BPaginator>

export const Default: Story = {
  render: (args) => ({
    components: { BPaginator },
    template: `
      <b-paginator
        v-bind="args"
        v-model="v"
      ></b-paginator>
    `,
    setup() {
      const v = ref(0)

      return {
        ...args,
        v,
      }
    },
  }),
  args: {
    pages: 3,
  },
  play: async ({ canvasElement }) => {
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
  },
}
