<template>
  <b-card>
    <template v-slot:content><b-scrolling-list

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
          >{{ voiceline.description.replace(/&quot;/g, '') }}</q>
        </div>
      </template>
    </b-scrolling-list></template>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ScrapedBrawler } from '~/model/Web'
import { BScrollingList, BDashboardCell, BCard, BButton } from '@schneefux/klicker/components'
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons'
import { useContext } from '@nuxtjs/composition-api'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export default defineComponent({
  components: {
    BScrollingList,
    BDashboardCell,
    BButton,
    BCard,
    FontAwesomeIcon,
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
