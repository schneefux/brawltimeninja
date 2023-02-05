import BPage from './b-page.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<BPage> = {
  component: BPage,
  title: 'UI/Page Container',
}
export default meta

type Story = StoryObj<BPage>

const lipsum = `Brawl Stars has almost 200 distinct maps. With the daily Map Maker Competition Winner, there is a new map available to play every day. Unarguably, some maps must be better than others. How can we measure that?`

export const Default: Story = {
  render: (args) => ({
    components: { BPage },
    setup() {
      return { args }
    },
    template: `
      <div style="border: dashed gray;">
        <b-page v-bind="args">
          <p style="border: dashed gray;">
            ${lipsum}
          </p>
        </b-page>
      </div>
    `,
  }),
  args: {
    title: 'Sample Page',
  },
}
