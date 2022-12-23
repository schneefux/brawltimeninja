import BAppBottomNav, { Screen } from './b-app-bottom-nav.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { faSearch, faUser, faPrint } from '@fortawesome/free-solid-svg-icons'

const meta: Meta<BAppBottomNav> = {
  component: BAppBottomNav,
  title: 'UI/App Bottom Navigation',
}
export default meta

type Story = StoryObj<BAppBottomNav>

export const Default: Story = {
  render: (args) => ({
    components: { BAppBottomNav },
    setup() {
      return { args }
    },
    template: `
      <b-app-bottom-nav v-bind="args"></b-app-bottom-nav>
    `,
  }),
  args: {
    tag: 'span',
    screens: [{
      id: 'search',
      icon: faSearch,
      name: 'Search',
      target: '/',
      prefix: '/',
    }, {
      id: 'profile',
      icon: faUser,
      name: 'Profile',
      target: '/user',
      prefix: '/user',
    }, {
      id: 'print',
      icon: faPrint,
      name: 'Print',
      target: '/print',
      prefix: '/print',
    }] as Screen[],
    activeRoute: '/',
  },
}
