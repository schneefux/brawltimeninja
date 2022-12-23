import BPageSection from './b-page-section.vue'
import { Meta, StoryObj } from '@storybook/vue3'

const meta: Meta<BPageSection> = {
  component: BPageSection,
  title: 'UI/Section Container',
}
export default meta

type Story = StoryObj<BPageSection>

const lipsum = `Brawl Stars has almost 200 distinct maps. With the daily Map Maker Competition Winner, there is a new map available to play every day. Unarguably, some maps must be better than others. How can we measure that?`

export const Default: Story = {
  render: (args) => ({
    components: { BPageSection },
    setup() {
      return { args }
    },
    template: `
      <div>
        <b-page-section
          v-bind="args"
          v-for="i in 3"
          :key="i"
          :title="'Sample Section ' + i"
        >
          <p slot="description">${lipsum}</p>
          <div style="border: dashed gray;">{{ i }}</div>
        </b-page-section>
      </div>
    `,
  }),
}

export const NoTitle: Story = {
  render: (args) => ({
    components: { BPageSection },
    setup() {
      return { args }
    },
    template: `
      <div>
        <b-page-section
          v-bind="args"
          v-for="i in 3"
          :key="i"
        >
          <div style="border: dashed gray;">{{ i }}</div>
        </b-page-section>
      </div>
    `,
  }),
}
