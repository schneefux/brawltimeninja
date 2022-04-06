import BNavigator, { Link } from './b-navigator.vue'
import { Meta, Story } from '@storybook/vue'
import { userEvent, within } from '@storybook/testing-library'
import { expect } from '@storybook/jest'
import { getCanvasElementFixed } from '../../fix'

export default {
  component: BNavigator,
  title: 'UI/Navigator',
} as Meta

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

export const Default: Story = (args, { argTypes }) => ({
  components: { BNavigator },
  props: Object.keys(argTypes),
  template: `
    <b-navigator
      v-bind="$props"
    ></b-navigator>
  `,
})
Default.args = {
  links: demoLinks,
}
Default.play = async ({ canvasElement }) => {
  canvasElement = getCanvasElementFixed(canvasElement)
  const canvas = within(canvasElement)

  expect(await canvas.findByText('Star Powers')).toBeVisible()
  expect(await canvas.findByText('Gadgets')).toBeVisible()
  expect(await canvas.findByText('Gears')).toBeVisible()
  expect(await canvas.findByText('Sunny Shadows')).not.toBeVisible()
  expect(await canvas.findByText('Shadowy Suns')).not.toBeVisible()

  const starpowerGroup = await canvas.findByRole('group', { hidden: true })
  const starpowerToggle = await canvasElement.querySelector('[aria-controls="' + starpowerGroup.id + '"]')

  await userEvent.click(starpowerToggle)
  expect(await canvas.findByText('Sunny Shadows')).toBeVisible()
  expect(await canvas.findByText('Shadowy Suns')).toBeVisible()

  await userEvent.click(starpowerToggle)
  expect(await canvas.findByText('Sunny Shadows')).not.toBeVisible()
  expect(await canvas.findByText('Shadowy Suns')).not.toBeVisible()
}

export const Search: Story = (args, { argTypes }) => ({
  components: { BNavigator },
  props: Object.keys(argTypes),
  template: `
    <b-navigator
      v-bind="$props"
    ></b-navigator>
  `,
})
Search.args = {
  links: demoLinks,
  search: 'sunny',
}
Search.play = async ({ canvasElement }) => {
  canvasElement = getCanvasElementFixed(canvasElement)
  const canvas = within(canvasElement)

  await canvas.findByText('Star Powers / Sunny Shadows')
}

export const SearchDynamic: Story = (args, { argTypes }) => ({
  components: { BNavigator },
  props: Object.keys(argTypes),
  template: `
    <b-navigator
      v-bind="$props"
    ></b-navigator>
  `,
})
SearchDynamic.args = {
  links: [],
  linkGenerator: (input: string): Link[] => {
    return [{
      id: input,
      name: 'Profile #' + input.toUpperCase(),
      target: '/profile/' + input,
    }]
  },
  search: 'v8llppc',
}
SearchDynamic.play = async ({ canvasElement }) => {
  canvasElement = getCanvasElementFixed(canvasElement)
  const canvas = within(canvasElement)

  await canvas.findByText('Profile #V8LLPPC')
}

