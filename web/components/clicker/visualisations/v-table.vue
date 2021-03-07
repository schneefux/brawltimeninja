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
      v-if="showLink"
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
import { Dimension, Measurement, State } from '~/lib/cube'
import { MetaGridEntry } from '@/lib/util'
import { Column } from '@/components/ui/b-table.vue'
import { Location } from 'vue-router'

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
    state: {
      type: Object as PropType<State>,
      required: true
    },
    pageSize: {
      type: Number,
      default: 10
    },
    showLink: {
      type: Boolean
    },
  },
  computed: {
    columns(): Column[] {
      return this.dimensions.map((d, index) => (<Column>{
        title: this.$t('metric.' + d.id) as string,
        key: `dimensions.${d.id}`,
        ...(index == 0 ? {
          // dimensions are rendered n:m
          slot: 'dimensions',
          colspan: this.dimensions.length,
        } : {
          skip: true,
        }),
      })).concat(
        this.measurements.map(m => (<Column>{
          // measurements are rendered 1:1
          title: this.$t('metric.' + m.id) as string,
          key: `measurements.${m.id}`,
          slot: `measurements.${m.id}`,
        })),
      )
    },
    link(): Location {
      return this.$clicker.stateToLocation(this.state)
    },
  },
})
</script>
