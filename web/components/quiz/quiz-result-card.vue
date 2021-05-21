<template>
  <card
    title="Your Brawler Personality"
    lg
  >
    <div
      slot="content"
      class="flex flex-wrap"
    >
      <card
        elevation="2"
        class="w-1/2"
        dense
      >
        <div slot="content" class="grid grid-cols-[1rem,1fr,1rem] items-center text-center gap-x-1">
          <span class="mt-1 font-semibold col-span-3">{{ oejtsAbbreviation }}</span>
          <template v-for="(value, attr) in oejtsResult">
            <span :key="'l-' + attr">{{ attr[0].toUpperCase() }}</span>
            <div
              :key="'c-' + attr"
              class="h-2 bg-gray-100 rounded relative"
            >
              <div
                :style="{ 'width': Math.min(Math.abs(value)/2 * 50, 50) + '%' }"
                :class="['h-full bg-yellow-500 absolute', {
                  'left-1/2 rounded-r': value > 0,
                  'right-1/2 rounded-l': value < 0,
                }]"
              ></div>
            </div>
            <span :key="'r-' + attr">{{ attr[1].toUpperCase() }}</span>
          </template>
          <span class="mt-1 col-span-3 text-sm">{{ oejtsNames }}</span>
        </div>
      </card>

      <card
        elevation="2"
        class="w-1/2"
        dense
      >
        <div
          slot="content"
          class="flex flex-col items-center"
        >
          <span class="mt-1 font-semibold">{{ mostSimilarBrawler.name }}</span>
          <span class="whitespace-nowrap text-sm">({{ Math.round(mostSimilarBrawler.similarity * 100) }}% match)</span>
          <media-img
            clazz="h-24 m-2"
            :path="`/brawlers/${mostSimilarBrawler.id}/model`"
          ></media-img>
        </div>
      </card>

      <p class="text-sm mt-2 mb-1">
        This quiz tests the <a href="https://openpsychometrics.org/tests/OJTS/development/" rel="nofollow">Open Extended Jungian Type Scales</a> which is based on Jung's theory of psychological type.
        Brawler personalities have been voted by the community.
      </p>
    </div>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { brawlerScores, OEJTSEntry } from '~/lib/oejts'
import { brawlerId, capitalizeWords } from '~/lib/util'

function similarity(o1: OEJTSEntry, o2: OEJTSEntry) {
  // use scalar product because o1 and o2 are already -1 +1 normalized
  return (o1.ie * o2.ie + o1.sn * o2.sn + o1.ft * o2.ft + o1.jp * o2.jp) / 4
}

export default Vue.extend({
  props: {
    result: {
      type: Object as PropType<OEJTSEntry>,
      required: true
    },
  },
  computed: {
    oejtsAbbreviation(): string {
      if (this.result == undefined) {
        return ''
      }
      return Object.entries(this.result)
        .map(([name, number]) => number < -0.1 ? name[0] : number > 0.1 ? name[1] : 'x')
        .join('')
        .toUpperCase()
    },
    oejtsNames(): string {
      return this.oejtsAbbreviation.toLowerCase().split('')
        .filter(l => l != 'X')
        .map(l => ({
          i: 'Introversion',
          e: 'Extraversion',
          s: 'Sensing',
          n: 'Intuition',
          f: 'Feeling',
          t: 'Thinking',
          j: 'Judging',
          p: 'Perceiving',
        }[l])).join(', ')
    },
    mostSimilarBrawler(): { name: string, id: string, similarity: number, scores: OEJTSEntry }|undefined {
      const scores = Object.entries(brawlerScores)
        .map(([brawler, score]) => ({
          brawler,
          score,
          similarity: similarity(score, this.result),
        }))
        .sort((e1, e2) => e2.similarity - e1.similarity)
      return {
        id: brawlerId({ name: scores[0].brawler }),
        name: capitalizeWords(scores[0].brawler.toLowerCase()),
        similarity: Math.max(Math.min(scores[0].similarity, 1), 0),
        scores: scores[0].score,
      }
    },
  },
})
</script>
