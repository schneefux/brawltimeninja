import BNavigator, { Link } from './b-navigator.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { userEvent, within } from '@storybook/testing-library'
import { expect } from '@storybook/jest'
import { getCanvasElementFixed } from '../../fix'

const meta: Meta<BNavigator> = {
  component: BNavigator,
  title: 'UI/Navigator',
}
export default meta

type Story = StoryObj<BNavigator>

const demoLinks: Link[] = [{
  id: 'starpowers',
  name: 'Star Powers',
  target: '/tier-list/starpowers',
  children: [{
    id: 'starpower1',
    name: 'Sunny Shadows',
    target: '/tier-list/starpowers/sun',
  }, {
    id: 'starpower2',
    name: 'Shadowy Suns',
    target: '/tier-list/starpowers/shadow',
  }],
}, {
  id: 'gadgets',
  name: 'Gadgets',
  target: '/tier-list/gadgets',
}, {
  id: 'gears',
  name: 'Gears',
  target: '/tier-list/gears',
}]

export const Default: Story = {
  render: (args) => ({
    components: { BNavigator },
    setup() {
      return { args }
    },
    template: `
      <b-navigator
        v-bind="args"
      ></b-navigator>
    `,
  }),
  args: {
    links: demoLinks,
  },
  play: async ({ canvasElement }) => {
    canvasElement = getCanvasElementFixed(canvasElement)
    const canvas = within(canvasElement)

    expect(await canvas.findByText('Star Powers')).toBeVisible()
    expect(await canvas.findByText('Gadgets')).toBeVisible()
    expect(await canvas.findByText('Gears')).toBeVisible()

    const starpowerGroup = await canvas.findByRole('group', { hidden: true })
    const starpowerToggle = await canvasElement.querySelector('[aria-controls="' + starpowerGroup.id + '"]')

    await userEvent.click(starpowerToggle)
    expect(await canvas.findByText('Sunny Shadows')).toBeVisible()
    expect(await canvas.findByText('Shadowy Suns')).toBeVisible()

    await userEvent.click(starpowerToggle)
  },
}

export const Search: Story = {
  render: (args) => ({
    components: { BNavigator },
    setup() {
      return { args }
    },
    template: `
      <b-navigator
        v-bind="args"
      ></b-navigator>
    `,
  }),
  args: {
    links: demoLinks,
    search: 'sunny',
  },
  play: async ({ canvasElement }) => {
    canvasElement = getCanvasElementFixed(canvasElement)
    const canvas = within(canvasElement)

    await canvas.findByText('Star Powers / Sunny Shadows')
  },
}

export const SearchDynamic: Story = {
  render: (args) => ({
    components: { BNavigator },
    setup() {
      return { args }
    },
    template: `
      <b-navigator
        v-bind="args"
      ></b-navigator>
    `,
  }),
  args: {
    links: [],
    linkGenerator: (input: string): Link[] => {
      return [{
        id: input,
        name: 'Profile #' + input.toUpperCase(),
        target: '/profile/' + input,
      }]
    },
    search: 'v8llppc',
  },
  play: async ({ canvasElement }) => {
    canvasElement = getCanvasElementFixed(canvasElement)
    const canvas = within(canvasElement)

    await canvas.findByText('Profile #V8LLPPC')
  },
}
