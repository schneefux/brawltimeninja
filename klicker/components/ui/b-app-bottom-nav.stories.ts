import BAppBottomNav, { Screen } from './b-app-bottom-nav.vue'
import { Meta, Story } from '@storybook/vue'
import { faSearch, faUser, faPrint } from '@fortawesome/free-solid-svg-icons'

export default {
  component: BAppBottomNav,
  title: 'UI/App Bottom Navigation',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BAppBottomNav },
  props: Object.keys(argTypes),
  template: `
    <b-app-bottom-nav v-bind="$props"></b-app-bottom-nav>
  `,
})
Default.args = {
  tag: 'span',
  screens: <Screen[]>[{
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
  }],
  activeRoute: '/',
}
