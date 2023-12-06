<template>
  <b-card
    :title="player.name"
    :loading="loading"
  >
    <template v-slot:content>
      <div class="flex flex-col items-center">
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
            <router-link
              :to="localePath(`/club/${row.club.tag.substring(1)}`)"
              @click.stop
            >
              <img
                :src="clubIcon"
                alt="Club"
                class="inline h-4 mr-1"
              >
              <span class="underline">{{ row.club.name }}</span>
            </router-link>
          </template>

          <template v-slot:trophies="{ value }">
            <img
              :src="trophyIcon"
              alt="Trophies"
              class="inline h-4 mr-1"
            >
            {{ value }}
          </template>

          <template v-slot:victories="{ value }">
            <img
              :src="victoryIcon"
              alt="3v3 Victories"
              class="inline h-4 mr-1"
            >
            {{ value }}
          </template>

          <template v-slot:expLevel="{ value }">
            <img
              :src="levelIcon"
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
    </template>

    <template v-slot:actions>
      <div class="flex flex-wrap gap-2">
        <b-button
          v-if="canEnableTracking"
          primary
          sm
          @click="enableTracking()"
        >{{ $t('profile.tracking.enable') }}</b-button>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, onMounted } from 'vue'
import { BKvTable } from '@schneefux/klicker/components'
import { Player } from "~/model/Api"
import { Row } from "@schneefux/klicker/components/ui/b-kv-table.vue"
import { useApi, useSentry } from '~/composables/compat'
import clubIcon from '~/assets/images/icon/club.png'
import trophyIcon from '~/assets/images/icon/trophy_optimized.png'
import victoryIcon from '~/assets/images/icon/victories.png'
import levelIcon from '~/assets/images/icon/level.png'
import { useI18n } from 'vue-i18n'
import { ProfileTrackingStatus } from '@/api/services/ProfileUpdaterService'

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
    const i18n = useI18n()
    const sentry = useSentry()

    const $api = useApi()
    const loading = ref(false)
    const trackingStatus = ref<ProfileTrackingStatus|undefined>(undefined)
    onMounted(async () => {
      try {
        trackingStatus.value = await $api.player.getTrackingStatus.query(props.player.tag.substring(1))
      } catch (e) {
        trackingStatus.value = 'inactive'
      }
    })

    const enableTracking = async () => {
      if (props.player == undefined) {
        return
      }
      loading.value = true
      try {
        trackingStatus.value = await $api.player.trackTag.mutate(props.player.tag.substring(1))
      } catch (err) {
        sentry.captureException(err)
      }
      loading.value = false
    }

    const canEnableTracking = computed(() => props.player.battles.length > 0
      && (trackingStatus.value == 'inactive' || trackingStatus.value == 'expired'))

    const rows = computed<Row[]>(() => {
      const rows: Row[] = []
      rows.push({
        slot: 'name',
        key: 'name',
        title: i18n.t('metric.name'),
      })

      rows.push({
        slot: 'tag',
        key: 'tag',
        title: i18n.t('metric.tag'),
      })

      if (props.player.club?.tag != undefined) {
        rows.push({
          slot: 'club',
          key: 'club.name',
          title: i18n.t('club'),
        })
      }

      rows.push({
        slot: 'trophies',
        key: 'trophies',
        title: i18n.t('metric.trophies'),
      })

      rows.push({
        slot: 'trophies',
        key: 'highestTrophies',
        title: i18n.t('metric.highestTrophies'),
      })

      rows.push({
        slot: 'expLevel',
        key: 'expLevel',
        title: i18n.t('metric.expLevel'),
      })

      rows.push({
        slot: 'victories',
        key: '3vs3Victories',
        title: i18n.t('metric.victories'),
      })

      rows.push({
        slot: 'soloVictories',
        key: 'soloVictories',
        title: i18n.t('metric.soloVictories'),
      })

      rows.push({
        slot: 'duoVictories',
        key: 'duoVictories',
        title: i18n.t('metric.duoVictories'),
      })

      if (trackingStatus.value != undefined) {
        rows.push({
          slot: 'tracking',
          key: 'tracking',
          title: i18n.t('profile.tracking.label'),
        })
      }

      return rows
    })

    const playerWithTrackingStatus = computed(() => ({
      ...props.player,
      tracking: trackingStatus.value,
    }))

    return {
      rows,
      loading,
      enableTracking,
      trackingStatus,
      canEnableTracking,
      playerWithTrackingStatus,
      clubIcon,
      trophyIcon,
      victoryIcon,
      levelIcon,
    }
  },
})
</script>
