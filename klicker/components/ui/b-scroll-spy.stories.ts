import BScrollSpy from './b-scroll-spy.vue'
import { Meta, Story } from '@storybook/vue'
import {userEvent, waitFor, within} from "@storybook/testing-library";
import {expect} from "@storybook/jest";

export default {
  component: BScrollSpy,
  title: 'UI/Scroll Spy',
} as Meta

const Template: Story = (args, { argTypes }) => ({
    components: {
      BScrollSpy,
    },
    props: Object.keys(argTypes),
    template: `
    <div>
      <b-scroll-spy
        :sections="[1, 2, 3].map(i => ({ id: i, element: ($refs['section-' + i] || [])[0], title: 'Section ' + i }))"
      ></b-scroll-spy>
      <div
        v-for="i in 3"
        :ref="'section-' + i"
        :key="i"
        :style="'border: dashed gray; height: ' + (i == 2 ? '200vh' : '100vh') + ';'"
      >Content {{ i }}</div>
    </div>
  `,
})

export const Mobile = Template.bind({})
Mobile.parameters = {
  viewport: {
    defaultViewport: 'mobile2',
  },
}
Mobile.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement)

  const toggleButton = await canvas.findByTestId('dropdownToggle')
  const dropdown = within(await canvas.findByTestId('dropdown'))
  const section1Button = await dropdown.findByText('Section 1')
  const section3Button = await dropdown.findByText('Section 3')

  expect(toggleButton).toBeVisible()
  expect(section1Button).not.toBeVisible()
  expect(section3Button).not.toBeVisible()

  await userEvent.click(toggleButton)
  await waitFor(() => expect(toggleButton).not.toBeVisible())
  expect(section1Button).toBeVisible()
  expect(section3Button).toBeVisible()

  await userEvent.click(section3Button)
  await waitFor(() => expect(toggleButton).toBeVisible())
  expect(section1Button).not.toBeVisible()
  expect(section3Button).not.toBeVisible()
}

export const Desktop = Template.bind({})
Desktop.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement)

  const toggleButton = await canvas.findByTestId('dropdownToggle')
  expect(toggleButton).not.toBeVisible()

  const dropdown = within(await canvas.findByTestId('dropdown'))
  const section1Button = await dropdown.findByText('Section 1')
  expect(section1Button).toBeVisible()
  await userEvent.click(section1Button)
}
