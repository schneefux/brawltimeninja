import BFakeSelect from './b-fake-select.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BFakeSelect,
  title: 'Custom Select',
} as Meta

export const Dark: Story = (args, { argTypes }) => ({
  components: { BFakeSelect },
  props: Object.keys(argTypes),
  template: `
    <b-fake-select v-bind="$props">
      <span slot="preview">Preview</span>
      <div style="width: 200px">
        <p>Inner content can be anything</p>
        <div style="display: flex;">
          <img width="50" src="https://media.brawltime.ninja/brawlers/shelly/avatar.png?size=160">
          <img width="50" src="https://media.brawltime.ninja/brawlers/colt/avatar.png?size=160">
          <img width="50" src="https://media.brawltime.ninja/brawlers/dynamike/avatar.png?size=160">
        </div>
      </div>
    </b-fake-select>
  `,
})
Dark.args = {
  dark: true,
}
