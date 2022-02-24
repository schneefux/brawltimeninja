import BScrollingDashboard from './b-scrolling-dashboard.vue'
import CDashboardCell from '../c-dashboard-cell.vue'
import { within, userEvent } from '@storybook/testing-library'
import { Meta, Story } from '@storybook/vue'

const sleep = (timeout: number) => new Promise((res) => setTimeout(res, timeout))

export default {
  component: BScrollingDashboard,
  title: 'Horizontally Scrolling Dashboard',
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
  const canvas = within(canvasElement)

  const nextButton = await canvas.findByLabelText('next')
  await userEvent.click(nextButton)
  await sleep(500)
  await userEvent.click(nextButton)

  await sleep(500)

  const previousButton = await canvas.findByLabelText('previous')
  await userEvent.click(previousButton)
  await sleep(500)
  await userEvent.click(previousButton)
}

export const Mobile: Story = (args, { argTypes }) => ({
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
Mobile.args = {
  viewport: {
    defaultViewport: 'mobile2',
  },
}
