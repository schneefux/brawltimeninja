import BScrollingDashboard from './b-scrolling-dashboard.vue'
import CDashboardCell from '../c-dashboard-cell.vue'
import { within, userEvent, waitFor } from '@storybook/testing-library'
import { expect } from '@storybook/jest'
import { Meta, Story } from '@storybook/vue'
import { getCanvasElementFixed } from '../../fix'

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

export default {
  component: BScrollingDashboard,
  title: 'UI/Horizontally Scrolling Dashboard',
} as Meta

export const Desktop: Story = (args, { argTypes }) => ({
  components: {
    BScrollingDashboard,
    CDashboardCell,
  },
  props: Object.keys(argTypes),
  template: `
    <div style="width: 400px;">
      <b-scrolling-dashboard v-bind="$props">
        <c-dashboard-cell
          v-for="i in 5"
          :key="i"
          :rows="2"
          :columns="2"
          style="border: dashed gray;"
        >{{ i }}</c-dashboard-cell>
      </b-scrolling-dashboard>
    </div>
  `,
})
Desktop.args = {}
Desktop.play = async ({ canvasElement }) => {
  canvasElement = getCanvasElementFixed(canvasElement)
  const canvas = within(canvasElement)

  const nextButton = await canvas.findByLabelText('next')
  const previousButton = await canvas.findByLabelText('previous')

  await waitFor(() => expect(nextButton).toBeVisible())
  await waitFor(() => expect(previousButton).not.toBeVisible())
  await userEvent.click(nextButton)
  await waitFor(() => expect(previousButton).toBeVisible())
  await userEvent.click(nextButton)
  await waitFor(() => expect(nextButton).not.toBeVisible())

  await userEvent.click(previousButton)
  await waitFor(() => expect(nextButton).toBeVisible())
  await userEvent.click(previousButton)
  await waitFor(() => expect(previousButton).not.toBeVisible())
}

export const Mobile: Story = (args, { argTypes }) => ({
  components: {
    BScrollingDashboard,
    CDashboardCell,
  },
  props: Object.keys(argTypes),
  template: `
    <b-scrolling-dashboard
      v-bind="$props"
      data-testid="container"
    >
      <c-dashboard-cell
        v-for="i in 2"
        :key="i"
        :rows="2"
        :columns="2"
        style="border: dashed gray;"
      >{{ i }}</c-dashboard-cell>
    </b-scrolling-dashboard>
  `,
})
Mobile.parameters = {
  viewport: {
    // 'Mobile' name triggers viewport resize in test-runner.js hook
    defaultViewport: 'mobile2',
  },
}
Mobile.play = async ({ canvasElement }) => {
  canvasElement = getCanvasElementFixed(canvasElement)
  const canvas = within(canvasElement)

  const nextButton = await canvas.findByLabelText('next')
  const previousButton = await canvas.findByLabelText('previous')
  const scrollHintRight = await canvas.findByTestId('scroll-hint-right')
  const scrollHintLeft = await canvas.findByTestId('scroll-hint-left')

  expect(nextButton).not.toBeVisible()
  expect(previousButton).not.toBeVisible()
  await waitFor(() => expect(scrollHintRight).toBeVisible())
  expect(scrollHintLeft).not.toBeVisible()

  await sleep(500)

  await userEvent.click(nextButton)
  await waitFor(() => expect(scrollHintRight).not.toBeVisible())
  expect(scrollHintLeft).toBeVisible()

  await userEvent.click(previousButton)
  await waitFor(() => expect(scrollHintRight).toBeVisible())
  expect(scrollHintLeft).not.toBeVisible()
}
