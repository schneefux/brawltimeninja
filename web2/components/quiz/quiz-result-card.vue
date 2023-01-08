<template>
  <b-card
    :title="$t('oejts.result.title')"
    class="max-w-lg"
  >
    <template v-slot:content><div
      
      class="flex flex-col gap-y-4"
    >
      <b-card
        :elevation="2"
        dense
      >
        <template v-slot:content><div
          
          class="flex flex-col items-center"
        >
          <span class="mt-1">{{ mostSimilarBrawler.name }}</span>
          <span class="whitespace-nowrap">{{ $t('oejts.result.percent-match', { percent: Math.round(mostSimilarBrawler.similarity * 100) }) }}</span>
          <media-img
            clazz="h-48 m-2"
            :path="`/brawlers/${mostSimilarBrawler.id}/model`"
          ></media-img>
        </div></template>
      </b-card>

      <b-card
        :elevation="2"
        dense
      >
        <template v-slot:content><oejts-table
          
          :oejts="mostSimilarBrawler.score"
        ></oejts-table></template>
      </b-card>

      <p class="mt-2 text-left text-sm">
        The Open Extended Jungian Type Scales is a psychological test based on theories by Carl Jung.
        The OEJTS measures four scales to calculate an overall type.
        There is no best type, all types are considered equal.
        Read more about the theory <b-button tag="a" xs dark href="https://simple.wikipedia.org/wiki/Myers-Briggs_Type_Indicator" target="_blank">on Wikipedia</b-button> and more about the OEJTS <b-button tag="a" xs dark href="https://openpsychometrics.org/tests/OJTS/development/" target="_blank">here</b-button>.
        Brawler personalities have been voted by the community.
      </p>
    </div></template>
    <template v-slot:actions><div
      
      class="mx-auto"
    >
      <share-render-button
        :embed-url="sharepicEmbedUrl"
        :url="quizRootUrl"
        :title="$t('player.quiz.result.title', { brawler: mostSimilarBrawler.name })"
        :text="$t('player.quiz.result.description', { brawler: mostSimilarBrawler.name })"
        class="inline-block mr-2"
        primary
        md
        @share="sharepicTriggered"
      ></share-render-button>
      <template v-slot:actions><b-button
        
        primary
        md
        @click="$emit('restart')"
      >{{ $t('action.restart') }}</b-button></template>
    </div></template>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, onMounted, useStore, useContext, wrapProperty } from 'vue'
import { brawlerScores, OEJTSEntry } from '~/lib/oejts'
import { brawlerId, capitalizeWords } from '~/lib/util'
import { event } from 'vue-gtag'

export interface QuizResult {
  score: OEJTSEntry
  id: string
  name: string
  similarity: number
}

function similarity(o1: OEJTSEntry, o2: OEJTSEntry) {
  // use scalar product because o1 and o2 are already -1 +1 normalized
  return (o1.ie * o2.ie + o1.sn * o2.sn + o1.ft * o2.ft + o1.jp * o2.jp) / 4
}

export default defineComponent({
  props: {
    result: {
      type: Object as PropType<OEJTSEntry>,
      required: true
    },
  },
  setup(props) {
    const { localePath } = useContext()
    const store = useStore()

    const mostSimilarBrawler = computed<QuizResult>(() => {
      const scores = Object.entries(brawlerScores)
        .map(([brawler, score]) => ({
          brawler,
          score,
          similarity: similarity(score, props.result),
        }))
        .sort((e1, e2) => e2.similarity - e1.similarity)
      return {
        id: brawlerId({ name: scores[0].brawler }),
        name: capitalizeWords(scores[0].brawler.toLowerCase()),
        similarity: Math.max(Math.min(scores[0].similarity, 1), 0),
        score: props.result,
      }
    })
    onMounted(() => store.commit('setPersonalityTestResult', mostSimilarBrawler.value?.name))

    const quizRootUrl = computed(() => (!import.meta.env.SSR ? window.location.origin : '')
      + localePath('/quiz')
      + '?utm_source=share&utm_medium=image&utm_campaign=quiz')
    const sharepicEmbedUrl = computed(() => {
      const params = new URLSearchParams({
        id: mostSimilarBrawler.value.id,
        name: mostSimilarBrawler.value.name,
        similarity: mostSimilarBrawler.value.similarity.toString(),
      })
      Object.entries(mostSimilarBrawler.value.score).forEach(
        ([attribute, value]) => params.append(attribute, value.toFixed(2)))
      return `/embed/quiz?${params.toString()}`
    })

    const sharepicTriggered = () => event('click', {
      'event_category': 'quiz',
      'event_label': 'share',
    })

    return {
      quizRootUrl,
      sharepicEmbedUrl,
      sharepicTriggered,
      mostSimilarBrawler,
    }
  },
  /*
  created() {
    for (const [brawler1, score1] of Object.entries(brawlerScores)) {
      for (const [brawler2, score2] of Object.entries(brawlerScores)) {
        if (brawler1 != brawler2 && similarity(score1, score2) > 0.95) {
          console.log(`${brawler1} and ${brawler2} are too similar (${similarity(score1, score2)})`)
        }
      }
    }
    console.log('done')
  },
  */
})
</script>
