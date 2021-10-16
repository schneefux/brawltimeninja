<template>
  <b-card
    title="Your Brawler Personality"
    lg
  >
    <div slot="content">
      <b-card
        elevation="2"
        dense
      >
        <div
          slot="content"
          class="flex flex-col items-center"
        >
          <span class="mt-1 font-semibold">{{ mostSimilarBrawler.name }}</span>
          <span class="whitespace-nowrap">{{ Math.round(mostSimilarBrawler.similarity * 100) }}% match</span>
          <media-img
            clazz="h-48 m-2"
            :path="`/brawlers/${mostSimilarBrawler.id}/model`"
          ></media-img>
        </div>
      </b-card>

      <b-card
        elevation="2"
        dense
      >
        <div slot="content" class="grid grid-cols-[6rem,1fr,6rem] items-center text-center gap-x-1">
          <span class="mt-1 col-span-3 font-semibold">{{ oejtsAbbreviation }}</span>
          <template v-for="(value, attr) in result">
            <span :key="'l-' + attr" class="text-left">{{ oejtsMap[attr[0]] }}</span>
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
            <span :key="'r-' + attr" class="text-right">{{ oejtsMap[attr[1]] }}</span>
          </template>
        </div>
      </b-card>

      <p class="mt-2 text-left text-sm mb-1">
        The Open Extended Jungian Type Scales is a psychological test based on theories by Carl Jung.
        The OEJTS measures four scales to calculate an overall type.
        There is no best type, all types are considered equal.
        Read more about the theory <b-button tag="a" xs dark href="https://simple.wikipedia.org/wiki/Myers-Briggs_Type_Indicator" target="_blank">on Wikipedia</b-button> and more about the OEJTS <b-button tag="a" xs dark href="https://openpsychometrics.org/tests/OJTS/development/" target="_blank">here</b-button>.
        Brawler personalities have been voted by the community.
      </p>
    </div>
    <b-button
      slot="actions"
      class="mx-auto"
      primary
      md
      @click="$emit('restart')"
    >{{ $t('action.restart') }}</b-button>
  </b-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { brawlerScores, OEJTSEntry } from '~/lib/oejts'
import { brawlerId, capitalizeWords } from '~/lib/util'
import { mapMutations } from 'vuex'

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
  mounted() {
    this.setPersonalityTestResult(this.mostSimilarBrawler?.name)
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
    oejtsMap(): Record<string, string> {
      return {
        i: 'Introversion',
        e: 'Extraversion',
        s: 'Sensing',
        n: 'Intuition',
        f: 'Feeling',
        t: 'Thinking',
        j: 'Judging',
        p: 'Perceiving',
      }
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
  methods: {
    ...mapMutations({
      setPersonalityTestResult: 'setPersonalityTestResult',
    })
  },
})
</script>
