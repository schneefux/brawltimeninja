import BPaginator from './b-paginator.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BPaginator,
  title: 'Paginator',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BPaginator },
  props: Object.keys(argTypes),
  template: `
    <b-paginator v-bind="$props"></b-paginator>
  `,
})
Default.args = {
  value: 1,
  pages: 5,
}
