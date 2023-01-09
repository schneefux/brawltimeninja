import BRangeSlider from './b-range-slider.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'

const meta: Meta<BRangeSlider> = {
  component: BRangeSlider,
  title: 'UI/Range Slider',
}
export default meta

type Story = StoryObj<BRangeSlider>

export const Default: Story = {
  render: (args) => ({
    components: { BRangeSlider },
    setup() {
      const value = ref([30, 70])
      return { value, args }
    },
    template: `
      <div style="margin-top: 1rem; height: 2rem; width: 24rem;">
        <b-range-slider
          v-bind="args"
          v-model="value"
        ></b-range-slider>
      </div>
    `,
  }),
  args: {
    min: 1,
    max: 100,
    step: 1,
    minRange: 1,
    lazy: true,
  },
}

export const TooltipSlot: Story = {
  render: (args) => ({
    components: { BRangeSlider },
    setup() {
      const value = ref([30, 70])
      return { value, args }
    },
    template: `
      <div style="margin-top: 1rem; height: 2rem; width: 24rem;">
        <b-range-slider
          v-bind="args"
          v-model="value"
        >
          <template v-slot:tooltip="{ value }">
            <i>{{ value }}</i>
          </template>
        </b-range-slider>
      </div>
    `,
  }),
  args: {
    min: 1,
    max: 100,
    step: 1,
    minRange: 1,
    lazy: true,
  },
}
