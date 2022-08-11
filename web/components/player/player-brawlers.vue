<template>
  <b-scrolling-list
    :items="brawlers"
    :cell-rows="3"
    :cell-columns="3"
    key-id="brawlerId"
    render-placeholder
    @scroll.once="$emit('interact')"
  >
    <template v-slot:preview="brawler">
      <media-img
        :path="`/brawlers/${brawler.brawlerId}/avatar`"
        :alt="brawler.name"
        size="160"
        clazz="h-8 w-8 object-contain"
      ></media-img>
    </template>

    <template v-slot:item="brawler">
      <player-brawler-card
        :brawler="brawler"
        :player-tag="player.tag"
      ></player-brawler-card>
    </template>
  </b-scrolling-list>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api'
import { Player } from '~/model/Api'
import { BScrollingList } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BScrollingList,
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
  },
  setup(props) {
    const brawlers = computed(() => Object.entries(props.player.brawlers).map(([id, brawler]) => ({
      ...brawler,
      brawlerId: id,
    })))

    return {
      brawlers,
    }
  },
})
</script>
