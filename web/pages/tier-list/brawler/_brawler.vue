<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">{{ brawlerName }}</h1>
    </div>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'starpowers'),
        once: true,
      }"
    >
      <h2 class="page-h2">
        {{ brawlerName }} Star Powers
      </h2>
      <p>
        The statistics are calculated as the difference between a Brawler with one Star Power and a Brawler with zero Star Powers.
      </p>
    </div>

    <media-img
      :path="'/brawlers/' + brawlerId + '/model'"
      clazz="absolute w-1/3 md:w-1/6 mr-2 md:mr-10 right-0 z-0 opacity-25"
    ></media-img>

    <div class="section flex flex-wrap justify-center">
      <template v-for="entry in starpowers">
        <div
          :key="entry.id"
          class="card-wrapper"
        >
          <div class="card prop-card prop-card-md w-48 bg-gray-800">
            <span class="prop-card-title capitalize">
              {{ entry.starpowerName.length > 0 ? entry.starpowerName.toLowerCase() : 'No Starpower' }}
            </span>
            <media-img
              v-if="entry.starpowerName.length > 0"
              :path="'/starpowers/' + entry.id"
              size="96"
              clazz="prop-card-image"
            ></media-img>
            <media-img
              v-else
              :path="'/brawlers/' + brawlerId + '/avatar'"
              size="96"
              clazz="prop-card-image"
            ></media-img>
            <dl class="prop-card-content prop-card-content-md">
              <div>
                <span class="card-prop-icon">
                  {{ metaStatMaps.icons.winRate }}
                </span>
                <dd class="card-prop-value inline">
                  {{ metaStatMaps.formatters.winRate(entry.stats.winRate) }}
                </dd>
              </div>
              <dt class="text-sm">
                {{ metaStatMaps.labels.winRate }}
              </dt>
            </dl>
          </div>
        </div>
      </template>
    </div>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'gadgets'),
        once: true,
      }"
    >
      <h2 class="page-h2">
        Gadget Tier List
      </h2>
      <p>
        The statistics are calculated as the difference between a Brawler with one Gadget and a Brawler with zero Gadgets.
      </p>
    </div>

    <div class="section flex flex-wrap justify-center">
      <template v-for="entry in gadgets">
        <div
          :key="entry.id"
          class="card-wrapper"
        >
          <div class="card prop-card prop-card-md w-48 bg-gray-800">
            <span class="prop-card-title capitalize">
              {{ entry.gadgetName.length > 0 ? entry.gadgetName.toLowerCase() : 'No Gadget' }}
            </span>
            <media-img
              v-if="entry.gadgetName.length > 0"
              :path="'/gadgets/' + entry.id"
              size="96"
              clazz="prop-card-image"
            ></media-img>
            <media-img
              v-else
              :path="'/brawlers/' + brawlerId + '/avatar'"
              size="96"
              clazz="prop-card-image"
            ></media-img>
            <dl class="prop-card-content prop-card-content-md">
              <div>
                <span class="card-prop-icon">
                  {{ metaStatMaps.icons.winRate }}
                </span>
                <dd class="card-prop-value inline">
                  {{ metaStatMaps.formatters.winRate(entry.stats.winRate) }}
                </dd>
              </div>
              <dt class="text-sm">
                {{ metaStatMaps.labels.winRate }}
              </dt>
            </dl>
          </div>
        </div>
      </template>
    </div>

    <client-only>
      <adsense
        id="ezoic-pub-ad-placeholder-108"
        ins-class="w-full md:w-1/2 mt-4 mx-auto"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="8533352178"
        data-ad-format="auto"
        data-full-width-responsive
      />
    </client-only>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'trophy-graphs'),
        once: true,
      }"
    >
      <h2 class="page-h2">
        Trophy Graphs
      </h2>
    </div>

    <div class="md:flex md:flex-wrap md:justify-center">
      <div class="card-wrapper">
        <plotly
          :traces="trophiesUseRateChart.traces"
          :layout="trophiesUseRateChart.layout"
          :options="trophiesUseRateChart.options"
          class="h-48 card md:max-w-lg"
        ></plotly>
      </div>

      <div class="card-wrapper">
        <plotly
          :traces="trophiesWinRateChart.traces"
          :layout="trophiesWinRateChart.layout"
          :options="trophiesWinRateChart.options"
          class="h-48 card md:max-w-lg"
        ></plotly>
      </div>

      <div class="card-wrapper">
        <plotly
          :traces="trophiesStarRateChart.traces"
          :layout="trophiesStarRateChart.layout"
          :options="trophiesStarRateChart.options"
          class="h-48 card md:max-w-lg"
        ></plotly>
      </div>
    </div>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'modes'),
        once: true,
      }"
    >
      <h2 class="page-h2">
        Best Modes for {{ brawlerName }}
      </h2>
    </div>

    <div class="section">
      <div class="flex flex-wrap">
        <div
          v-for="entry in modes"
          :key="entry.mode"
          class="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 card-wrapper mx-auto z-10"
        >
          <div
            class="items-center card bg-center bg-cover h-full relative"
            :style="{
              'background-image': `linear-gradient(rgba(0, 0, 0, 0.70), rgba(0, 0, 0, 0.70)), url('${mediaUrl}/modes/${entry.mode}/background.jpg?size=1024')`,
            }"
          >
            <div class="relative z-10 card-content">
              <span class="card-header">
                {{ formatMode(entry.mode) }}
              </span>
              <div class="card-props">
                <table class="w-full">
                  <tbody>
                    <tr
                      v-for="(_, prop) in entry.stats"
                      :key="prop"
                      class="card-props whitespace-no-wrap"
                    >
                      <td class="card-prop-label">
                        {{ metaStatMaps.labels[prop] }}
                      </td>
                      <td class="card-prop-value text-right pl-1">
                        {{ metaStatMaps.formatters[prop](entry.stats[prop]) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        id="ezoic-pub-ad-placeholder-109"
        ins-class="w-full mt-6 mx-auto h-32"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="6837127123"
        data-ad-format="auto"
        data-full-width-responsive
      />
    </client-only>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { metaStatMaps, formatMode, modeToBackgroundId, capitalizeWords } from '~/lib/util'

const trophyGraphLayout = {
  xaxis: {
    title: 'Trophies',
    fixedrange: true,
    tickcolor: '#ffffff',
  },
  yaxis: {
    title: '',
    fixedrange: true,
    tickformat: ',.0%',
    tickcolor: '#ffffff',
  },
  margin: { t: 10, l: 55, b: 65, r: 10 },
  staticPlot: true,
  plot_bgcolor: 'rgba(0, 0, 0, 0)',
  paper_bgcolor: '#2d3748', // black
  font: {
    color: '#ffffff',
  },
}

const trophyGraphOptions = {
  displayModeBar: false,
  responsive: true,
}

export default {
  name: 'StarpowerMetaPage',
  head() {
    const description = `${this.brawlerName} Brawl Stars stats. Star Power Tier List and Gadget Tier List with win rate and pick rates for all modes.`
    return {
      title: `${this.brawlerName} Star Power and Gadget Tier List`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  data() {
    return {
      metaStatMaps,
      formatMode,
      modeToBackgroundId,
      starpowerMeta: [],
      gadgetMeta: [],
      modeMeta: {},
      brawlerStats: {},
    }
  },
  computed: {
    totalSampleSize() {
      return this.starpowerMeta
        .reduce((sampleSize, entry) => sampleSize + entry.sampleSize, 0)
    },
    starpowers() {
      return this.starpowerMeta
        .filter(entry => entry.brawlerName === this.brawlerId)
        .sort((e1, e2) => e2.sampleSize - e1.sampleSize)
    },
    gadgets() {
      return this.gadgetMeta
        .filter(entry => entry.brawlerName === this.brawlerId)
        .sort((e1, e2) => e2.sampleSize - e1.sampleSize)
    },
    modes() {
      // transpose { mode: { brawler} } to { brawler: mode }
      return [...Object.values(this.modeMeta)]
        .map(meta => [...Object.entries(meta.brawlers)]
          .map(([brawlerId, brawler]) => ({
            mode: meta.mode,
            brawlerId,
            ...brawler
          }))
        )
        .reduce((allEntries, modeEntries) => allEntries.concat(...modeEntries), [])
        .filter(({ brawlerId }) => brawlerId === this.brawlerId)
        .sort((m1, m2) => m2.sampleSize - m1.sampleSize)
    },
    trophiesUseRateChart() {
      const trophyranges = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
      const useRates = trophyranges.map(t =>
        this.brawlerStats.brawlerByTrophies.find(b => b.trophyrange == t).picksWeighted
        /
        this.brawlerStats.totalByTrophies.find(b => b.trophyrange == t).picksWeighted
     )

      const traces = [{
        x: trophyranges,
        y: useRates,
        mode: 'lines+markers',
        type: 'scatter',
      }]

      const layout = {
        ...trophyGraphLayout,
        yaxis: {
          title: 'Use Rate',
          fixedrange: true,
          tickformat: ',.0%',
          tickcolor: '#ffffff',
        },
        shapes: [ {
          type: 'line',
          x0: 0,
          y0: 1 / this.totalBrawlers,
          x1: 1000,
          y1: 1 / this.totalBrawlers,
          line: {
            color: 'grey',
            width: 1.5,
            dash: 'dot',
          },
        } ],
      }

      return {
        traces,
        layout,
        options: trophyGraphOptions,
      }
    },
    trophiesWinRateChart() {
      const trophyranges = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
      const winRates = trophyranges.map(t => this.brawlerStats.brawlerByTrophies.find(b => b.trophyrange == t).winRate)
      const avgTotalWinRate = this.brawlerStats.totalByTrophies.reduce((sum, e) => sum + e.winRate * e.picks, 0) / this.brawlerStats.totalByTrophies.reduce((sum, e) => sum + e.picks, 0)

      const traces = [{
        x: trophyranges,
        y: winRates,
        mode: 'lines+markers',
        type: 'scatter',
      }]

      const layout = {
        ...trophyGraphLayout,
        yaxis: {
          title: 'Win Rate',
          fixedrange: true,
          tickformat: ',.0%',
          tickcolor: '#ffffff',
        },
        shapes: [ {
          type: 'line',
          x0: 0,
          y0: avgTotalWinRate,
          x1: 1000,
          y1: avgTotalWinRate,
          line: {
            color: 'grey',
            width: 1.5,
            dash: 'dot',
          },
        } ],
      }

      return {
        traces,
        layout,
        options: trophyGraphOptions,
      }
    },
    trophiesStarRateChart() {
      const trophyranges = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
      const starRates = trophyranges.map(t => this.brawlerStats.brawlerByTrophies.find(b => b.trophyrange == t).starRate)
      const avgTotalStarRate = this.brawlerStats.totalByTrophies.reduce((sum, e) => sum + e.starRate * e.picks, 0) / this.brawlerStats.totalByTrophies.reduce((sum, e) => sum + e.picks, 0)

      const traces = [{
        x: trophyranges,
        y: starRates,
        mode: 'lines+markers',
        type: 'scatter',
      }]

      const layout = {
        ...trophyGraphLayout,
        yaxis: {
          title: 'Star Rate',
          fixedrange: true,
          tickformat: ',.0%',
          tickcolor: '#ffffff',
        },
        shapes: [ {
          type: 'line',
          x0: 0,
          y0: avgTotalStarRate,
          x1: 1000,
          y1: avgTotalStarRate,
          line: {
            color: 'grey',
            width: 1.5,
            dash: 'dot',
          },
        } ],
      }

      return {
        traces,
        layout,
        options: trophyGraphOptions,
      }
    },
    mediaUrl() {
      return process.env.mediaUrl
    },
    ...mapState({
      totalBrawlers: state => state.totalBrawlers,
      isApp: state => state.isApp,
    }),
  },
  async asyncData({ params, $axios }) {
    const starpowerMeta = await $axios.$get('/api/meta/starpower')
    const gadgetMeta = await $axios.$get('/api/meta/gadget')
    const modeMeta = await $axios.$get('/api/meta/mode')
    const brawlerId = params.brawler
    const brawlerStats = await $axios.$get('/api/brawler/' + brawlerId)
    return {
      brawlerId,
      brawlerName: capitalizeWords(brawlerId.replace(/_/g, ' ')),
      starpowerMeta,
      gadgetMeta,
      modeMeta,
      brawlerStats,
    }
  },
  methods: {
    trackScroll(visible, element, section) {
      if (visible) {
        this.$ga.event('brawler', 'scroll', section)
      }
    },
    ...mapActions({
      loadStarpowerMeta: 'loadStarpowerMeta',
      loadGadgetMeta: 'loadGadgetMeta',
      loadModeMeta: 'loadModeMeta',
    }),
  },
}
</script>
