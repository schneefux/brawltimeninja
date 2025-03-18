<template>
  <split-page :title="brawlerMetadata?.name">
    <template v-slot:aside-left>
      <b-scroll-spy
        id="sidenav"
        :sections="sections"
        toc-class="hidden lg:block"
        nav-class="top-14"
      ></b-scroll-spy>
    </template>

    <breadcrumbs
      id="breadcrumbs"
      :links="[{
        path: '/tier-list/brawler',
        name: $t('brawler', 2),
      }, {
        path: `/tier-list/brawler/${brawlerMetadata?.slug}`,
        name: brawlerMetadata?.name,
      }]"
      class="hidden md:flex"
    ></breadcrumbs>

    <b-page-section
      id="brawler"
      ref="brawlerSection"
      v-observe-visibility="{
        callback: makeVisibilityCallback('brawler'),
        once: true,
      }"
    >
      <div class="flex flex-wrap gap-8 items-center">
        <brawler-aside
          id="aside"
          :brawler-metadata="brawlerMetadata"
          class="flex-auto max-w-md"
        ></brawler-aside>

        <ad instream plain></ad>
      </div>
    </b-page-section>

    <b-page-section
      id="overview"
      ref="overviewSection"
      :title="$t('brawler.overview')"
      v-observe-visibility="{
        callback: makeVisibilityCallback('overview'),
        once: true,
      }"
    >
      <brawler-overview
        :brawler-id="brawlerMetadata?.slug"
        :scraped-data="scrapedData"
      ></brawler-overview>
    </b-page-section>

    <ad lazy></ad>

    <b-page-section
      id="accessory"
      ref="accessorySection"
      :title="$t('brawler.accessories')"
      v-observe-visibility="{
        callback: makeVisibilityCallback('accessories'),
        once: true,
      }"
      lazy
    >
      <brawler-accessories
        :brawler-metadata="brawlerMetadata"
        :scraped-data="scrapedData"
      ></brawler-accessories>
    </b-page-section>

    <b-page-section
      id="accessoryStats"
      ref="accessoryStatsSection"
      :title="$t('brawler.accessories.stats')"
      v-observe-visibility="{
        callback: makeVisibilityCallback('accessoriesStats'),
        once: true,
      }"
      lazy
    >
      <brawler-accessories-stats
        v-if="brawlerMetadata != undefined"
        :brawler-metadata="brawlerMetadata"
      ></brawler-accessories-stats>
    </b-page-section>

    <b-page-section
      id="synergy"
      ref="synergySection"
      :title="$t('brawler.synergies-and-weaknesses-for', { brawler: brawlerMetadata?.name })"
      v-observe-visibility="{
        callback: makeVisibilityCallback('synergies'),
        once: true,
      }"
      lazy
    >
      <brawler-synergies
        :brawler-metadata="brawlerMetadata"
      ></brawler-synergies>
    </b-page-section>

    <ad lazy></ad>

    <b-page-section
      id="maps"
      ref="mapsSection"
      :title="$t('brawler.current-maps.title', { brawler: brawlerMetadata?.name })"
      v-observe-visibility="{
        callback: makeVisibilityCallback('current-maps'),
        once: true,
      }"
      lazy
    >
      <brawler-active-events
        :brawler-metadata="brawlerMetadata"
      ></brawler-active-events>
    </b-page-section>

    <b-page-section
      id="modes"
      ref="modesSection"
      :title="$t('brawler.modes.title', { brawler: brawlerMetadata?.name })"
      v-observe-visibility="{
        callback: makeVisibilityCallback('modes'),
        once: true,
      }"
      lazy
    >
      <brawler-modes-stats
        :brawler-metadata="brawlerMetadata"
      ></brawler-modes-stats>

      <p class="mt-4 prose dark:prose-invert text-text/75">
        {{ $t('brawler.viable-info') }}
      </p>
    </b-page-section>

    <ad lazy></ad>

    <b-page-section
      id="trends"
      ref="trendsSection"
      :title="$t('brawler.trends', { brawler: brawlerMetadata?.name })"
      v-observe-visibility="{
        callback: makeVisibilityCallback('trends'),
        once: true,
      }"
      lazy
    >
      <template v-slot:description>
        <p class="mt-4 prose dark:prose-invert text-text/75">
          {{ $t('brawler.trend.description', { brawler: brawlerMetadata?.name }) }}
        </p>
      </template>

      <brawler-trends-card
        :brawler-brawlstars-id="brawlerMetadata?.brawlstarsId"
        class="mt-4"
      ></brawler-trends-card>
    </b-page-section>

    <b-page-section
      id="trophies"
      ref="trophiesSection"
      :title="$t('brawler.by-trophies', { brawler: brawlerMetadata?.name })"
      v-observe-visibility="{
        callback: makeVisibilityCallback('trophy-graphs'),
        once: true,
      }"
      lazy
    >
      <brawler-trophy-graphs
        :brawler-brawlstars-id="brawlerMetadata?.brawlstarsId"
      ></brawler-trophy-graphs>

      <p class="mt-4 prose dark:prose-invert text-text/75">
        {{ $t('brawler.disclaimer') }}
      </p>
    </b-page-section>

    <ad lazy></ad>

    <!--
      some Brawlers don't have skins, pins, voicelines etc.
      but until scrapedData is fetched, render the placeholders
    -->
    <b-page-section
      id="skins"
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

    <b-page-section lazy>
      <affiliate-card></affiliate-card>
    </b-page-section>

    <b-page-section
      id="pins"
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
      id="voicelines"
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

    <ad lazy></ad>

    <b-page-section
      id="balance-changes"
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

    <b-page-section
      id="attribution"
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
  </split-page>
