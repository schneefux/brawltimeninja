import BScrollSpy from './b-scroll-spy.vue'
import { Meta, Story } from '@storybook/vue'
import {userEvent, waitFor, within} from "@storybook/testing-library";
import {expect} from "@storybook/jest";
import { getCanvasElementFixed } from '../../fix';
import { ref, computed } from 'vue-demi'

export default {
  component: BScrollSpy,
  title: 'UI/Scroll Spy',
} as Meta

const Template: Story = () => ({
  components: {
    BScrollSpy,
  },
  template: `
  <div>
    <b-scroll-spy
      :sections="sections"
    ></b-scroll-spy>
    <div
      ref="section1"
      style="border: dashed gray; height: 100vh;"
    >Content 1</div>
    <div
      ref="section2"
      style="border: dashed gray; height: 200vh;"
    >Content 2</div>
    <div
      ref="section3"
      style="border: dashed gray; height: 100vh;"
    >Content 3</div>
  </div>
  `,
  setup() {
    const section1 = ref()
    const section2 = ref()
    const section3 = ref()

    const sections = computed(() => [{
      id: '1',
      element: section1.value,
      title: 'Section 1',
    }, {
      id: '2',
      element: section2.value,
      title: 'Section 2',
    }, {
      id: '3',
      element: section3.value,
      title: 'Section 3',
    }])

    return {
      section1,
      section2,
      section3,
      sections,
    }
  },
})

export const Mobile = Template.bind({})
Mobile.parameters = {
  viewport: {
    // 'Mobile' name triggers viewport resize in test-runner.js hook
    defaultViewport: 'mobile2',
  },
}
Mobile.play = async ({ canvasElement }) => {
  canvasElement = getCanvasElementFixed(canvasElement)
  const canvas = within(canvasElement)

  const section2 = await canvas.findByText('Content 2')
  section2.scrollIntoView() // trigger dropdown

  const toggleButton = await canvas.findByTestId('dropdownToggle')
  const dropdown = within(await canvas.findByTestId('dropdown'))
  const section1Button = await dropdown.findByText('Section 1')
  const section3Button = await dropdown.findByText('Section 3')

  await waitFor(() => expect(toggleButton).toBeVisible())
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
  canvasElement = getCanvasElementFixed(canvasElement)
  const canvas = within(canvasElement)

  const toggleButton = await canvas.findByTestId('dropdownToggle')
  expect(toggleButton).not.toBeVisible()

  const dropdown = within(await canvas.findByTestId('dropdown'))
  const section1Button = await dropdown.findByText('Section 1')
  await userEvent.click(section1Button)
}
