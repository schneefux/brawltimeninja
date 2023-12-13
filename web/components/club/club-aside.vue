<template>
  <b-card :title="club.name">
    <template v-slot:content>
      <div class="flex flex-col items-center">
        <media-img
          :path="`/avatars/${club.badgeId}`"
          :alt="club.name"
          size="200"
          clazz="w-32 h-32"
        ></media-img>

        <b-kv-table
          :rows="rows"
          :data="clubData"
          id-key="tag"
          class="mt-8 w-full"
        >
          <template v-slot:trophies="{ value }">
            <img
              :src="trophyIcon"
              alt="Trophies"
              class="inline h-4 mr-1"
            >
            {{ value }}
          </template>

          <template v-slot:type="{ value }">
            {{ $t('club.type.' + value) }}
          </template>
        </b-kv-table>
      </div>
    </template>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, onMounted } from 'vue'
import { BCard, BKvTable } from '@schneefux/klicker/components'
import { Club } from "~/model/Api"
import { Row } from "@schneefux/klicker/components/ui/b-kv-table.vue"
import { useApi, useSentry } from '~/composables/compat'
import clubIcon from '~/assets/images/icon/club.png'
import trophyIcon from '~/assets/images/icon/trophy_optimized.png'
import victoryIcon from '~/assets/images/icon/victories.png'
import levelIcon from '~/assets/images/icon/level.png'
import { useI18n } from 'vue-i18n'
import { ProfileTrackingStatus } from '~/api/services/ProfileUpdaterService'

export default defineComponent({
  components: {
    BKvTable,
    BCard,
  },
  props: {
    club: {
      type: Object as PropType<Club>,
      required: true
    },
  },
  setup(props) {
    const i18n = useI18n()
    const sentry = useSentry()

    const $api = useApi()

    const clubData = computed(() => ({
      ...props.club,
      tag: '#' + props.club.tag,
      membersCount: props.club.members.length,
    }))

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

      rows.push({
        slot: 'trophies',
        key: 'trophies',
        title: i18n.t('metric.trophies'),
      })

      rows.push({
        slot: 'members',
        key: 'membersCount',
        title: i18n.t('metric.members'),
      })

      rows.push({
        slot: 'type',
        key: 'type',
        title: i18n.t('club.type'),
      })

      rows.push({
        slot: 'requiredTrophies',
        key: 'requiredTrophies',
        title: i18n.t('club.required-trophies'),
      })

      return rows
    })

    return {
      rows,
      clubData,
      clubIcon,
      trophyIcon,
      victoryIcon,
      levelIcon,
    }
  },
})
</script>