</template>

<script lang="ts">
import { computed, defineComponent, useTemplateRef } from 'vue'
import { useAsync, useCacheHeaders, useConfig, useMeta } from '~/composables/compat'
import { ObserveVisibility } from 'vue-observe-visibility'
import { BScrollSpy, BPageSection } from '@schneefux/klicker/components'
import { useTrackScroll } from '~/composables/gtag'
import { ScrapedBrawler } from '~/model/Web'
import { useI18n } from 'vue-i18n'
import { useRouteParams } from '~/composables/route-params'
import { useAllBrawlers } from '~/composables/dimension-values'

export default defineComponent({
  directives: {
    ObserveVisibility,
  },
  components: {
    BScrollSpy,
    BPageSection,
  },
  setup() {
    const i18n = useI18n()
    const $config = useConfig()

    const routeParams = useRouteParams()
    const brawlerId = computed(() => routeParams.value!.brawler as string)
    const allBrawlers = useAllBrawlers()

    const brawlerMetadata = computed(() => allBrawlers.value.find(b => b.slug == brawlerId.value))

    useCacheHeaders()
    useMeta(() => ({
      title: i18n.t('tier-list.brawler.meta.title', { brawler: brawlerMetadata.value?.name }),
      meta: [
        { hid: 'description', name: 'description', content: i18n.t('tier-list.brawler.meta.description', { brawler: brawlerMetadata.value?.name }) },
      ]
    }))

    const { makeVisibilityCallback } = useTrackScroll('brawler')

    const scrapedData = useAsync<ScrapedBrawler>(() =>
      fetch(`${$config.mediaUrl}/brawlers/${brawlerId.value}/data.json`)
        .then(r => r.json())
        .catch(() => {
          console.error('Could not fetch scraped data for brawler', brawlerId.value)
          return null
        }), computed(() => `scraped-data-${brawlerId.value}`))

    const sectionRefs = {
      brawlerSection: useTemplateRef<InstanceType<typeof BPageSection>>('brawlerSection'),
      overviewSection: useTemplateRef<InstanceType<typeof BPageSection>>('overviewSection'),
      accessorySection: useTemplateRef<InstanceType<typeof BPageSection>>('accessorySection'),
      accessoryStatsSection: useTemplateRef<InstanceType<typeof BPageSection>>('accessoryStatsSection'),
      synergySection: useTemplateRef<InstanceType<typeof BPageSection>>('synergySection'),
      mapsSection: useTemplateRef<InstanceType<typeof BPageSection>>('mapsSection'),
      modesSection: useTemplateRef<InstanceType<typeof BPageSection>>('modesSection'),
      trendsSection: useTemplateRef<InstanceType<typeof BPageSection>>('trendsSection'),
      trophiesSection: useTemplateRef<InstanceType<typeof BPageSection>>('trophiesSection'),
      skinsSection: useTemplateRef<InstanceType<typeof BPageSection>>('skinsSection'),
      pinsSection: useTemplateRef<InstanceType<typeof BPageSection>>('pinsSection'),
      voicelineSection: useTemplateRef<InstanceType<typeof BPageSection>>('voicelineSection'),
      balanceChangesSection: useTemplateRef<InstanceType<typeof BPageSection>>('balanceChangesSection'),
    }

    const sections = computed(() => [{
      id: 'brawler',
      title: i18n.t('brawler'),
      element: sectionRefs.brawlerSection.value?.$el,
    }, {
      id: 'overview',
      title: i18n.t('brawler.overview'),
      element: sectionRefs.overviewSection.value?.$el,
    }, {
      id: 'accessory',
      title: i18n.t('brawler.accessories'),
      element: sectionRefs.accessorySection.value?.$el,
    }, {
      id: 'gear',
      title: i18n.t('brawler.accessories.stats'),
      element: sectionRefs.accessoryStatsSection.value?.$el,
    }, {
      id: 'synergy',
      title: i18n.t('brawler.synergies-and-weaknesses-for', { brawler: brawlerMetadata.value?.name }),
      element: sectionRefs.synergySection.value?.$el,
    }, {
      id: 'maps',
      title: i18n.t('brawler.current-maps.title', { brawler: brawlerMetadata.value?.name }),
      element: sectionRefs.mapsSection.value?.$el,
    }, {
      id: 'modes',
      title: i18n.t('brawler.modes.title', { brawler: brawlerMetadata.value?.name }),
      element: sectionRefs.modesSection.value?.$el,
    }, {
      id: 'trends',
      title: i18n.t('brawler.trends', { brawler: brawlerMetadata.value?.name }),
      element: sectionRefs.trendsSection.value?.$el,
    }, {
      id: 'trophies',
      title: i18n.t('brawler.by-trophies', { brawler: brawlerMetadata.value?.name }),
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
      brawlerMetadata,
      makeVisibilityCallback,
      scrapedData,
      sections,
    }
  },
})
</script>
