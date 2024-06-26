import BWebNav, { Link } from './b-web-nav.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<BWebNav> = {
  component: BWebNav,
  title: 'UI/Web Navigation',
}
export default meta

type Story = StoryObj<BWebNav>

export const Default: Story = {
  render: (args) => ({
    components: { BWebNav },
    setup() {
      return { args }
    },
    template: `
      <b-web-nav v-bind="args">
        <template v-slot:logo>
          <i>Logo</i>
        </template>
        <template v-slot:before>
          <i>slot before</i>
        </template>
        <template v-slot:after>
          <i>slot after</i>
        </template>
      </b-web-nav>
    `,
  }),
  args: {
    tag: 'span',
    links: [ {
      name: 'Search',
      target: '/',
    }, {
      name: 'Profile',
      target: '/user',
    }, {
      name: 'Print',
      target: '/print',
    } ] as Link[],
  },
}
