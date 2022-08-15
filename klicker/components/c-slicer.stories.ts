import CSlicer from './c-slicer.vue'
import BSelect from './ui/b-select.vue'
import { Meta, Story } from '@storybook/vue'
import { CubeComparingQuery, CubeQuery, SlicerSpec } from '../types'
import MockedKlicker from '../fixtures/klicker.shim'
import Vue from 'vue'

export default {
  component: CSlicer,
  title: 'Editor/Filter Configurator',
} as Meta

const query = <CubeQuery>{
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

const BrawlerSelect = Vue.component('brawler-select', {
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
});

export const Default: Story = (args, { argTypes }) => ({
  components: { CSlicer },
  props: Object.keys(argTypes),
  template: `
    <c-slicer v-bind="$props"></c-slicer>
  `,
})
Default.parameters = {
  $klicker: Object.assign(new MockedKlicker(), {
    slicers: [slicer],
  }),
}
Default.args = {
  value: query,
}

const comparingQuery = <CubeComparingQuery>{
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

export const Comparing: Story = (args, { argTypes }) => ({
  components: { CSlicer },
  props: Object.keys(argTypes),
  template: `
    <div>
      <c-slicer v-bind="$props"></c-slicer>
      <c-slicer v-bind="$props" comparing></c-slicer>
    </div>
  `,
})
Comparing.parameters = {
  $klicker: Object.assign(new MockedKlicker(), {
    slicers: [slicer],
  }),
}
Comparing.args = {
  value: comparingQuery,
}
