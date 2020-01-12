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
      <p class="mt-4 text-center text-xl" itemprop="location">
        {{ formatMode(event.mode) }}
        -
        {{ event.map }}
      </p>

      <div v-if="load" class="mt-4 flex flex-wrap justify-center">
        <div
          v-for="brawler in (bestByEvent[event.id] || []).slice(0, 3)"
          :key="brawler.id"
          class="px-2"
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
          <div
            v-if="brawler.stats"
            class="mt-1 text-center text-grey-darker text-xs"
            itemscope
            itemtype="http://schema.org/QuantitativeValue"
          >
            <span itemprop="value">{{ metaStatMaps.formatters[brawler.sortProp](brawler.stats[brawler.sortProp]) }}</span>
            <span itemprop="unitText">{{ metaStatMaps.labelsShort[brawler.sortProp] }}</span>
          </div>
        </div>
      </div>
    </nuxt-link>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { formatMode, metaStatMaps } from '~/store/index'

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
      this.$ga.exception('cannot load map image: ' + e.message)
      console.log('cannot load map image', e)
    }
  },
}
</script>
