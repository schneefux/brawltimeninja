import BScrollingDashboard from './b-scrolling-dashboard.vue'
import BDashboardCell from './b-dashboard-cell.vue'
import { within, userEvent, waitFor } from '@storybook/testing-library'
import { expect } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/vue3'
import { getCanvasElementFixed } from '../../fix'

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

const meta: Meta<BDashboardCell> = {
  component: BScrollingDashboard,
  title: 'UI/Horizontally Scrolling Dashboard',
}
export default meta

type Story = StoryObj<BDashboardCell>

export const Desktop: Story = {
  render: (args) => ({
    components: {
      BScrollingDashboard,
      BDashboardCell,
    },
    setup() {
      return { args }
    },
    template: `
      <div style="width: 400px;">
        <b-scrolling-dashboard v-bind="args">
          <b-dashboard-cell
            v-for="i in 5"
            :key="i"
            :rows="2"
            :columns="2"
            style="border: dashed gray;"
          >{{ i }}</b-dashboard-cell>
        </b-scrolling-dashboard>
      </div>
    `,
  }),
  args: {},
  play: async ({ canvasElement }) => {
    canvasElement = getCanvasElementFixed(canvasElement)
    const canvas = within(canvasElement)

    const nextButton = await canvas.findByLabelText('next')
    const previousButton = await canvas.findByLabelText('previous')

    await waitFor(() => expect(nextButton).toBeVisible())
    await waitFor(() => expect(previousButton).not.toBeVisible())
    await userEvent.click(nextButton)
    await waitFor(() => expect(previousButton).toBeVisible())

    await sleep(500)
    await userEvent.click(nextButton)
    await sleep(500)
    await userEvent.click(nextButton)

    await waitFor(() => expect(nextButton).not.toBeVisible())
    await userEvent.click(previousButton)
    await waitFor(() => expect(nextButton).toBeVisible())

    await sleep(500)
    await userEvent.click(previousButton)
    await sleep(500)
    await userEvent.click(previousButton)

    await waitFor(() => expect(previousButton).not.toBeVisible())
  },
}

export const Mobile: Story = {
  render: (args) => ({
    components: {
      BScrollingDashboard,
      BDashboardCell,
    },
    setup() {
      return { args }
    },
    template: `
      <b-scrolling-dashboard
        v-bind="args"
        data-testid="container"
      >
        <b-dashboard-cell
          v-for="i in 2"
          :key="i"
          :rows="2"
          :columns="2"
          style="border: dashed gray;"
        >{{ i }}</b-dashboard-cell>
      </b-scrolling-dashboard>
    `,
  }),
  parameters: {
    viewport: {
      // 'Mobile' name triggers viewport resize in test-runner.js hook
      defaultViewport: 'mobile2',
    },
  },
  play: async ({ canvasElement }) => {
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

    await sleep(500)
    expect(scrollHintLeft).not.toBeVisible()
  },
}
