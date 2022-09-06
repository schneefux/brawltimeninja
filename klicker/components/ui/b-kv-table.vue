<template>
  <dl
    v-if="table.length > 0"
    class="flex flex-col gap-y-1"
  >
    <div
      v-for="row in table"
      :key="row.key"
      class="flex justify-between gap-x-2"
    >
      <dt class="basis-[min-content] flex-grow text-text/75">
        {{ row.title }}
      </dt>
      <dd class="basis-[auto] text-text text-right">
        <slot
          :name="row.slot"
          :row="data"
          :value="row.value"
        >
          {{ row.value }}
        </slot>
      </dd>
    </div>
  </dl>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'

export interface Row {
  /**
   * Row title
   */
  title: string
  /**
   * Dot-path to the property that is rendered in the cell by default
   */
  key: string
  /**
   * Name of the slot that should render this cell
   *
   * The slot receives a "row" prop with the full data object.
   */
  slot?: string
}

/**
 * A table with rows on the Y axis and only a single column
 *
 * Data is represented as a key-value dictionary.
 */
export default defineComponent({
  props: {
    rows: {
      type: Array as PropType<Row[]>,
      required: true
    },
    idKey: {
      type: String,
      required: false
    },
    data: {
      type: Object as PropType<object>,
      required: true
    },
  },
  setup(props) {
    const table = computed(() => props.rows.map((r, index) => {
      const value = r.key.split('.').reduce((a, b) => a[b], props.data)
      if (value == undefined) {
        return undefined
      }

      return {
        ...r,
        key: `${props.idKey != undefined ? props.data[props.idKey] : index}-${r.key}`,
        value,
      }
    }).filter(row => row != undefined))

    return {
      table,
    }
  },
})
</script>
