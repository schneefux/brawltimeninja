<template>
  <div>
    <table class="mx-auto">
      <thead>
        <tr class="h-8 border-b border-gray-600">
          <th
            v-if="ranked"
            scope="col"
            class="text-right pr-2"
          >
            #
          </th>
          <th
            v-for="(c, index) in columns"
            :key="c.keys.join('-')"
            :class="['text-left', {
              'pr-1': index != columns.length - 1,
            }]"
            scope="col"
          >
            {{ c.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="pageRows.length == 0">
          <td
            :colspan="(ranked ? 1 : 0) + columns.length"
            class="text-center overflow-auto"
          >
            {{ $t('state.no-data') }}
          </td>
        </tr>
        <tr
          v-for="r in pageRows"
          :key="r[idKey]"
        >
          <td
            v-if="ranked"
            scope="row"
            class="text-right pr-2 pt-1"
          >
            {{ r.index + 1 }}
          </td>
          <td
            v-for="c in renderedColumns"
            :key="c.keys.join('-')"
            :class="['text-left pt-1', {
              'pr-1': c.index != columns.length - 1,
            }]"
          >
            <slot
              :name="c.slot"
              :row="r.row"
            >
              {{ r.fields[c.index] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <paginator
      v-if="pageSize != undefined"
      v-model="page"
      :pages="Math.floor(rows.length / pageSize)"
      class="pt-2 pb-1 mt-auto"
    ></paginator>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export interface Column {
  /** column title */
  title: string
  /** dot-path to property rendered in cell per default */
  keys: string[]
  /** cell slot to use instead. the slot receives a "row" prop. */
  slot?: string
}

interface IndexedColumn extends Column {
  index: number
}

export default Vue.extend({
  props: {
    columns: {
      type: Array as PropType<Column[]>,
      required: true
    },
    idKey: {
      type: String,
      required: true
    },
    rows: {
      type: Array as PropType<object[]>,
      required: true
    },
    pageSize: {
      type: Number
    },
    ranked: {
      type: Boolean
    },
  },
  watch: {
    columns() {
      this.page = 0
    },
    rows() {
      this.page = 0
    },
  },
  data() {
    return {
      page: 0,
    }
  },
  computed: {
    pageRows(): object[] {
      const offset = this.page * (this.pageSize || 0)
      const pageRows = this.pageSize == undefined ? this.rows : this.rows.slice(offset, (this.page+1)*this.pageSize)
      return pageRows.map((r, index) => ({
        index: offset + index,
        row: r,
        fields: this.columns.map(c => c.keys.map(k => k.split('.').reduce((a, b) => a[b], r)).join(', ')),
      }))
    },
    renderedColumns(): IndexedColumn[] {
      return this.columns
        .map((c, index) => ({
          ...c,
          index,
        }))
    },
  },
})
</script>
