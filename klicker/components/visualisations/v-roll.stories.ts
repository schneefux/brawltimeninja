import CQuery from '../c-query'
import VRoll from './v-roll.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeQuery } from '../../types'

export default {
  component: VRoll,
  title: 'Roll',
} as Meta

const query = JSON.stringify(<CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  measurementsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  limit: 5,
})

const Template: Story = (args, { argTypes }) => ({
  components: { CQuery, VRoll },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-roll v-bind="{ ...data, ...$props }"></v-roll>
    </template>
  </c-query>
  `,
})

export const Default: Story = Template.bind({})

export const Long: Story = Template.bind({})
Long.args = {
  long: true,
}

const ImageTemplate: Story = (args, { argTypes }) => ({
  components: { CQuery, VRoll },
  props: Object.keys(argTypes),
  template: `
  <c-query :query='${query}'>
    <template v-slot="data">
      <v-roll v-bind="{ ...data, ...$props }">
        <template v-slot:dimensions="row">
          <img width="50" :src="'https://media.brawltime.ninja/brawlers/' + row.row.dimensions.brawler.toLowerCase() + '/avatar.png?size=160'">
        </template>
      </v-roll>
    </template>
  </c-query>
  `,
})

export const Image: Story = ImageTemplate.bind({})

export const ImageLong: Story = ImageTemplate.bind({})
ImageLong.args = {
  long: true,
}
