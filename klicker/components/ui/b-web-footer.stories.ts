import BWebFooter, { Link } from './b-web-footer.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<BWebFooter> = {
  component: BWebFooter,
  title: 'UI/Web Footer',
}
export default meta

type Story = StoryObj<BWebFooter>

export const Default: Story = {
  render: (args) => ({
    components: { BWebFooter },
    setup() {
      return { args }
    },
    template: `
      <b-web-footer v-bind="args">
        <template v-slot:below>
          <i>slot below</i>
        </template>
      </b-web-footer>
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
