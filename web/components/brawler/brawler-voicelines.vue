<template>
  <b-card>
    <template v-slot:content>
      <b-scrolling-list
        :items="scrapedData != undefined ? scrapedData.voicelines : []"
        :cell-columns="1"
        :render-at-least="5"
        key-id="name"
        render-placeholder
      >
        <template v-slot:item="voiceline">
          <div class="h-full flex flex-col items-center justify-between gap-y-2">
            <media-audio
              :path="voiceline.path.replace(/\.ogg/, '')"
              class="leading-none"
            ></media-audio>
            <q
              v-if="voiceline.description != undefined"
              class="text-center"
              :class="{
                'italic [quotes:none]': !voiceline.description.startsWith('&quot;'),
              }"
            >{{ voiceline.description.replace(/&quot;/g, '') }}</q>
          </div>
        </template>
      </b-scrolling-list>
    </template>
  </b-card>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { ScrapedBrawler } from '~/model/Web'
import { BScrollingList, BDashboardCell, BCard } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BScrollingList,
    BDashboardCell,
    BCard,
  },
  props: {
    scrapedData: {
      type: Object as PropType<ScrapedBrawler>,
      required: false
    },
  },
})
</script>
