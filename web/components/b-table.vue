<template>
  <div class="flex flex-col">
    <table class="w-full">
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
            :key="c.key"
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
        <tr
          v-for="(r, index) in pageSize == undefined ? rows : rows.slice(page*pageSize, (page+1)*pageSize)"
          :key="index"
        >
          <th
            v-if="ranked"
            scope="row"
            class="text-right pr-2 pt-1"
          >
            {{ index + 1 + (pageSize == undefined ? 0 : page * pageSize) }}
          </th>
          <td
            v-for="(c, index) in columns"
            :key="c.key"
            :class="['text-left pt-1', {
              'pr-1': index != columns.length - 1,
            }]"
          >
            <slot
              :name="c.key"
              :row="r"
            >
              {{ r[c.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <paginator
      v-if="pageSize != undefined"
      v-model="page"
      :pages="Math.floor(rows.length / pageSize)"
      class="pt-2 mt-auto"
    ></paginator>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export interface Column {
  title: string
  key: string
}

export default Vue.extend({
  props: {
    columns: {
      type: Array as PropType<Column[]>,
      required: true
    },
    rows: {
      type: Array as PropType<unknown[]>,
      required: true
    },
    pageSize: {
      type: Number
    },
    ranked: {
      type: Boolean
    },
  },
  data() {
    return {
      page: 0,
    }
  },
})
</script>
