import BScrollingList from './b-scrolling-list.vue'
import { Meta, Story } from '@storybook/vue'
import {userEvent, waitFor, within} from "@storybook/testing-library";
import {expect} from "@storybook/jest";

export default {
  component: BScrollingList,
  title: 'UI/Horizontally Scrolling List',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: {
    BScrollingList,
  },
  props: Object.keys(argTypes),
  template: `
    <div style="width: 400px;">
      <b-scrolling-list v-bind="$props">
        <template v-slot:item="item">
          <div style="height: 100%; border: dashed gray;">
            {{ item.text }}
          </div>
        </template>
      </b-scrolling-list>
    </div>
  `,
})
Default.args = {
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
}

export const WithPreview: Story = (args, { argTypes }) => ({
  components: {
    BScrollingList,
  },
  props: Object.keys(argTypes),
  template: `
    <div style="width: 400px;">
      <b-scrolling-list v-bind="$props">
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
})
WithPreview.args = {
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
}
WithPreview.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement)

  const goTo1Button = await canvas.findByText('#1')
  const goTo3Button = await canvas.findByText('#3')
  const item1 = await canvas.findByText('1')
  const item3 = await canvas.findByText('3')

  await waitFor(() => expect(item1.getBoundingClientRect().left).toBeLessThan(400))
  expect(item3.getBoundingClientRect().left).toBeGreaterThan(400)

  await userEvent.click(goTo3Button)
  await waitFor(() => expect(item3.getBoundingClientRect().left).toBeLessThan(400))
  expect(item1.getBoundingClientRect().left).toBeLessThan(0)

  await userEvent.click(goTo1Button)
  await waitFor(() => expect(item1.getBoundingClientRect().left).toBeLessThan(400))
}

export const Lazy: Story = (args, { argTypes }) => ({
  components: {
    BScrollingList,
  },
  props: Object.keys(argTypes),
  template: `
    <div style="width: 400px;">
    <b-scrolling-list v-bind="$props">
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
})
Lazy.args = {
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
}
Lazy.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement)

  const goTo3Button = await canvas.findByText('#3')
  expect(canvas.queryByText('3')).toBeNull()

  await userEvent.click(goTo3Button)
  const item3 = await canvas.findByText('3')
  await waitFor(() => expect(item3).toBeVisible())
}
