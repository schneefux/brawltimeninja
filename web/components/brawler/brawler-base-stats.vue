<template>
  <div>
    <b-page-section :title="$t('brawler.overview')">
      <b-scrolling-dashboard>
        <c-dashboard-cell
          :rows="3"
          :columns="4"
        >
          <b-card
            :title="$t('brawler.statistics', { brawler: brawlerName })"
            full-height
          >
            <div
              slot="content"
              class="h-full flex flex-col justify-between"
            >
              <p>
                <q
                  v-if="gamefileDescription != ''"
                  class="italic"
                >{{ gamefileDescription }}</q>
                <template v-if="generatedDescription != ''">
                  <br>
                  {{ generatedDescription }}
                </template>
              </p>
              <b-kv-table
                v-if="infoTable.length > 0"
                :rows="[{
                  // TODO refactor
                  title: infoTable[0][0],
                  key: 'level1',
                }, {
                  title: infoTable[1][0],
                  key: 'level10',
                }, {
                  title: infoTable[2][0],
                  key: 'speed',
                }]"
                :data="{
                  id: brawlerName,
                  level1: infoTable[0][1],
                  level10: infoTable[1][1],
                  speed: infoTable[2][1],
                }"
                id-key="id"
                class="mt-4"
              ></b-kv-table>
            </div>
          </b-card>
        </c-dashboard-cell>

        <c-dashboard-cell
          v-for="attack in ['main', 'super']"
          :key="attack"
          :rows="3"
          :columns="4"
          hide-empty
        >
          <template v-if="info != undefined">
            <brawler-attack-stats-card
              :attack="attack"
              :info="info"
            ></brawler-attack-stats-card>
          </template>
        </c-dashboard-cell>
      </b-scrolling-dashboard>
    </b-page-section>

    <b-page-section :title="$t('brawler.accessories')">
      <b-scrolling-dashboard>
        <brawler-starpower-stats
          v-observe-visibility="{
            callback: makeVisibilityCallback('starpowers'),
            once: true,
          }"
          :brawler-id="brawlerId"
          :brawler-name="brawlerName"
          kind="starpowers"
        ></brawler-starpower-stats>

        <brawler-starpower-stats
          v-observe-visibility="{
            callback: makeVisibilityCallback('gadgets'),
            once: true,
          }"
          :brawler-id="brawlerId"
          :brawler-name="brawlerName"
          kind="gadgets"
        ></brawler-starpower-stats>
      </b-scrolling-dashboard>
    </b-page-section>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, useAsync, useContext } from '@nuxtjs/composition-api'
import { BrawlerData } from '~/model/Media'
import { useTrackScroll } from '~/composables/gtag'
import { BScrollingDashboard, CDashboardCell, BKvTable, BPageSection } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BScrollingDashboard,
    CDashboardCell,
    BKvTable,
    BPageSection,
  },
  props: {
    brawlerId: {
      type: String,
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
  },
  setup(props) {
    const { $http, $config, i18n } = useContext()

    const info = useAsync(() => $http.$get<BrawlerData>(`${$config.mediaUrl}/brawlers/${props.brawlerId}/${i18n.locale}.json`).catch(() => undefined))

    const gamefileDescription = computed(() => info.value?.description || '')

    const generatedDescription = computed(() => {
      if (info.value == undefined) {
        return ''
      }

      return i18n.t('brawler.description', {
        brawler: props.brawlerName,
        rarity: i18n.t('rarity.' + info.value.rarity) as string,
        class: i18n.t('brawler.class.' + info.value.class) as string,
        unlockCondition: info.value.unlock == undefined ? i18n.t('brawler.unlock.boxes') as string :
          info.value.unlock == 0 ? i18n.t('brawler.unlock.start') as string :
          i18n.t('brawler.unlock.trophies', { trophies: info.value.unlock }) as string,
      }) as string
    })

    const infoTable = computed(() => {
      if (info.value == undefined) {
        return []
      }

      return [
        [ 'Health at Level 1', info.value.health.toString() ],
        [ 'Health at Level 10', Math.round(info.value.health * 1.4).toString() ],
        [ 'Speed', Math.round(info.value.speed * 100) / 100 + 'Tiles/s' ],
      ]
    })

    const { makeVisibilityCallback } = useTrackScroll('brawler')

    return {
      info,
      gamefileDescription,
      generatedDescription,
      infoTable,
      makeVisibilityCallback,
    }
  },
})
</script>
