<template>
  <page title="Brawl Stars Quiz">
    <quiz-cta-card
      v-if="!started"
    ></quiz-cta-card>

    <form
      v-if="started && page < pages"
      @submit.prevent="next"
    >
      <card
        :title="`Questions ${page+1}/${pages}`"
        subtitle="Where are you on this scale?"
        class="mt-2 mx-auto"
        lg
      >
        <ol
          slot="content"
          :start="page * pageSize + 1"
        >
          <li
            v-for="question in oejtsScores.slice(pageSize * page, pageSize * (page+1))"
            :key="question.id"
            class="my-3 "
          >
            <div class="flex justify-center items-center space-x-1 text-sm">
              <span class="!mr-2 flex-1 text-right">{{ $t('oejts.' + question.id + '.low') }}</span>
              <input
                v-for="i in 5"
                v-model="oejtsAnswers[question.id]"
                :key="i"
                :value="i"
                :name="question.id"
                type="radio"
                required
              >
              <span class="!ml-2 flex-1 text-left">{{ $t('oejts.' + question.id + '.high') }}</span>
            </div>
          </li>
        </ol>

        <b-button
          slot="actions"
          type="submit"
          primary
          md
        >Next</b-button>
      </card>
    </form>

    <card
      v-if="page == pages"
      title="Your Brawler Personality"
      class="mx-auto"
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
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaInfo } from 'vue-meta'
import { OEJTSEntry, oejtsScores, brawlerScores } from '~/lib/oejts'
import { brawlerId, capitalizeWords } from '~/lib/util'

function similarity(o1: OEJTSEntry, o2: OEJTSEntry) {
  // use scalar product because o1 and o2 are already -1 +1 normalized
  return (o1.ie * o2.ie + o1.sn * o2.sn + o1.ft * o2.ft + o1.jp * o2.jp) / 4
}

export default Vue.extend({
  head(): MetaInfo {
    // TODO
    // keyword: "brawl stars quiz", "brawl stars test", "brawler personality", "spirit brawler"
    const description = this.$tc('index.meta.description')

    return {
      title: this.$tc('index.meta.title'),
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ],
    }
  },
  meta: {
    title: 'Quiz',
    screen: 'profile',
  },
  middleware: ['cached'],
  data() {
    return {
      oejtsAnswers: {} as Record<string, number>,
      page: 0,
      pageSize: 5,
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
  },
  */
  computed: {
    oejtsScores(): (OEJTSEntry | { id: string })[] {
      return Object.entries(oejtsScores).map(([key, value]) => ({
        ...value,
        id: key,
      }))
    },
    oejtsResult(): OEJTSEntry {
      return Object.entries(this.oejtsAnswers).reduce((scores, [id, answer]) => ({
        ie: scores.ie + oejtsScores[id].ie * (answer - 2.5)/5,
        sn: scores.sn + oejtsScores[id].sn * (answer - 2.5)/5,
        ft: scores.ft + oejtsScores[id].ft * (answer - 2.5)/5,
        jp: scores.jp + oejtsScores[id].jp * (answer - 2.5)/5,
      }), { ie: 0, sn: 0, ft: 0, jp: 0 } as OEJTSEntry)
    },
    oejtsAbbreviation(): string {
      return Object.entries(this.oejtsResult)
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
    mostSimilarBrawler(): { name: string, id: string, similarity: number, scores: OEJTSEntry } {
      const scores = Object.entries(brawlerScores)
        .map(([brawler, score]) => ({
          brawler,
          score,
          similarity: similarity(score, this.oejtsResult),
        }))
        .sort((e1, e2) => e2.similarity - e1.similarity)
      return {
        id: brawlerId({ name: scores[0].brawler }),
        name: capitalizeWords(scores[0].brawler.toLowerCase()),
        similarity: Math.max(Math.min(scores[0].similarity, 1), 0),
        scores: scores[0].score,
      }
    },
    pages(): number {
      return Math.ceil(this.oejtsScores.length / this.pageSize)
    },
    started: {
      get(): boolean {
        return 'start' in this.$route.query
      },
      set(s: boolean) {
        this.$router.push({ query: { start: s ? '' : undefined } })
      }
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
      cookiesAllowed: (state: any) => state.cookiesAllowed as boolean,
    }),
  },
  fetchDelay: 0,
  methods: {
    next() {
      this.page++
      this.$gtag.event('step', {
        'event_category': 'quiz2',
        'event_label': this.page.toString(),
        'value': this.page,
      })
    },
    trackScroll(visible, element, section) {
      if (visible) {
        this.$gtag.event('scroll', {
          'event_category': 'home',
          'event_label': section,
        })
      }
    },
  },
})
</script>
