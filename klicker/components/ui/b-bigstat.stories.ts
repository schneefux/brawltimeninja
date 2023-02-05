import BBigstat from './b-bigstat.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { userEvent, within } from '@storybook/testing-library'
import { expect } from '@storybook/jest'
import { getCanvasElementFixed } from '../../fix'

const meta: Meta<BBigstat> = {
  component: BBigstat,
  title: 'UI/Big Statistic',
}
export default meta

type Story = StoryObj<BBigstat>

export const Default: Story = {
  render: (args) => ({
    components: { BBigstat },
    setup() {
      return { args }
    },
    template: `
      <b-bigstat v-bind="args"></b-bigstat>
    `,
  }),
  args: {
    title: 'Wins',
    value: 1234,
  },
}

const lipsum = `Brawl Stars has almost 200 distinct maps.`

export const WithTooltip: Story = {
  render: (args) => ({
    components: { BBigstat },
    setup() {
      return { args }
    },
    template: `
      <b-bigstat v-bind="args"></b-bigstat>
    `,
  }),
  args: {
    title: 'Wins',
    value: 1234,
    tooltip: lipsum,
  },
  play: async ({ canvasElement }) => {
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
  },
}

export const WithTooltipLink: Story = {
  render: (args) => ({
    components: { BBigstat },
    setup() {
      return { args }
    },
    template: `
      <b-bigstat v-bind="args"></b-bigstat>
    `,
  }),
  args: {
    title: 'Wins',
    value: 1234,
    tooltip: lipsum,
    tooltipLink: '#',
  },
}

export const WithTooltipSlot: Story = {
  render: (args) => ({
    components: { BBigstat },
    setup() {
      return { args }
    },
    template: `
      <b-bigstat v-bind="args">
        <template v-slot:tooltip>
          <p style="border: dashed gray;">${lipsum}</p>
        </template>
      </b-bigstat>
    `,
  }),
  args: {
    title: 'Wins',
    value: 1234,
  },
  play: async ({ canvasElement }) => {
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
  },
}
