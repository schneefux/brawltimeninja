<template>
  <div class="py-8 px-6 relative">
    <h1 class="text-4xl md:text-center mt-2 font-semibold">
      How many players does Brawl Stars have?
    </h1>
    <p class="mt-2 md:text-center">
      Some text goes here.
      The data is from Brawl Stars battles.
    </p>

    <p
      v-if="totalSampleSize < 10000"
      class="my-8 text-center"
    >
      ⚠ Not enough data yet!
      Statistics will be inaccurate.
      Play a few battles and come back later. ⚠
    </p>

    <div class="section-heading">
      <h2 class="text-2xl font-semibold">
        Brawl Stars Analysis
      </h2>
    </div>

    <div class="section">
      <ul>
        <li
          v-for="entry in modes"
          :key="entry.mode"
        >
          <span>
            {{ formatMode(entry.mode) }}
          </span>
          <span>
            {{ entry.sampleSize }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { formatMode } from '~/lib/util'

export default {
  name: 'NumbersPage',
  head() {
    const description = 'TODO'
    return {
      title: 'TODO',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      formatMode,
    }
  },
  computed: {
    totalSampleSize() {
      return this.modes.reduce((sum, mode) => sum + mode.sampleSize, 0)
    },
    modes() {
      return [...Object.values(this.modeMeta)].sort((m1, m2) => m2.sampleSize - m1.sampleSize)
    },
    ...mapState({
      modeMeta: state => state.modeMeta,
      ads: state => state.adsEnabled,
      isApp: state => state.isApp,
    }),
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadModeMeta')
    }
  },
  async created() {
    if (process.static) {
      await this.loadModeMeta()
    }
  },
  methods: {
    ...mapActions({
      loadModeMeta: 'loadModeMeta',
    }),
  },
}
</script>
