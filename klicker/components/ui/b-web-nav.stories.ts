import BWebNav, { Link } from './b-web-nav.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { faSearch, faUser, faPrint } from '@fortawesome/free-solid-svg-icons'

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
        <template v-slot:after>
          <i>slot after</i>
        </template>
        <template v-slot:end>
          <i>slot end</i>
        </template>
      </b-web-nav>
    `,
  }),
  args: {
    tag: 'span',
    screens: [ {
      name: 'Search',
      target: '/',
      icon: faSearch,
    }, {
      name: 'Profile',
      target: '/user',
      icon: faUser,
    }, {
      name: 'Print',
      target: '/print',
      icon: faPrint,
    } ] as Link[],
  },
}
