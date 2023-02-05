import BAppHeadNav from './b-app-head-nav.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<BAppHeadNav> = {
  component: BAppHeadNav,
  title: 'UI/App Head Navigation',
}
export default meta

type Story = StoryObj<BAppHeadNav>

export const Default: Story = {
  render: (args) => ({
    components: { BAppHeadNav },
    setup() {
      return { args }
    },
    template: `
      <b-app-head-nav v-bind="args">Header content goes here</b-app-head-nav>
    `,
  }),
  args: {},
}
