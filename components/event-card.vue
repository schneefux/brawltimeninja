<template>
  <div
    class="link-card flex flex-col justify-end"
  >
    <nuxt-link
      :to="`/meta/map/${event.id}`"
      class="link-light capitalize"
    >
      <div
        v-if="asset.default"
        :style="`background-image: url('${asset.default}')`"
        class="h-48 bg-contain bg-no-repeat bg-center mt-6"
      />
      <p class="mt-4 text-center text-xl">
        {{ formatMode(event.mode) }}
        -
        {{ event.map }}
      </p>

      <div class="mt-4 flex flex-wrap justify-center">
        <div
          v-for="brawler in (bestBrawlersByMap[event.id] || []).slice(0, 3)"
          :key="brawler.id"
          class="px-2"
        >
          <div class="card border-grey-darker border flex justify-between mx-auto">
            <div class="w-12">
              <img
                :src="require(`~/assets/images/hero/icon/${brawler.id}_optimized.png`)"
                class="h-8"
              >
            </div>
          </div>
          <div
            v-if="brawler.stats"
            class="mt-1 text-center text-grey-darker text-xs"
          >
            {{ metaStatMaps.formatters[brawler.sortProp](brawler.stats[brawler.sortProp]) }}
            {{ metaStatMaps.labelsShort[brawler.sortProp] }}
          </div>
        </div>
      </div>
    </nuxt-link>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { formatMode, metaStatMaps } from '~/store/index'

export default {
  name: 'EventCard',
  props: {
    event: {
      type: Object,
      required: true
    },
  },
  computed: {
    ...mapGetters({
      bestBrawlersByMap: 'bestBrawlersByMap',
    })
  },
  data() {
    return {
      asset: {},
      formatMode,
      metaStatMaps,
    }
  },
  methods: {
    ...mapActions({
      loadCurrentEvents: 'loadCurrentEvents',
      loadUpcomingEvents: 'loadUpcomingEvents',
      loadMapMeta: 'loadMapMeta',
    }),
  },
  async created() {
    try {
      this.asset = await import(`~/assets/images/map/${this.event.id.replace(/^1500/, '150').replace(/-boss$/, '')}_small.jpg`)
    } catch (e) {
      this.$ga.exception('cannot load map image: ' + e.message)
      console.log('cannot load map image', e)
    }
    await this.loadMapMeta()
  },
}
</script>
