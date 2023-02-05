<template>
  <b-scrolling-list
    v-if="modes == undefined || modes.length > 0"
    :items="modes != undefined && events != undefined ? modes : []"
    :cell-rows="3"
    :cell-columns="3"
    key-id="id"
    render-placeholder
    @scroll.once="$emit('interact')"
  >
    <template v-slot:preview="mode">
      <media-img
        :path="`/modes/${mode.slug}/icon`"
        :alt="$t('mode.' + mode.id)"
        size="160"
        clazz="w-8 h-8 object-contain"
      ></media-img>
    </template>

    <template v-slot:item="mode">
      <player-mode-card
        :mode="mode.id"
        :battles="battles"
        :active-events="events!"
        :player-brawlers="player.brawlers"
        :player-tag="player.tag"
      ></player-mode-card>
    </template>
  </b-scrolling-list>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { Player, Battle } from '~/model/Api'
import { BScrollingList } from '@schneefux/klicker/components'
import { camelToKebab } from '~/lib/util'
import { useActiveEvents, useAllModes } from '@/composables/dimension-values'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: {
    BScrollingList,
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
    battles: {
      type: Array as PropType<Battle[]>,
      default: []
    },
  },
  setup() {
    const i18n = useI18n()
    const events = useActiveEvents()

    const modesIds = useAllModes()
    const modes = computed(() => {
      return modesIds.value?.map(m => ({
        id: m,
        slug: camelToKebab(m),
      })).sort((a, b) => {
        const aHasEvent = events.value?.some(e => e.mode == a.id)
        const bHasEvent = events.value?.some(e => e.mode == b.id)

        if (aHasEvent && !bHasEvent) {
          return -1
        }
        if (bHasEvent && !aHasEvent) {
          return +1
        }

        return (i18n.t('mode.' + a.id)).localeCompare(i18n.t('mode.' + b.id))
      })
    })

    return {
      modes,
      events,
    }
  },
})
</script>
