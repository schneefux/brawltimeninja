<template>
  <card v-bind="$attrs">
    <table slot="content" class="w-full text-lg">
      <thead>
        <tr class="h-8 border-b border-gray-600">
          <th scope="col" class="text-right pr-2">
            #
          </th>
          <th scope="col" class="text-left">
            Name
          </th>
          <th scope="col" class="text-left">
            {{ metaStatMaps.labels[stat] }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="entry in sortedEntries.slice(page*pageSize, (page+1)*pageSize)"
          :key="entry.id"
        >
          <th
            scope="row"
            class="text-right pr-2 pt-1"
          >
            {{ entry.sampleSize < sampleSizeThreshold ? '?' : entry.index }}
          </th>
          <td class="pr-2">
            <component
              :is="entry.link == undefined ? 'div' : 'router-link'"
              :to="entry.link || ''"
              :title="entry.title"
              class="flex items-center"
            >
              <brawler-team
                v-if="entry.brawlers.length > 1"
                :brawlers="entry.brawlers"
                class="flex-shrink-0 md:mr-2 w-16 sm:w-20 md:w-24"
                height="h-6 sm:h-8 md:h-10"
              ></brawler-team>
              <div
                v-else
                class="mr-2 w-10 sm:w-12 md:w-14 bg-gray-900 rounded-sm relative"
              >
                <media-img
                  :path="`/brawlers/${brawlerId({ name: entry.brawlers[0] })}/avatar`"
                  :alt="entry.brawlers[0]"
                  size="160"
                  clazz="h-8 md:h-10"
                />
                <media-img
                  v-if="entry.icon"
                  :path="entry.icon"
                  :alt="entry.title"
                  size="80"
                  clazz="h-5 md:h-6 absolute top-0 right-0 bg-gray-900 bg-opacity-75 rounded-full p-px"
                />
              </div>
              <span class="font-semibold">{{ entry.title }}</span>
            </component>
          </td>
          <td class="text-center font-semibold">
            {{ typeof entry.stats[stat] == 'string' ? entry.stats[stat] : metaStatMaps.formatters[stat](entry.stats[stat]) }}
          </td>
        </tr>
      </tbody>
    </table>
    <paginator
      slot="actions"
      v-model="page"
      :pages="Math.floor(sortedEntries.length / pageSize)"
      class="w-full"
    ></paginator>
  </card>
</template>

<script lang="ts">
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons'
import Vue, { PropType } from 'vue'
import { metaStatMaps, MetaGridEntry, brawlerId, compare1 } from '../lib/util'

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
    sortedEntries(): MetaGridEntry[] {
      const aboveThreshold = this.entries.filter(e => e.sampleSize >= this.sampleSizeThreshold)
      const belowThreshold = this.entries.filter(e => e.sampleSize < this.sampleSizeThreshold)
      return aboveThreshold
        .sort(compare1(this.stat as any))
        .concat(belowThreshold)
        .map((e, index) => ({ ...e, index: index + 1 }))
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
