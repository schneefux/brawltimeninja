<template>
  <card v-bind="$attrs">
    <b-table
      slot="content"
      :columns="columns"
      :rows="rows"
      :page-size="pageSize"
      class="font-semibold"
      ranked
    >
      <template v-slot:index="{ index, row }">
        {{ row.sampleSize < sampleSizeThreshold ? '?' : index }}
      </template>
      <template v-slot:name="{ row }">
        <component
          :is="row.link == undefined ? 'div' : 'router-link'"
          :to="row.link || ''"
          :title="row.title"
          class="flex items-center"
        >
          <brawler-team
            v-if="row.brawlers.length > 1"
            :brawlers="row.brawlers"
            class="flex-shrink-0 md:mr-2 w-16 sm:w-20 md:w-24"
            height="h-6 sm:h-8 md:h-10"
          ></brawler-team>
          <div
            v-if="row.brawlers.length == 1"
            class="mr-2 w-10 sm:w-12 md:w-14 bg-gray-900 rounded-sm relative"
          >
            <media-img
              :path="`/brawlers/${brawlerId({ name: row.brawlers[0] })}/avatar`"
              :alt="row.brawlers[0]"
              size="160"
              clazz="h-8 md:h-10"
            />
            <media-img
              v-if="row.icon"
              :path="row.icon"
              :alt="row.title"
              size="80"
              clazz="h-5 md:h-6 absolute top-0 right-0 bg-gray-900 bg-opacity-75 rounded-full p-px"
            />
          </div>
          <span class="font-semibold">{{ row.title }}</span>
        </component>
      </template>
    </b-table>
  </card>
</template>

<script lang="ts">
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons'
import Vue, { PropType } from 'vue'
import { metaStatMaps, MetaGridEntry, brawlerId, compare1 } from '../lib/util'
import { Column } from './b-table.vue'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    stat: {
      type: String,
      required: true
    },
    entries: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true,
    },
    sampleSizeThreshold: {
      type: Number,
      default: 200
    },
    pageSize: {
      type: Number,
      default: 15
    },
  },
  data() {
    return {
      page: 0,
    }
  },
  computed: {
    columns(): Column[] {
      return [{
        title: 'Name',
        key: 'name',
      }, {
        title: metaStatMaps.labels[this.stat],
        key: this.stat,
      }]
    },
    rows(): unknown[] {
      const aboveThreshold = this.entries.filter(e => e.sampleSize >= this.sampleSizeThreshold)
      const belowThreshold = this.entries.filter(e => e.sampleSize < this.sampleSizeThreshold)
      return aboveThreshold
        .concat(belowThreshold)
        .map(e => ({
          brawlers: e.brawlers,
          icon: e.icon,
          link: e.link,
          title: e.title,
          [this.stat]: metaStatMaps.formatters[this.stat](e.stats[this.stat]),
        }))
    },
    metaStatMaps() {
      return metaStatMaps
    },
    brawlerId() {
      return brawlerId
    },
  },
})
</script>
