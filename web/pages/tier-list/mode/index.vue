<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">Game Mode Tier Lists</h1>
      <p>
        Mode Tier Lists for all modes in Brawl Stars.
        Click on a Mode and see the best Brawlers for all Brawl Stars Modes.
      </p>
    </div>

    <client-only>
      <adsense
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="5576993339"
        data-ad-format="auto"
        data-full-width-responsive
      />
    </client-only>

    <div
      class="section"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'modes'),
        once: true,
      }"
    >
      <div class="flex flex-wrap justify-center">
        <mode-best-brawlers-card
          v-for="mode in modes"
          :key="mode"
          :mode="mode"
          :top-brawlers="topBrawlersByMode[mode]"
        ></mode-best-brawlers-card>
      </div>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6913006175"
        data-ad-format="auto"
        data-full-width-responsive
      />
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { getMostPopular, MetaGridEntrySorted } from '../../../lib/util'
import { ModeMetaMap } from '../../../model/MetaEntry'

export default Vue.extend({
  head() {
    const description = 'Brawl Stars Game Mode Tier Lists. Find the best Brawlers. View Win Rates and Rankings.'
    return {
      title: 'All Game Modes Tier List',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      modes: [] as string[],
      topBrawlersByMode: {} as { [key: string]: MetaGridEntrySorted[] },
    }
  },
  computed: {
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  async asyncData({ $axios }) {
    const modeMeta = await $axios.$get<ModeMetaMap>('/api/meta/mode')
    const modes = [...Object.keys(modeMeta)]
      .sort((mode1, mode2) => modeMeta[mode2].sampleSize - modeMeta[mode1].sampleSize)
    const topBrawlersByMode = getMostPopular(modeMeta)

    return {
      modes,
      topBrawlersByMode,
    }
  },
  methods: {
    trackScroll(visible, element, section) {
      if (visible) {
        this.$ga.event('modes', 'scroll', section)
      }
    },
  },
})
</script>
