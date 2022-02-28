import BPageSection from './b-page-section.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BPageSection,
  title: 'UI/Section Container',
} as Meta

const lipsum = `Brawl Stars has almost 200 distinct maps. With the daily Map Maker Competition Winner, there is a new map available to play every day. Unarguably, some maps must be better than others. How can we measure that?`

export const Default: Story = (args, { argTypes }) => ({
  components: { BPageSection },
  props: Object.keys(argTypes),
  template: `
    <div>
      <b-page-section
        v-bind="$props"
        v-for="i in 3"
        :key="i"
        :title="'Sample Section ' + i"
      >
        <p slot="description">${lipsum}</p>
        <div style="border: dashed gray;">{{ i }}</div>
      </b-page-section>
    </div>
  `,
})

export const NoTitle: Story = (args, { argTypes }) => ({
  components: { BPageSection },
  props: Object.keys(argTypes),
  template: `
    <div>
      <b-page-section
        v-bind="$props"
        v-for="i in 3"
        :key="i"
      >
        <div style="border: dashed gray;">{{ i }}</div>
      </b-page-section>
    </div>
  `,
})
