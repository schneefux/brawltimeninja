<template>
  <b-card>
    <b-scrolling-list
      v-if="scrapedData != undefined"
      slot="content"
      :items="scrapedData.voicelines"
      :cell-columns="1"
      key-id="name"
    >
      <template v-slot:item="voiceline">
        <div class="h-full flex flex-col items-center justify-between gap-y-2">
          <b-button
            @click="play(voiceline)"
            class="leading-none"
          >
            <font-awesome-icon
              class="text-3xl"
              :icon="faPlayCircle"
            ></font-awesome-icon>
          </b-button>
          <q
            class="text-center"
            :class="{
              'italic [quotes:none]': !voiceline.description.startsWith('&quot;'),
            }"
          >{{ voiceline.description.replaceAll('&quot;', '') }}</q>
        </div>
      </template>
    </b-scrolling-list>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType, useContext } from '@nuxtjs/composition-api'
import { ScrapedBrawler } from '~/model/Web'
import { BScrollingList, CDashboardCell, BCard, BButton } from '@schneefux/klicker/components'
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons'

export default defineComponent({
  components: {
    BScrollingList,
    CDashboardCell,
    BButton,
    BCard,
  },
  props: {
    scrapedData: {
      type: Object as PropType<ScrapedBrawler>,
      required: false
    },
  },
  setup() {
    const { $config } = useContext()

    const play = (voiceline: ScrapedBrawler['voicelines'][0]) => {
      const audio = new Audio($config.mediaUrl + voiceline.path)
      audio.play()
    }

    return {
      play,
      faPlayCircle,
    }
  },
})
</script>