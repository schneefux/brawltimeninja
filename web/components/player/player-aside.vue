<template>
  <b-card
    :title="player.name"
    :loading="loading"
  >
    <template
      v-if="player.tag == '#V8LLPPC'"
      v-slot:preview
    >
      <span class="text-primary-400 border-2 border-primary-400 rounded-full px-2 -my-1 font-black">
        DEV
      </span>
    </template>
    <template
      v-if="player.tag == '#8JVV9GVRQ'"
      v-slot:preview
    >
      <span class="text-transparent border-2 border-primary-400 rounded-full px-2 -my-1 bg-gradient-to-r from-primary-400 to-secondary-400 transition duration-300 ease-in-out bg-clip-text">
        SUPPORTER
      </span>
    </template>

    <template v-slot:content>
      <div class="flex flex-col md:flex-row gap-8">
        <media-img
          :path="`/avatars/${player.icon.id}`"
          :alt="player.name"
          size="200"
          clazz="w-32 h-32 mx-auto"
        ></media-img>

        <b-kv-table
          :rows="rows"
          :data="playerMerged"
          id-key="tag"
        >
          <template v-slot:name="{ row }">
            <span
              :style="{
                color: nameColorHex,
              }"
              class="font-semibold"
            >{{ row.name }}</span>
          </template>

          <template v-slot:tag="{ value }: { value: string }">
            <span>{{ value }}</span>
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

          <template v-slot:trophies="{ value }: { value: number }">
            <img
              :src="trophyIcon"
              alt="Trophies"
              class="inline h-4 mr-1"
            >
            {{ value }}
          </template>

          <template v-slot:accountCreationYear="{ value }: { value: number }">
            <img
              :src="calendarIcon"
              alt="Account creation year"
              class="inline h-4 mr-1"
            >
            {{ value }}
          </template>


          <template v-slot:victories="{ value }: { value: number }">
            <img
              :src="victoryIcon"
              alt="3v3 Victories"
              class="inline h-4 mr-1"
            >
            {{ value }}
          </template>

          <template v-slot:tier="{ value }: { value: LeagueRankWithPoints }">
            <img
              class="inline h-4"
              :src="rankIcons[value.league]"
            >
            {{ value.leagueSub }} ({{ value.points }})
          </template>

          <template v-slot:expLevel="{ value }: { value: number }">
            <img
              :src="levelIcon"
              alt="EXP Level"
              class="inline h-4 mr-1"
            >
            {{ value }}
          </template>

          <template v-slot:soloVictories="{ value }: { value: number }">
            <media-img
              path="/modes/solo-showdown/icon"
              alt="Solo Victories"
              size="160"
              clazz="inline h-4 mr-1"
            ></media-img>
            {{ value }}
          </template>

          <template v-slot:duoVictories="{ value }: { value: number }">
            <media-img
              path="/modes/duo-showdown/icon"
              alt="Duo Victories"
              size="160"
              clazz="inline h-4 mr-1"
            ></media-img>
            {{ value }}
          </template>

          <template v-slot:tracking="{ value }: { value: ProfileTrackingStatus }">
            {{ $t('profile.tracking.status.' + value) }}
          </template>
        </b-kv-table>
      </div>
    </template>

    <template v-slot:actions>
      <b-button
        v-if="canEnableTracking"
        primary
        sm
        @click="enableTracking()"
      >{{ $t('profile.tracking.enable') }}</b-button>
      <b-button
        v-if="canDisableTracking"
        primary
        sm
        @click="disableTracking()"
      >{{ $t('profile.tracking.disable') }}</b-button>
    </template>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, onMounted } from 'vue'
import { BCard, BKvTable } from '@schneefux/klicker/components'
import { Player, PlayerExtra, LeagueRankWithPoints } from "~/model/Api"
import { Row } from "@schneefux/klicker/components/ui/b-kv-table.vue"
import { useApi, useSentry } from '~/composables/compat'
import clubIcon from '~/assets/images/icon/club.png'
import trophyIcon from '~/assets/images/icon/trophy_optimized.png'
import victoryIcon from '~/assets/images/icon/victories.png'
import levelIcon from '~/assets/images/icon/level.png'
import calendarIcon from '~/assets/images/icon/icons8-calendar-100.png'
import { useI18n } from 'vue-i18n'
import { ProfileTrackingStatus } from '~/api/services/ProfileUpdaterService'
import { usePreferencesStore } from '~/stores/preferences'
import { rankIcons } from '~/lib/rank-icons'

export default defineComponent({
  components: {
    BKvTable,
    BCard,
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
    playerExtra: {
      type: Object as PropType<PlayerExtra>,
      default: undefined
    },
  },
  setup(props) {
    const i18n = useI18n()
    const sentry = useSentry()
    const preferencesStore = usePreferencesStore()

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
        const res = await $api.player.trackTag.mutate(props.player.tag.substring(1))
        if (res) {
          preferencesStore.addTrackedPlayer(props.player, res.deletionToken)
          trackingStatus.value = res.status
        }
      } catch (err) {
        sentry.captureException(err)
      }
      loading.value = false
    }

    const disableTracking = async () => {
      if (props.player == undefined || trackedPlayer.value == undefined) {
        return
      }
      loading.value = true
      try {
        const res = await $api.player.untrackTag.mutate({
          tag: props.player.tag.slice(1),
          deletionToken: trackedPlayer.value?.deletionToken,
        })
        if (res) {
          preferencesStore.removeTrackedPlayer(props.player.tag)
          trackingStatus.value = 'inactive'
        }
      } catch (err) {
        sentry.captureException(err)
      }
      loading.value = false
    }

    const canEnableTracking = computed(() => props.player.battles.length > 0
      && (trackingStatus.value == 'inactive' || trackingStatus.value == 'expired'))

    const trackedPlayer = computed(() => preferencesStore.trackedPlayers.find(p => p.tag == props.player.tag))
    const canDisableTracking = computed(() => trackingStatus.value == 'active' && trackedPlayer.value != undefined)

    const nameColorHex = computed(() => {
      const hex = props.player.nameColor?.slice('0x'.length)
      if (hex?.length == 6) {
        return '#' + hex
      }
      if (hex?.length == 8) {
        // 2024-12-17: name colors have an alpha channel, cut it off
        return '#' + hex.slice(-6)
      }
      return '#ffffff'
    })

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

      if (props.playerExtra?.accountCreationYear) {
        rows.push({
          slot: 'accountCreationYear',
          key: 'accountCreationYear',
          title: i18n.t('metric.accountCreationYear'),
        })
      }

      if (props.playerExtra?.rank?.points) {
        rows.push({
          slot: 'tier',
          key: 'rank',
          title: i18n.t('metric.rank'),
        })
      }

      if (props.playerExtra?.highestRank?.points) {
        rows.push({
          slot: 'tier',
          key: 'highestRank',
          title: i18n.t('metric.highestRank'),
        })
      }

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

    const playerMerged = computed(() => ({
      ...props.player,
      ...props.playerExtra,
      tracking: trackingStatus.value,
    }))

    return {
      rows,
      loading,
      enableTracking,
      disableTracking,
      trackingStatus,
      canEnableTracking,
      canDisableTracking,
      playerMerged,
      clubIcon,
      trophyIcon,
      victoryIcon,
      levelIcon,
      calendarIcon,
      rankIcons,
      nameColorHex,
    }
  },
})
</script>

<style lang="postcss" scoped>
.rainbow-border {
  background-image: linear-gradient(to left, violet, indigo, blue, green, yellow, orange, red);
    -webkit-background-clip: text;
    color: transparent;
}
</style>
