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

    <b-tabs
      :tabs="tabs"
      class="mt-12"
      nav-class="top-14 md:top-0 z-20"
      vertical
    >
      <b-page-section slot="overview">
        <brawler-base-stats
          :brawler-id="brawlerId"
          :brawler-name="brawlerName"
        ></brawler-base-stats>

        <p class="mt-8 prose dark:prose-invert">
          {{ $t('starpower-gadget-comparison.info') }}
        </p>
      </b-page-section>

      <b-page-section
        slot="synergies"
        :title="$t('brawler.synergies-and-weaknesses-for', { brawler: brawlerName })"
        v-observe-visibility="{
          callback: makeVisibilityCallback('synergies'),
          once: true,
        }"
      >
        <b-scrolling-dashboard>
          <c-dashboard-cell :rows="2" :columns="6" hide-empty>
            <brawler-synergies-card
              :brawler="brawlerName"
            ></brawler-synergies-card>
          </c-dashboard-cell>
          <c-dashboard-cell :rows="2" :columns="6" hide-empty>
            <brawler-weaknesses-card
              :brawler="brawlerName"
            ></brawler-weaknesses-card>
          </c-dashboard-cell>
        </b-scrolling-dashboard>
      </b-page-section>

      <div slot="maps">
        <b-page-section
          :title="$t('brawler.current-maps.title', { brawler: brawlerName })"
          v-observe-visibility="{
            callback: makeVisibilityCallback('current-maps'),
            once: true,
          }"
        >
          <brawler-active-events :brawler-name="brawlerName"></brawler-active-events>
        </b-page-section>

        <b-page-section
          :title="$t('brawler.modes.title', { brawler: brawlerName })"
          v-observe-visibility="{
            callback: makeVisibilityCallback('modes'),
            once: true,
          }"
        >
          <brawler-modes-stats
            :brawler-id="brawlerId"
            :brawler-name="brawlerName"
          ></brawler-modes-stats>

          <p class="mt-4 prose dark:prose-invert">
            {{ $t('brawler.viable-info') }}
          </p>
        </b-page-section>
      </div>

      <div slot="trends">
        <b-page-section
          :title="$t('brawler.trends', { brawler: brawlerName })"
          v-observe-visibility="{
            callback: makeVisibilityCallback('trends'),
            once: true,
          }"
        >
          <p
            slot="description"
            class="mt-4 prose dark:prose-invert"
          >
            {{ $t('brawler.trend.description', { brawler: brawlerName }) }}
          </p>

          <brawler-trends-card
            :brawler-name="brawlerName"
            class="mt-4"
          ></brawler-trends-card>
        </b-page-section>

        <b-page-section
          :title="$t('brawler.by-trophies', { brawler: brawlerName })"
          v-observe-visibility="{
            callback: makeVisibilityCallback('trophy-graphs'),
            once: true,
          }"
        >
          <brawler-trophy-graphs
            :brawler-name="brawlerName"
          ></brawler-trophy-graphs>

          <p class="mt-4 prose dark:prose-invert">
            {{ $t('brawler.disclaimer') }}
          </p>
        </b-page-section>
      </div>
    </b-tabs>

    <ad
      ad-slot="6837127123"
      lazy
    ></ad>
  </b-page>
</template>

<script lang="ts">
import { computed, defineComponent, useContext, useMeta, useRoute } from '@nuxtjs/composition-api'
import { capitalizeWords } from '@/lib/util'
import { CDashboardCell, BTabs } from '@schneefux/klicker/components'
import { useTrackScroll } from '~/composables/gtag'

export default defineComponent({
  components: {
    CDashboardCell,
    BTabs,
  },
  head: {},
  setup() {
    const { i18n } = useContext()

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

    const tabs = [{
      slot: 'overview',
      title: 'Overview',
    }, {
      slot: 'synergies',
      title: 'Synergies',
    }, {
      slot: 'maps',
      title: 'Maps',
    }, {
      slot: 'trends',
      title: 'Trends',
    }]

    return {
      tabs,
      brawlerId,
      brawlerName,
      makeVisibilityCallback,
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
