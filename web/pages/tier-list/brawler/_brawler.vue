<template>
  <b-page :title="brawlerName">
    <breadcrumbs
      :links="[{
        path: '/tier-list/brawler',
        name: $tc('brawler', 2),
      }, {
        path: `/tier-list/brawler/${brawlerId}`,
        name: brawlerName,
      }]"
      class="mt-4"
    ></breadcrumbs>

    <ad
      ad-slot="8533352178"
      first
    ></ad>

    <b-split-dashboard>
      <brawler-aside
        slot="aside"
        :brawler-id="brawlerId"
        :brawler-name="brawlerName"
        class="mt-16"
      ></brawler-aside>

      <b-page-section :title="$t('brawler.overview')">
        <brawler-overview
          :brawler-id="brawlerId"
          :scraped-data="scrapedData"
        ></brawler-overview>
      </b-page-section>

      <b-page-section :title="$t('brawler.accessories')">
        <lazy-hydrate when-visible>
          <brawler-accessories
            :scraped-data="scrapedData"
          ></brawler-accessories>
        </lazy-hydrate>
      </b-page-section>

      <b-page-section
        :title="$t('brawler.synergies-and-weaknesses-for', { brawler: brawlerName })"
        v-observe-visibility="{
          callback: makeVisibilityCallback('synergies'),
          once: true,
        }"
      >
        <lazy-hydrate when-visible>
          <brawler-synergies
            :brawler-name="brawlerName"
          ></brawler-synergies>
        </lazy-hydrate>
      </b-page-section>

      <div>
        <b-page-section
          :title="$t('brawler.current-maps.title', { brawler: brawlerName })"
          v-observe-visibility="{
            callback: makeVisibilityCallback('current-maps'),
            once: true,
          }"
        >
          <lazy-hydrate when-visible>
            <brawler-active-events
              :brawler-name="brawlerName"
            ></brawler-active-events>
          </lazy-hydrate>
        </b-page-section>

        <b-page-section
          :title="$t('brawler.modes.title', { brawler: brawlerName })"
          v-observe-visibility="{
            callback: makeVisibilityCallback('modes'),
            once: true,
          }"
        >
          <lazy-hydrate when-visible>
            <brawler-modes-stats
              :brawler-name="brawlerName"
            ></brawler-modes-stats>
          </lazy-hydrate>

          <p class="mt-4 prose dark:prose-invert text-gray-800/75 dark:text-gray-200/75">
            {{ $t('brawler.viable-info') }}
          </p>
        </b-page-section>
      </div>

      <div>
        <b-page-section
          :title="$t('brawler.trends', { brawler: brawlerName })"
          v-observe-visibility="{
            callback: makeVisibilityCallback('trends'),
            once: true,
          }"
        >
          <p
            slot="description"
            class="mt-4 prose dark:prose-invert text-gray-800/75 dark:text-gray-200/75"
          >
            {{ $t('brawler.trend.description', { brawler: brawlerName }) }}
          </p>

          <lazy-hydrate when-visible>
            <lazy-brawler-trends-card
              :brawler-name="brawlerName"
              class="mt-4"
            ></lazy-brawler-trends-card>
          </lazy-hydrate>
        </b-page-section>

        <b-page-section
          :title="$t('brawler.by-trophies', { brawler: brawlerName })"
          v-observe-visibility="{
            callback: makeVisibilityCallback('trophy-graphs'),
            once: true,
          }"
        >
          <lazy-hydrate when-visible>
            <lazy-brawler-trophy-graphs
              :brawler-name="brawlerName"
            ></lazy-brawler-trophy-graphs>
          </lazy-hydrate>

          <p class="mt-4 prose dark:prose-invert text-gray-800/75 dark:text-gray-200/75">
            {{ $t('brawler.disclaimer') }}
          </p>
        </b-page-section>
      </div>

      <!--
        some Brawlers don't have skins, pins, voicelines etc.
        but until scrapedData is fetched, render the placeholders
      -->
      <b-page-section
        v-if="scrapedData == undefined || scrapedData.skins.length > 0"
        :title="$tc('skin', 2)"
      >
        <lazy-hydrate when-visible>
          <brawler-skins
            :scraped-data="scrapedData"
          ></brawler-skins>
        </lazy-hydrate>
      </b-page-section>

      <b-page-section
        v-if="scrapedData == undefined || scrapedData.pins.length > 0"
        :title="$tc('pin', 2)"
      >
        <lazy-hydrate when-visible>
          <brawler-pins
            :scraped-data="scrapedData"
          ></brawler-pins>
        </lazy-hydrate>
      </b-page-section>

      <b-page-section
        v-if="scrapedData == undefined || scrapedData.voicelines.length > 0"
        :title="$tc('voiceline', 2)"
      >
        <lazy-hydrate when-visible>
          <brawler-voicelines
            :scraped-data="scrapedData"
          ></brawler-voicelines>
        </lazy-hydrate>
      </b-page-section>

      <b-page-section
        v-if="scrapedData == undefined || scrapedData.history.length > 0"
        :title="$t('balance-changes')"
      >
        <lazy-hydrate when-visible>
          <brawler-history
            :scraped-data="scrapedData"
          ></brawler-history>
        </lazy-hydrate>
      </b-page-section>
    </b-split-dashboard>

    <b-page-section>
      <brawler-attribution
        :scraped-data="scrapedData"
      ></brawler-attribution>
    </b-page-section>

    <ad
      ad-slot="6837127123"
      lazy
    ></ad>
  </b-page>
</template>

<script lang="ts">
import { computed, defineComponent, useAsync, useContext, useMeta, useRoute } from '@nuxtjs/composition-api'
import { capitalizeWords } from '@/lib/util'
import { CDashboardCell, BSplitDashboard } from '@schneefux/klicker/components'
import { useTrackScroll } from '~/composables/gtag'

export default defineComponent({
  components: {
    BSplitDashboard,
    CDashboardCell,
  },
  head: {},
  setup() {
    const { i18n, $config, $http } = useContext()

    const route = useRoute()
    const brawlerId = computed(() => route.value.params.brawler)

    // TODO this does not restore '.' (Mr. P) or '-' (8-Bit)
    const brawlerName = computed(() => capitalizeWords(brawlerId.value.replace(/__/g, '. ').replace(/_/g, ' ')))

    useMeta(() => {
      const description = i18n.t('tier-list.brawler.meta.description', { brawler: brawlerName.value }) as string
      return {
        title: i18n.t('tier-list.brawler.meta.title', { brawler: brawlerName.value }) as string,
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ]
      }
    })

    const { makeVisibilityCallback } = useTrackScroll('brawler')

    const scrapedData = useAsync(() => $http.$get(`${$config.mediaUrl}/brawlers/${brawlerId.value}/data.json`), `scraped-data-${brawlerId.value}`)

    return {
      brawlerId,
      brawlerName,
      makeVisibilityCallback,
      scrapedData,
    }
  },
  meta: {
    title: 'Brawlers',
    screen: 'brawlers',
  },
  middleware: ['cached'],
  async validate({ params, $klicker }) {
    const brawlerName = capitalizeWords(params.brawler.replace(/__/g, '. ').replace(/_/g, ' '))

    const brawler = await $klicker.query({
      cubeId: 'map',
      slices: {
        brawler: [brawlerName.toUpperCase()],
      },
      dimensionsIds: [],
      metricsIds: ['picks'],
      sortId: 'picks',
      limit: 1,
    })

    return brawler.data[0].metricsRaw.picks > 0
  },
})
</script>
