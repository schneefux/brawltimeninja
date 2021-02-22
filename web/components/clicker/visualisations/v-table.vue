<template>
  <card
    v-if="measurements.length < 5"
    v-bind="$attrs"
  >
    <b-table
      slot="content"
      :columns="columns"
      :rows="data"
      :page-size="pageSize"
      id-key="id"
      class="font-semibold text-sm md:text-lg h-full overflow-auto"
      ranked
    >
      <template
        v-for="(_, name) in $scopedSlots"
        v-slot:[name]="data"
      >
        <slot
          :name="name"
          v-bind="data"
          captioned
        ></slot>
      </template>
    </b-table>

    <b-button
      slot="actions"
      :to="link"
      secondary
      sm
    >
      Explore in Dashboard
    </b-button>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Dimension, Measurement } from '~/lib/cube'
import { MetaGridEntry } from '@/lib/util'
import { Column } from '@/components/b-table.vue'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    data: {
      type: Array as PropType<MetaGridEntry[]>
    },
    dimensions: {
      type: Array as PropType<Dimension[]>,
      required: true
    },
    measurements: {
      type: Array as PropType<Measurement[]>,
      required: true
    },
    pageSize: {
      type: Number,
      default: 10
    },
    link: {
      type: [String, Object]
    },
  },
  computed: {
    columns(): Column[] {
      // TODO put each dimension into its own column
      return (<Column[]>[{
        title: this.dimensions.map(d => d.name).join(', '),
        key: 'dimensions',
      }]).concat(
        this.measurements.map(m => ({
          title: m.name,
          key: `measurements.${m.id}`,
        })),
      )
    },
  },
})
</script>
