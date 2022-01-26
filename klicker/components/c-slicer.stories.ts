import CSlicer from './c-slicer.vue'
import BSelect from './ui/b-select.vue'
import Klicker from '../service'
import config from '../fixtures/klicker.conf'
import { Meta, Story } from '@storybook/vue'
import { CubeComparingQuery, CubeQuery, SlicerSpec } from '../types'
import Vue from 'vue'

export default {
  component: CSlicer,
  title: 'Filter Configurator',
} as Meta

const query = <CubeQuery>{
  cubeId: 'map',
  dimensionsIds: ['brawler'],
  measurementsIds: ['winRate'],
  slices: {
    brawler: ['1'],
  },
  sortId: 'winRate',
  limit: 5,
}

const slicers: SlicerSpec[] = [{
  name: 'Brawler',
  component: 'brawler-select',
  import: () => Promise.resolve(BrawlerSelect),
  applicable() {
    return true
  },
}]

const BrawlerSelect = Vue.component('brawler-select', {
  components: { BSelect },
  props: ['value', 'onInput'],
  template: `
    <b-select
      :value="value.brawler"
      dark
      sm
      @input="v => onInput({ brawler: v == '' ? [] : [v] })"
    >
      <option value="">Any Brawler</option>
      <option value="1">Some other Brawler</option>
      <option value="2">And another Brawler</option>
    </b-select>
  `,
});

(<any>window).$klicker = new Klicker('https://cube.brawltime.ninja', config, [], [], slicers);

export const Default: Story = (args, { argTypes }) => ({
  components: { CSlicer },
  props: Object.keys(argTypes),
  template: `
    <c-slicer v-bind="$props"></c-slicer>
  `,
})
Default.args = {
  value: query,
}

const comparingQuery = <CubeComparingQuery>{
  cubeId: 'map',
  name: 'Test Dataset',
  dimensionsIds: ['brawler'],
  measurementsIds: ['winRate'],
  slices: {},
  sortId: 'winRate',
  comparing: true,
  reference: {
    name: 'Reference Dataset',
    cubeId: 'map',
    dimensionsIds: ['brawler'],
    measurementsIds: ['winRate'],
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
Comparing.args = {
  value: comparingQuery,
}
