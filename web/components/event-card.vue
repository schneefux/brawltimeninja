<template>
  <div
    class="link-card flex flex-col justify-end"
    itemscope
    itemtype="http://schema.org/Event"
  >
    <nuxt-link
      :to="`/tier-list/map/${event.id}`"
      class="link-light capitalize"
      :target="isInIframe ? '_blank' : ''"
      itemprop="url"
    >
      <div
        v-if="asset.default"
        :style="`background-image: url('${asset.default}')`"
        class="h-48 bg-contain bg-no-repeat bg-center mt-6"
      />
      <meta itemprop="image" :content="asset.default" />
      <div itemprop="location" itemscope itemtype="http://schema.org/Place">
        <meta itemprop="address" :content="formatMode(event.mode)" />
      </div>
      <p class="mt-4 text-center text-xl" itemprop="name">
        {{ formatMode(event.mode) }}
        -
        {{ event.map }}
      </p>
      <meta itemprop="startDate" :content="event.start" />
      <meta itemprop="endDate" :content="event.end" />

      <div v-if="load" class="flex flex-wrap justify-center">
        <p class="mb-1 mt-1 w-full text-center text-sm">Best Brawlers:</p>
        <ul>
          <li
            v-for="brawler in (bestByEvent[event.id] || []).slice(0, 3)"
            :key="brawler.id"
            class="inline-block px-2 text-grey-darker text-xs"
            itemprop="performer"
            itemscope
            itemtype="http://schema.org/Person"
          >
            <div class="card border-grey-darker border flex justify-between mx-auto">
              <div class="w-12">
                <img
                  :src="require(`~/assets/images/hero/icon/${brawler.id}_optimized.png`)"
                  :alt="brawler.name"
                  class="h-8"
                  itemprop="image"
                >
              </div>
            </div>
            <p itemprop="name" class="mt-1 text-center">{{ brawler.name }}</p>
            <p
              v-if="brawler.stats"
              class="text-center tracking-tight"
              itemscope
              itemtype="http://schema.org/QuantitativeValue"
            >

              <span itemprop="value">{{ metaStatMaps.formatters[brawler.sortProp](brawler.stats[brawler.sortProp]) }}</span>
              <span itemprop="unitText">{{ metaStatMaps.labelsShort[brawler.sortProp] }}</span>
            </p>
          </li>
        </ul>
      </div>
    </nuxt-link>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { formatMode, metaStatMaps } from '~/lib/util'

export default {
  name: 'EventCard',
  props: {
    event: {
      type: Object,
      required: true
    },
    load: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    isInIframe() {
      try {
        return global.window === undefined || global.window.self !== global.window.top
      } catch (e) {
        return true
      }
    },
    ...mapState({
      bestByEvent: state => state.bestByEvent,
    })
  },
  data() {
    return {
      asset: {},
      formatMode,
      metaStatMaps,
    }
  },
  async created() {
    try {
      this.asset = await import(`~/assets/images/map/${this.event.id.replace(/^1500/, '150').replace(/-boss$/, '')}_small.jpg`)
    } catch (e) {
      if (process.client) {
        this.$ga.exception('cannot load map image: ' + e.message)
      }
      console.log('cannot load map image', e)
    }
  },
}
</script>
