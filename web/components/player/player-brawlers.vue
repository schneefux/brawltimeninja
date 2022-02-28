<template>
  <div>
    <ul class="flex md:flex-wrap overflow-x-auto gap-x-1">
      <li
        v-for="id in Object.keys(player.brawlers)"
        :key="id"
      >
        <button
          @click="scrollTo(id)"
          class="w-8"
        >
          <media-img
            :path="'/brawlers/' + id + '/avatar'"
            size="160"
          ></media-img>
        </button>
      </li>
    </ul>

    <b-scrolling-dashboard class="mt-2">
      <c-dashboard-cell
        v-for="(brawler, id, index) in player.brawlers"
        :key="id"
        :ref="id"
        :rows="3"
        :columns="3"
        :lazy="index > 4"
        :ssr-key="`player-brawlers-${id}`"
      >
        <player-brawler-card
          :brawler="brawler"
          :player-tag="player.tag"
          :enable-klicker-stats="enableKlickerStats"
        ></player-brawler-card>
      </c-dashboard-cell>
    </b-scrolling-dashboard>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { Player } from '~/model/Api'
import { CDashboardCell } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    CDashboardCell,
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
    enableKlickerStats: {
      type: Boolean,
      required: true
    },
  },
  // TODO replace by function ref when migrating to Vue 3
  setup(props, { refs }) {
    const scrollTo = (id: string) => {
      const element = refs[id][0].$el as HTMLElement
      element.scrollIntoView({ behavior: 'smooth' })
    }

    return {
      scrollTo,
    }
  },
})
</script>
