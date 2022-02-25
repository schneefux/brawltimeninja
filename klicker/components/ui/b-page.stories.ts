import BPage from './b-page.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BPage,
  title: 'Page Container',
} as Meta

const lipsum = `Brawl Stars has almost 200 distinct maps. With the daily Map Maker Competition Winner, there is a new map available to play every day. Unarguably, some maps must be better than others. How can we measure that?`

export const Default: Story = (args, { argTypes }) => ({
  components: { BPage },
  props: Object.keys(argTypes),
  template: `
    <div style="border: dashed gray;">
      <b-page v-bind="$props">
        <p style="border: dashed gray;">
          ${lipsum}
        </p>
      </b-page>
    </div>
  `,
})
Default.args = {
  title: 'Sample Page',
}
