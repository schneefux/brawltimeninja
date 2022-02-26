<template>
  <b-card
    :elevation="0"
    dense
  >
    <div
      slot="content"
      class="flex items-center gap-x-4"
    >
      <media-img
        :path="`/brawlers/${brawlerId}/avatar`"
        :alt="brawlerName"
        size="128"
        clazz="w-16 rounded-xl"
      ></media-img>
      <kv-table
        v-if="table.length > 0"
        :data="table"
        class="w-full"
      ></kv-table>
      <div
        v-else
        class="w-full h-full flex"
      >
        <p class="m-auto">{{ $t('state.no-data') }}</p>
      </div>
    </div>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    brawlerId: {
      type: String,
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
    table: {
      type: Array as PropType<string[][]>,
      required: true
    },
  },
})
</script>
