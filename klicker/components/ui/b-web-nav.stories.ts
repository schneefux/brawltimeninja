import BWebNav, { Link } from './b-web-nav.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BWebNav,
  title: 'UI/Web Navigation',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BWebNav },
  props: Object.keys(argTypes),
  template: `
    <b-web-nav v-bind="$props">
      <i slot="logo">Logo</i>
      <i slot="before">slot before</i>
      <i slot="after">slot after</i>
    </b-web-nav>
  `,
})
Default.args = {
  tag: 'span',
  links: <Link[]> [ {
    name: 'Search',
    target: '/',
  }, {
    name: 'Profile',
    target: '/user',
  }, {
    name: 'Print',
    target: '/print',
  } ],
}
