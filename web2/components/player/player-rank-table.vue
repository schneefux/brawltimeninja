<template>
  <table class="w-full">
    <thead>
      <tr class="h-8 border-b border-gray-600">
        <th scope="col" class="text-right pr-2">
          #
        </th>
        <th scope="col" class="text-left">
          {{ $t('metric.player') }}
        </th>
        <th
          v-for="(column, index) in columns"
          :key="column"
          scope="col"
          class="text-center"
        >
          {{ columnNames[index] || column }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-if="rows.length == 0"
        class="w-full"
      >
        <td
          :colspan="2 + columns.length"
          class="text-center"
        >
          {{ $t('state.no-data') }}
        </td>
      </tr>
      <tr
        v-for="(row, index) in rows"
        :key="row.player_tag"
      >
        <th scope="row" class="text-right pr-2 pt-1">
          {{ index+1 }}
        </th>
        <td>
          <router-link
            :to="`/profile/${row.player_tag.startsWith('#') ? row.player_tag.slice(1) : row.player_tag}`"
            class="flex items-center"
          >
            <media-img
              :path="`/avatars/${row.player_icon_id}`"
              :alt="row.player_name"
              clazz="h-8 w-8 object-contain"
              size="200"
            ></media-img>
            <span class="ml-2">
              {{ row.player_name }}
            </span>
          </router-link>
        </td>
        <td
          v-for="column in columns"
          :key="column"
          class="text-center pt-1"
        >
          {{ (row as any)[column] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

export interface PlayerRankTableRow {
  player_name: string
  player_tag: string
  player_icon_id: number
}

export default defineComponent({
  props: {
    columns: {
      type: Array as PropType<string[]>,
      required: true
    },
    columnNames: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    rows: {
      type: Array as PropType<PlayerRankTableRow[]>,
      required: true,
    },
  },
})
</script>
