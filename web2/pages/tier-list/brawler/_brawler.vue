<template>
  <b-page :title="brawlerName">
    <breadcrumbs
      :links="[{
        path: '/tier-list/brawler',
        name: $t('brawler', 2),
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
      <template v-slot:aside>
        <div class="lg:h-screen lg:flex lg:flex-col lg:py-8 lg:mt-8">
          <brawler-aside
            :brawler-id="brawlerId"
            :brawler-name="brawlerName"
            class="!h-auto"
          ></brawler-aside>

          <b-scroll-spy
            :sections="sections"
            nav-class="top-14 lg:top-0"
            toc-class="hidden lg:block"
            class="lg:mt-8 lg:overflow-y-auto hide-scrollbar"
          ></b-scroll-spy>
        </div>
      </template>

      <b-page-section
        ref="overviewSection"
        :title="$t('brawler.overview')"
        v-observe-visibility="{
          callback: makeVisibilityCallback('overview'),
          once: true,
        }"
      >
        <brawler-overview
          :brawler-id="brawlerId"
          :scraped-data="scrapedData"
        ></brawler-overview>
      </b-page-section>

      <b-page-section
        ref="accessorySection"
        :title="$t('brawler.accessories')"
        v-observe-visibility="{
          callback: makeVisibilityCallback('accessories'),
          once: true,
        }"
        lazy
      >
        <brawler-accessories
          :scraped-data="scrapedData"
        ></brawler-accessories>
      </b-page-section>

      <b-page-section
        ref="synergySection"
        :title="$t('brawler.synergies-and-weaknesses-for', { brawler: brawlerName })"
        v-observe-visibility="{
          callback: makeVisibilityCallback('synergies'),
          once: true,
        }"
        lazy
      >
        <brawler-synergies
          :brawler-name="brawlerName"
        ></brawler-synergies>
      </b-page-section>

      <b-page-section
        ref="mapsSection"
        :title="$t('brawler.current-maps.title', { brawler: brawlerName })"
        v-observe-visibility="{
          callback: makeVisibilityCallback('current-maps'),
          once: true,
        }"
        lazy
      >
        <brawler-active-events
          :brawler-name="brawlerName"
        ></brawler-active-events>
      </b-page-section>

      <b-page-section
        ref="modesSection"
        :title="$t('brawler.modes.title', { brawler: brawlerName })"
        v-observe-visibility="{
          callback: makeVisibilityCallback('modes'),
          once: true,
        }"
        lazy
      >
        <brawler-modes-stats
          :brawler-name="brawlerName"
        ></brawler-modes-stats>

        <p class="mt-4 prose dark:prose-invert text-text/75">
          {{ $t('brawler.viable-info') }}
        </p>
      </b-page-section>

      <b-page-section
        ref="trendsSection"
        :title="$t('brawler.trends', { brawler: brawlerName })"
        v-observe-visibility="{
          callback: makeVisibilityCallback('trends'),
          once: true,
        }"
        lazy
      >
        <template v-slot:description>
          <p
            class="mt-4 prose dark:prose-invert text-text/75"
          >
            {{ $t('brawler.trend.description', { brawler: brawlerName }) }}
          </p>
        </template>

        <brawler-trends-card
          :brawler-name="brawlerName"
          class="mt-4"
        ></brawler-trends-card>
      </b-page-section>

      <b-page-section
        ref="trophiesSection"
        :title="$t('brawler.by-trophies', { brawler: brawlerName })"
        v-observe-visibility="{
          callback: makeVisibilityCallback('trophy-graphs'),
          once: true,
        }"
        lazy
      >
        <brawler-trophy-graphs
          :brawler-name="brawlerName"
        ></brawler-trophy-graphs>

        <p class="mt-4 prose dark:prose-invert text-text/75">
          {{ $t('brawler.disclaimer') }}
        </p>
      </b-page-section>

      <!--
        some Brawlers don't have skins, pins, voicelines etc.
        but until scrapedData is fetched, render the placeholders
      -->
      <b-page-section
        v-if="scrapedData == undefined || (scrapedData.skins != undefined && scrapedData.skins.length > 0)"
        ref="skinsSection"
        :title="$t('skin', 2)"
        v-observe-visibility="{
          callback: makeVisibilityCallback('skins'),
          once: true,
        }"
        lazy
      >
        <brawler-skins
          :scraped-data="scrapedData"
        ></brawler-skins>
      </b-page-section>

      <b-page-section
        v-if="scrapedData == undefined || (scrapedData.pins != undefined && scrapedData.pins.length > 0)"
        ref="pinsSection"
        :title="$t('pin', 2)"
        v-observe-visibility="{
          callback: makeVisibilityCallback('pins'),
          once: true,
        }"
        lazy
      >
        <brawler-pins
          :scraped-data="scrapedData"
        ></brawler-pins>
      </b-page-section>

      <b-page-section
        v-if="scrapedData == undefined || (scrapedData.voicelines != undefined && scrapedData.voicelines.length > 0)"
        ref="voicelineSection"
        :title="$t('voiceline', 2)"
        v-observe-visibility="{
          callback: makeVisibilityCallback('voicelines'),
          once: true,
        }"
        lazy
      >
        <brawler-voicelines
          :scraped-data="scrapedData"
        ></brawler-voicelines>
      </b-page-section>

      <b-page-section
        v-if="scrapedData == undefined || (scrapedData.history != undefined && scrapedData.history.length > 0)"
        :title="$t('balance-changes')"
        ref="balanceChangesSection"
        v-observe-visibility="{
          callback: makeVisibilityCallback('balance-changes'),
          once: true,
        }"
        lazy
      >
        <brawler-history
          :scraped-data="scrapedData"
        ></brawler-history>
      </b-page-section>
    </b-split-dashboard>

    <b-page-section
      v-observe-visibility="{
        callback: makeVisibilityCallback('attribution'),
        once: true,
      }"
      lazy
    >
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
import { computed, defineComponent, ref } from 'vue'
import { useAsync, useCacheHeaders, useConfig, useMeta } from '~/composables/compat'
import { ObserveVisibility } from 'vue-observe-visibility'
import { capitalizeWords } from '@/lib/util'
import { BSplitDashboard, BScrollSpy, BPageSection } from '@schneefux/klicker/components'
import { useTrackScroll } from '~/composables/gtag'
import { ScrapedBrawler } from '@/model/Web'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  directives: {
    ObserveVisibility,
  },
  components: {
    BScrollSpy,
    BSplitDashboard,
    BPageSection,
  },
  setup() {
    const i18n = useI18n()
    const $config = useConfig()

    const route = useRoute()
    const brawlerId = computed(() => {
      // FIXME when leaving the route, this computed property gets refreshed and brawler is undefined
      return route.params.brawler as string ?? ''
    })

    // TODO this does not restore '.' (Mr. P) or '-' (8-Bit)
    const brawlerName = computed(() => capitalizeWords(brawlerId.value.replace(/__/g, '. ').replace(/_/g, ' ')))

    useCacheHeaders()
    useMeta(() => {
      const description = i18n.t('tier-list.brawler.meta.description', { brawler: brawlerName.value })
      return {
        title: i18n.t('tier-list.brawler.meta.title', { brawler: brawlerName.value }),
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ]
      }
    })

    const { makeVisibilityCallback } = useTrackScroll('brawler')

    const scrapedData = useAsync<ScrapedBrawler>(() =>
      fetch(`${$config.mediaUrl}/brawlers/${brawlerId.value}/data.json`)
        .then(r => r.json()), `scraped-data-${brawlerId.value}`)

    const sectionRefs = {
      overviewSection: ref<InstanceType<typeof BPageSection>>(),
      accessorySection: ref<InstanceType<typeof BPageSection>>(),
      synergySection: ref<InstanceType<typeof BPageSection>>(),
      mapsSection: ref<InstanceType<typeof BPageSection>>(),
      modesSection: ref<InstanceType<typeof BPageSection>>(),
      trendsSection: ref<InstanceType<typeof BPageSection>>(),
      trophiesSection: ref<InstanceType<typeof BPageSection>>(),
      skinsSection: ref<InstanceType<typeof BPageSection>>(),
      pinsSection: ref<InstanceType<typeof BPageSection>>(),
      voicelineSection: ref<InstanceType<typeof BPageSection>>(),
      balanceChangesSection: ref<InstanceType<typeof BPageSection>>(),
    }

    const sections = computed(() => [{
      id: 'overview',
      title: i18n.t('brawler.overview'),
      element: sectionRefs.overviewSection.value?.$el,
    }, {
      id: 'accessory',
      title: i18n.t('brawler.accessories'),
      element: sectionRefs.accessorySection.value?.$el,
    }, {
      id: 'synergy',
      title: i18n.t('brawler.synergies-and-weaknesses-for', { brawler: brawlerName.value }),
      element: sectionRefs.synergySection.value?.$el,
    }, {
      id: 'maps',
      title: i18n.t('brawler.current-maps.title', { brawler: brawlerName.value }),
      element: sectionRefs.mapsSection.value?.$el,
    }, {
      id: 'modes',
      title: i18n.t('brawler.modes.title', { brawler: brawlerName.value }),
      element: sectionRefs.modesSection.value?.$el,
    }, {
      id: 'trends',
      title: i18n.t('brawler.trends', { brawler: brawlerName.value }),
      element: sectionRefs.trendsSection.value?.$el,
    }, {
      id: 'trophies',
      title: i18n.t('brawler.by-trophies', { brawler: brawlerName.value }),
      element: sectionRefs.trophiesSection.value?.$el,
    }, {
      id: 'skins',
      title: i18n.t('skin', 2),
      element: sectionRefs.skinsSection.value?.$el,
    }, {
      id: 'pins',
      title: i18n.t('pin', 2),
      element: sectionRefs.pinsSection.value?.$el,
    }, {
      id: 'voicelines',
      title: i18n.t('voiceline', 2),
      element: sectionRefs.voicelineSection.value?.$el,
    }, {
      id: 'balance',
      title: i18n.t('balance-changes'),
      element: sectionRefs.balanceChangesSection.value?.$el,
    }])

    return {
      brawlerId,
      brawlerName,
      makeVisibilityCallback,
      scrapedData,
      sections,
      ...sectionRefs,
    }
  },
})
</script>
