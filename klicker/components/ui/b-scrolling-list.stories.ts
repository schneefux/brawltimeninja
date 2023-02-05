import BScrollingList from './b-scrolling-list.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import {userEvent, waitFor, within} from "@storybook/testing-library";
import {expect} from "@storybook/jest";
import {getCanvasElementFixed} from '../../fix'

const meta: Meta<BScrollingList> = {
  component: BScrollingList,
  title: 'UI/Horizontally Scrolling List',
}
export default meta

type Story = StoryObj<BScrollingList>

export const Default: Story = {
  render: (args) => ({
    components: {
      BScrollingList,
    },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 400px;">
        <b-scrolling-list v-bind="args">
          <template v-slot:item="item">
            <div style="height: 100%; border: dashed gray;">
              {{ item.text }}
            </div>
          </template>
        </b-scrolling-list>
      </div>
    `,
  }),
  args: {
    items: [{
      id: 1,
      text: '1',
    }, {
      id: 2,
      text: '2',
    }, {
      id: 3,
      text: '3',
    }],
    keyId: 'id',
    cellColumns: 3,
  },
}

export const WithPreview: Story = {
  render: (args) => ({
    components: {
      BScrollingList,
    },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 400px;">
        <b-scrolling-list v-bind="args">
          <template v-slot:preview="item">
            <span style="border: dashed gray;">#{{ item.text }}</span>
          </template>
          <template v-slot:item="item">
            <div style="height: 100%; border: dashed gray;">
              {{ item.text }}
            </div>
          </template>
        </b-scrolling-list>
      </div>
    `,
  }),
  args: {
    items: [{
      id: 1,
      text: '1',
    }, {
      id: 2,
      text: '2',
    }, {
      id: 3,
      text: '3',
    }],
    keyId: 'id',
    cellColumns: 3,
  },
  play: async ({ canvasElement }) => {
    canvasElement = getCanvasElementFixed(canvasElement)
    const canvas = within(canvasElement)

    const goTo1Button = await canvas.findByText('#1')
    const goTo3Button = await canvas.findByText('#3')
    const item1 = await canvas.findByText('1')

    await waitFor(() => expect(item1.getBoundingClientRect().left).toBeLessThan(400))

    await userEvent.click(goTo3Button)
    const item3 = await canvas.findByText('3')
    await waitFor(() => expect(item3.getBoundingClientRect().left).toBeLessThan(400))
    expect(item1.getBoundingClientRect().left).not.toBeGreaterThan(0)

    await userEvent.click(goTo1Button)
    await waitFor(() => expect(item1.getBoundingClientRect().left).toBeLessThan(400))
  },
}

export const Lazy: Story = {
  render: (args) => ({
    components: {
      BScrollingList,
    },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 400px;">
      <b-scrolling-list v-bind="args">
        <template v-slot:preview="item">
          <span style="border: dashed gray;">#{{ item.text }}</span>
        </template>
        <template v-slot:item="item">
          <div style="height: 100%; border: dashed gray;">
            {{ item.text }}
          </div>
        </template>
      </b-scrolling-list>
      </div>
    `,
  }),
  args: {
    items: [{
      id: 1,
      text: '1',
    }, {
      id: 2,
      text: '2',
    }, {
      id: 3,
      text: '3',
    }],
    keyId: 'id',
    cellColumns: 3,
    eagerUntil: 0,
  },
  play: async ({ canvasElement }) => {
    canvasElement = getCanvasElementFixed(canvasElement)
    const canvas = within(canvasElement)

    const goTo3Button = await canvas.findByText('#3')
    expect(canvas.queryByText('3')).toBeNull()

    await userEvent.click(goTo3Button)
    const item3 = await canvas.findByText('3')
    await waitFor(() => expect(item3).toBeVisible())
  },
}
