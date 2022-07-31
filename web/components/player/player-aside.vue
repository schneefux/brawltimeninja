<template>
  <b-card
    :title="player.name"
    :loading="loading"
  >
    <div
      slot="content"
      class="flex flex-col items-center"
    >
      <media-img
        :path="`/avatars/${player.icon.id}`"
        :alt="player.name"
        size="200"
        clazz="w-32 h-32"
      ></media-img>

      <b-kv-table
        :rows="rows"
        :data="playerWithTrackingStatus"
        id-key="tag"
        class="mt-8 w-full"
      >
        <template v-slot:name="{ row }">
          <span
            :style="{
              color: '#' + (row.nameColor != undefined ? row.nameColor.slice('0x'.length) : 'ffffff'),
            }"
            class="font-semibold"
          >{{ row.name }}</span>
        </template>

        <template v-slot:tag="{ value }">
          <span>{{ value }}</span>
          <span
            v-if="value == 'V8LLPPC'"
            class="ml-1 text-xs text-yellow-400 border-2 border-yellow-400 rounded-lg px-1 font-black"
          >
            DEV
          </span>
        </template>

        <template v-slot:club="{ row }">
          <nuxt-link :to="localePath(`/club/${row.club.tag}`)">
            <img
              src="~/assets/images/icon/club.png"
              alt="Club"
              class="inline h-4 mr-1"
            >
            <span class="underline">{{ row.club.name }}</span>
          </nuxt-link>
        </template>

        <template v-slot:trophies="{ value }">
          <img
            src="~/assets/images/icon/trophy_optimized.png"
            alt="Trophies"
            class="inline h-4 mr-1"
          >
          {{ value }}
        </template>

        <template v-slot:victories="{ value }">
          <img
            src="~/assets/images/icon/victories.png"
            alt="3v3 Victories"
            class="inline h-4 mr-1"
          >
          {{ value }}
        </template>

        <template v-slot:expLevel="{ value }">
          <img
            src="~/assets/images/icon/level.png"
            alt="EXP Level"
            class="inline h-4 mr-1"
          >
          {{ value }}
        </template>

        <template v-slot:soloVictories="{ value }">
          <media-img
            path="/modes/solo-showdown/icon"
            alt="Solo Victories"
            size="160"
            clazz="inline h-4 mr-1"
          ></media-img>
          {{ value }}
        </template>

        <template v-slot:duoVictories="{ value }">
          <media-img
            path="/modes/duo-showdown/icon"
            alt="Duo Victories"
            size="160"
            clazz="inline h-4 mr-1"
          ></media-img>
          {{ value }}
        </template>

        <template v-slot:tracking="{ value }">
          {{ $t('profile.tracking.status.' + value) }}
        </template>
      </b-kv-table>
    </div>

    <div slot="actions" class="flex flex-wrap gap-2">
      <b-button
        v-if="canEnableTracking"
        primary
        sm
        @click="enableTracking()"
      >{{ $t('profile.tracking.enable') }}</b-button>

      <share-render-button
        :embed-url="`/embed/profile/${player.tag.replace('#', '')}`"
        :url="playerUrl"
        primary
        sm
        @share="sharepicTriggered"
      ></share-render-button>
    </div>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, useAsync, useContext, wrapProperty } from '@nuxtjs/composition-api'
import { BKvTable } from '@schneefux/klicker/components'
import { Player } from "~/model/Api"
import { Row } from "@schneefux/klicker/components/ui/b-kv-table.vue"

const useGtag = wrapProperty('$gtag', false)
export default defineComponent({
  components: {
    BKvTable,
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
  },
  setup(props) {
    const { localePath, i18n } = useContext()

    const { $api } = useContext()
    const loading = ref(false)
    const trackingStatus = useAsync(
      () => $api.query('player.getTrackingStatus', props.player.tag.substring(1)),
      `player-tracking-status-${props.player.tag.substring(1)}`)
    const enableTracking = async () => {
      if (props.player == undefined) {
        return
      }
      loading.value = true
      trackingStatus.value = await $api.mutation('player.trackTag', props.player.tag.substring(1))
      loading.value = false
    }

    const canEnableTracking = computed(() => props.player.battles.length > 0
      && (trackingStatus.value == 'inactive' || trackingStatus.value == 'expired'))

    const rows = computed<Row[]>(() => {
      const rows: Row[] = []
      rows.push({
        slot: 'name',
        key: 'name',
        title: i18n.t('metric.name') as string,
      })

      rows.push({
        slot: 'tag',
        key: 'tag',
        title: i18n.t('metric.tag') as string,
      })

      if (props.player.club?.tag != undefined) {
        rows.push({
          slot: 'club',
          key: 'club.name',
          title: i18n.t('club') as string,
        })
      }

      rows.push({
        slot: 'trophies',
        key: 'trophies',
        title: i18n.t('metric.trophies') as string,
      })

      rows.push({
        slot: 'trophies',
        key: 'highestTrophies',
        title: i18n.t('metric.highestTrophies') as string,
      })

      rows.push({
        slot: 'expLevel',
        key: 'expLevel',
        title: i18n.t('metric.expLevel') as string,
      })

      rows.push({
        slot: 'victories',
        key: '3vs3Victories',
        title: i18n.t('metric.victories') as string,
      })

      rows.push({
        slot: 'soloVictories',
        key: 'soloVictories',
        title: i18n.t('metric.soloVictories') as string,
      })

      rows.push({
        slot: 'duoVictories',
        key: 'duoVictories',
        title: i18n.t('metric.duoVictories') as string,
      })

      if (trackingStatus.value != undefined) {
        rows.push({
          slot: 'tracking',
          key: 'tracking',
          title: i18n.t('profile.tracking.label') as string,
        })
      }

      return rows
    })

    const playerUrl = computed(() => `${process.client ? window.location.origin : ''}${localePath('/player/' + props.player.tag)}?utm_source=share&utm_medium=image&utm_campaign=hype-stats`)
    const gtag = useGtag()
    const sharepicTriggered = () => gtag.event('click', {
      'event_category': 'profile',
      'event_label': 'share',
    })

    const playerWithTrackingStatus = computed(() => ({
      ...props.player,
      tracking: trackingStatus.value,
    }))

    return {
      rows,
      playerUrl,
      loading,
      enableTracking,
      trackingStatus,
      sharepicTriggered,
      canEnableTracking,
      playerWithTrackingStatus,
    }
  },
})
</script>
