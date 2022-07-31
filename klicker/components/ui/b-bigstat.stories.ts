import BBigstat from './b-bigstat.vue'
import { Meta, Story } from '@storybook/vue'
import { userEvent, within } from '@storybook/testing-library'
import { expect } from '@storybook/jest'
import { getCanvasElementFixed } from '../../fix'

export default {
  component: BBigstat,
  title: 'UI/Big Statistic',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BBigstat },
  props: Object.keys(argTypes),
  template: `
    <b-bigstat v-bind="$props"></b-bigstat>
  `,
})
Default.args = {
  title: 'Wins',
  value: 1234,
}

const lipsum = `Brawl Stars has almost 200 distinct maps.`

export const WithTooltip: Story = (args, { argTypes }) => ({
  components: { BBigstat },
  props: Object.keys(argTypes),
  template: `
    <b-bigstat v-bind="$props"></b-bigstat>
  `,
})
WithTooltip.args = {
  title: 'Wins',
  value: 1234,
  tooltip: lipsum,
}
WithTooltip.play = async ({ canvasElement }) => {
  canvasElement = getCanvasElementFixed(canvasElement)
  const canvas = within(canvasElement)
  const body = within(document.body)

  const tooltipButton = await canvas.findByRole('button')
  expect(tooltipButton).toBeVisible()
  await userEvent.click(tooltipButton)
  const content = await body.findByText(lipsum)
  expect(content).toBeVisible()
  const closeButton = await body.findByLabelText('close')
  expect(closeButton).toBeVisible()
  await userEvent.click(closeButton)
}

export const WithTooltipLink: Story = (args, { argTypes }) => ({
  components: { BBigstat },
  props: Object.keys(argTypes),
  template: `
    <b-bigstat v-bind="$props"></b-bigstat>
  `,
})
WithTooltipLink.args = {
  title: 'Wins',
  value: 1234,
  tooltip: lipsum,
  tooltipLink: '#',
}

export const WithTooltipSlot: Story = (args, { argTypes }) => ({
  components: { BBigstat },
  props: Object.keys(argTypes),
  template: `
    <b-bigstat v-bind="$props">
      <p
        slot="tooltip"
        style="border: dashed gray;"
      >${lipsum}</p>
    </b-bigstat>
  `,
})
WithTooltipSlot.args = {
  title: 'Wins',
  value: 1234,
}
WithTooltipSlot.play = async ({ canvasElement }) => {
  canvasElement = getCanvasElementFixed(canvasElement)
  const canvas = within(canvasElement)
  const body = within(document.body)

  const tooltipButton = await canvas.findByRole('button')
  expect(tooltipButton).toBeVisible()
  await userEvent.click(tooltipButton)
  const content = await body.findByText(lipsum)
  expect(content).toBeVisible()
  const closeButton = await body.findByLabelText('close')
  expect(closeButton).toBeVisible()
  await userEvent.click(closeButton)
}
