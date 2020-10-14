<template>
  <div
    class="opacity-0 pointer-events-none fixed"
    style="width: 600px; height: 314px; bottom: -9999px; left: -9999px;"
  >
    <!-- aspect ratio 1.91 : 1 -->
    <!-- https://www.business2community.com/brandviews/presto-media/best-social-media-image-sizes-photo-sharing-every-major-social-network-01911894 -->
    <div
      class="card__content h-full w-full flex flex-wrap bg-gray-800"
      ref="sharepic"
    >
      <div class="w-full flex items-center">
        <img
          :src="`${mediaUrl}/avatars/${player.icon.id}.png?size=112`"
          class="w-14 mr-4"
        >
        <span class="text-4xl font-semibold relative text-secondary">
          {{ player.name }}
        </span>

        <div class="ml-auto flex items-center">
          <span class="mb-1 text-xl">Rating</span>
          <div
            class="ml-3 border-2 border-primary-light text-secondary font-bold text-4xl rounded-full h-12 w-12 text-center flex justify-center items-center"
          >
            <span class="mb-1">
              {{ accountRating }}
            </span>
          </div>
        </div>
      </div>

      <div class="w-1/2 pr-1">
        <p
          v-if="player.club.tag != undefined"
          class="w-full text-center mt-1 text-2xl"
        >
          <span class="mx-1 text-primary-light font-semibold">
            {{ player.club.name }}
          </span>
          Club
        </p>

        <div class="mt-1 flex text-3xl">
          <span class="w-24 text-right text-secondary font-bold">
            {{ Math.floor(player.hoursSpent) }}
          </span>
          <span class="ml-2">
            hours spent
          </span>
        </div>

        <div class="flex text-3xl">
          <span class="w-24 text-right text-secondary font-bold">
            {{ Math.floor(player.trophies) }}
          </span>
          <span class="ml-2">
            Trophies
          </span>
        </div>

        <div v-if="history.length > 1" class="mt-2 -ml-4 h-28 w-80">
          <history-graph
            :history="history"
          ></history-graph>
        </div>
      </div>

      <div class="w-1/2 pl-1">
        <div class="w-full mt-1 flex justify-center">
          <span class="text-3xl text-secondary font-bold">
            {{ Math.floor(winRate * 100) }}%
          </span>
          <div class="ml-2 flex flex-col justify-center items-center">
            <span class="text-xl">
              Win Rate
            </span>
            <span class="text-xs -mt-1">
              ({{ totalBattles }} Battles)
            </span>
          </div>
        </div>

        <div class="mt-1">
          <span class="text-lg">Best Brawlers:</span>

          <div class="mt-1 w-full flex flex-wrap">
            <div
              v-for="brawler in bestBrawlers.slice(0, 6)"
              :key="brawler.id"
              class="flex items-center w-32 h-12 mt-1 mx-1"
            >
              <div class="w-full h-full text-center">
                <img
                  :src="`${mediaUrl}/brawlers/${brawler.id}/model.png?size=96`"
                  class="w-auto h-full mx-auto"
                >
              </div>
              <div class="w-full flex flex-wrap justify-center">
                <div class="w-full flex items-center">
                  <img
                    src="~/assets/images/icon/trophy_optimized.png"
                    class="h-4 inline"
                  >
                  <span class="ml-1 text-lg font-bold">
                    {{ brawler.trophies }}
                  </span>
                </div>
                <span class="w-full -mt-1 capitalize text-center text-xs">
                  {{ brawler.name.toLowerCase() }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p class="-mr-5 -mt-1 text-xs text-right text-gray-400">
          brawltime.ninja
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import html2canvas from 'html2canvas'
import { Player } from '../model/Brawlstars'
import { TrophiesRow } from '../model/Clicker'
import { Brawler } from '../model/Api'

export default Vue.extend({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
    winRate: {
      type: Number,
      required: true
    },
    totalBattles: {
      type: Number,
      required: true
    },
    accountRating: {
      type: String,
      required: true
    },
    history: {
      type: Array as PropType<TrophiesRow[]>,
      required: true
    },
  },
  async mounted() {
    const content = this.$refs['sharepic'] as HTMLElement
    const canvas = await html2canvas(content, {
      // fix image loading from media domain
      useCORS: true,
      scale: 2,
    })

    const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((blob) => res(blob!)))
    const files = [new File([blob], 'brawltime-ninja.png', { type: blob.type })]
    if ((<any>navigator).canShare != undefined && (<any>navigator).canShare({ files })) {
      await navigator.share({
        files,
        url: window.location,
      } as any)
      this.$emit('done')
      this.$ga.event('profile', 'click', 'share')
    } else {
      let w = window.open('', '_blank')
      if (w == null) {
        // opening a window from async is blocked in Safari
        w = window
      }

      const image = new Image()
      image.src = canvas.toDataURL()
      w!.document.write(image.outerHTML)
    }

    //this.$emit('done')
    this.$ga.event('profile', 'click', 'share')
  },
  computed: {
    bestBrawlers(): Brawler[] {
      return Object.entries(this.player.brawlers)
        .map(([id, brawler]) => ({
          ...brawler,
          id,
        }))
        .sort((b1, b2) => b2.trophies - b1.trophies)
    },
    mediaUrl(): string {
      return process.env.mediaUrl!
    },
  },
})
</script>
