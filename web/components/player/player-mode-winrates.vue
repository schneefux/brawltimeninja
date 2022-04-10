<template>
  <b-scrolling-list
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
        :active-events="events"
        :player-brawlers="player.brawlers"
        :player-tag="player.tag"
        :enable-klicker-stats="enableKlickerStats"
      ></player-mode-card>
    </template>
  </b-scrolling-list>
</template>

<script lang="ts">
import { defineComponent, PropType, useContext, useAsync, computed } from '@nuxtjs/composition-api'
import { Player, Battle } from '~/model/Api'
import { BScrollingList } from '@schneefux/klicker/components'
import { camelToKebab } from '~/lib/util'

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
    enableKlickerStats: {
      type: Boolean,
      required: true
    },
  },
  setup(props) {
    const { $klicker } = useContext()
    const events = useAsync(() => $klicker.queryActiveEvents(), `player-mode-winrates-events-${props.player.tag}`)

    const modesIds = useAsync(() => $klicker.queryAllModes(), `player-mode-winrates-modes-${props.player.tag}`)
    const modes = computed(() => modesIds.value?.map(m => ({
      id: m,
      slug: camelToKebab(m),
    })))

    return {
      modes,
      events,
    }
  },
})
</script>
