import BLightbox from './b-lightbox.vue'
import BButton from './b-button.vue'
import { Meta, Story } from '@storybook/vue'

export default {
  component: BLightbox,
  title: 'Lightbox',
} as Meta

export const Default: Story = (args, { argTypes }) => ({
  components: { BLightbox, BButton },
  props: Object.keys(argTypes),
  template: `
    <div>
      <b-button primary md @click="triggered = true">Open Lightbox</b-button>
      <b-lightbox v-model="triggered">
        Content goes here
      </b-lightbox>
    </div>
  `,
  data() {
    return {
      triggered: false,
    }
  },
})
