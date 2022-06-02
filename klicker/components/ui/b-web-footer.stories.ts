import BWebFooter, { Link } from './b-web-footer.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BWebFooter,
  title: 'UI/Web Footer',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BWebFooter },
  props: Object.keys(argTypes),
  template: `
    <b-web-footer v-bind="$props">
      <i slot="below">slot below</i>
    </b-web-footer>
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
