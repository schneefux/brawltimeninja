<template>
  <card v-bind="$attrs">
    <div
      slot="content"
      class="flex flex-wrap justify-center"
    >
      <brawler-card
        v-for="(entry, index) in entries.slice(page*pageSize, (page+1)*pageSize)"
        :key="entry.id"
        :title="entry.title"
        :brawlers="entry.brawlers"
        :brawler-id="entry.brawlers.length == 1 ? brawlerId({ name: entry.brawlers[0] }) : undefined"
        :icon="entry.icon"
        elevation="2"
        itemscope
        itemtype="http://schema.org/Person"
      >
        <span
          slot="preview"
          class="text-right font-semibold text-xl"
        >#{{ index + page*pageSize + 1 }}</span>
        <template v-slot:stats>
          <table v-if="entry.sampleSize >= sampleSizeThreshold">
            <tbody>
              <tr
                v-for="stat in measurements"
                :key="stat"
                class="whitespace-nowrap"
                itemscope
                itemtype="http://schema.org/QuantitativeValue"
              >
                <td class="text-center">
                  <img
                    v-if="metaStatMaps.icons[stat].length > 2"
                    :src="require(`~/assets/images/icon/${metaStatMaps.icons[stat]}_optimized.png`)"
                    :alt="stat"
                    class="card-prop-icon inline"
                  >
                  <!-- use emojis (length 2) -->
                  <span
                    v-else
                    class="card-prop-icon"
                  >
                    {{ metaStatMaps.icons[stat] }}
                  </span>
                </td>
                <td class="card-prop-value text-right pr-1" itemprop="unitText">
                  {{ typeof entry.stats[stat] == 'string' ? entry.stats[stat] : metaStatMaps.formatters[stat](entry.stats[stat]) }}
                </td>
                <td class="card-prop-label" itemprop="value">
                  {{ metaStatMaps.labels[stat] }}
                </td>
              </tr>
            </tbody>
          </table>
          <div
            v-else
            class="h-16 flex"
          >
            <span class="m-auto">Not enough data.</span>
          </div>
          <b-button
            v-if="entry.link !== undefined"
            :to="entry.link"
            tag="router-link"
            class="mt-2"
            itemprop="url"
            primary
            xs
          >
            More Statistics
          </b-button>
        </template>
      </brawler-card>
    </div>
    <div
      slot="actions"
      class="w-full flex justify-center"
    >
      <b-button
        v-if="page > 0"
        class="mr-1 w-32"
        primary
        @click="page--"
      >Previous Page</b-button>
      <b-button
        v-if="(page+1)*pageSize < entries.length"
        class="ml-1 w-32"
        primary
        @click="page++"
      >Next Page</b-button>
    </div>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { metaStatMaps, MetaGridEntry, compare1, brawlerId } from '../lib/util'
import BrawlerTeam from '~/components/brawler-team.vue'

export default Vue.extend({
  inheritAttrs: false,
  components: {
    BrawlerTeam,
  },
  props: {
    measurements: {
      type: Array as PropType<string[]>,
      required: true
    },
    entries: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true,
    },
    stat: {
      type: String,
      required: true
    },
    sampleSizeThreshold: {
      type: Number,
      default: 200
    },
    pageSize: {
      type: Number,
      default: 6
    }
  },
  data() {
    return {
      page: 0,
    }
  },
  watch: {
    entries() {
      this.page = 0
    },
  },
  computed: {
    brawlerId() {
      return brawlerId
    },
    metaStatMaps() {
      return metaStatMaps
    },
  },
})
</script>
