import CSlicer from './c-slicer.vue'
import BSelect from './ui/b-select.vue'
import { Meta, StoryObj } from '@storybook/vue3'
import { CubeComparingQuery, CubeQuery, SlicerSpec } from '../types'
import { MockedKlicker } from '../fixtures/klicker.shim'

const meta: Meta<CSlicer> = {
  component: CSlicer,
  title: 'Editor/Filter Configurator',
}
export default meta

type Story = StoryObj<CSlicer>

const query: CubeQuery = {
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {
    brawler: ['1'],
  },
  sortId: 'winRate',
  limit: 5,
}

const slicer: SlicerSpec = {
  name: 'Brawler',
  component: 'brawler-select',
  import: () => Promise.resolve(BrawlerSelect),
  applicable() {
    return true
  },
}

const BrawlerSelect = {
  components: { BSelect },
  props: ['value', 'onInput'],
  template: `
    <b-select
      :value="value.brawler"
      sm
      @input="v => onInput({ brawler: v == '' ? [] : [v] })"
    >
      <option value="">Any Brawler</option>
      <option value="1">Some other Brawler</option>
      <option value="2">And another Brawler</option>
    </b-select>
  `,
}

export const Default: Story = {
  render: (args) => ({
    components: { CSlicer },
    setup() {
      return { args }
    },
    template: `
      <c-slicer v-bind="args"></c-slicer>
    `,
  }),
  parameters: {
    $klicker: Object.assign(new MockedKlicker(), {
      slicers: [slicer],
    }),
  },
  args: {
    modelValue: query,
  },
}

const comparingQuery: CubeComparingQuery = {
  cubeId: 'map',
  name: 'Test Dataset',
  dimensionsIds: ['brawler'],
  metricsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  comparing: true,
  reference: {
    name: 'Reference Dataset',
    cubeId: 'map',
    dimensionsIds: ['brawler'],
    metricsIds: ['winRate'],
    slices: {
      mode: ['gemGrab'],
    },
    sortId: 'winRate',
  },
}

export const Comparing: Story = {
  render: (args) => ({
    components: { CSlicer },
    setup() {
      return { args }
    },
    template: `
      <div>
        <c-slicer v-bind="args"></c-slicer>
        <c-slicer v-bind="args" comparing></c-slicer>
      </div>
    `,
  }),
  parameters: {
    $klicker: Object.assign(new MockedKlicker(), {
      slicers: [slicer],
    }),
  },
  args: {
    modelValue: comparingQuery,
  },
}
