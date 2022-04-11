<template>
  <b-card>
    <b-scrolling-list
      slot="content"
      :items="scrapedData != undefined ? scrapedData.voicelines : []"
      :cell-columns="1"
      :render-at-least="5"
      key-id="name"
      render-placeholder
    >
      <template v-slot:item="voiceline">
        <div class="h-full flex flex-col items-center justify-between gap-y-2">
          <b-button
            class="leading-none"
            @click="play(voiceline)"
          >
            <font-awesome-icon
              :icon="faPlayCircle"
              class="text-3xl"
            ></font-awesome-icon>
          </b-button>
          <q
            v-if="voiceline.description != undefined"
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