<template>
  <form
    v-if="page < pages"
    @submit.prevent="next"
  >
    <card
      :title="`Questions ${page+1}/${pages}`"
      :subtitle="$t('oejts.intro')"
      class="mt-2 mx-auto"
      lg
    >
      <div slot="content">
        <transition name="slide-fade" mode="out-in">
          <ol
            :key="page"
            :start="page * pageSize + 1"
          >
            <li
              v-for="question in oejtsScores.slice(pageSize * page, pageSize * (page + 1))"
              :key="question.id"
              class="my-3"
            >
              <div class="flex justify-center items-center space-x-1 text-sm">
                <span class="!mr-2 flex-1 text-right">{{ $t('oejts.' + question.id + '.low') }}</span>
                <b-radio
                  v-for="i in 5"
                  v-model="oejtsAnswers[question.id]"
                  :key="i"
                  :value="i"
                  :name="question.id"
                  primary
                ></b-radio>
                <span class="!ml-2 flex-1 text-left">{{ $t('oejts.' + question.id + '.high') }}</span>
              </div>
            </li>
          </ol>
        </transition>
      </div>

      <b-button
        slot="actions"
        type="submit"
        primary
        md
      >Next</b-button>
    </card>
</form>
</template>

<script lang="ts">
import Vue from 'vue'
import { OEJTSEntry, oejtsScores } from '~/lib/oejts'

export default Vue.extend({
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
    pages(): number {
      return Math.ceil(this.oejtsScores.length / this.pageSize)
    },
  },
  methods: {
    next() {
      this.page++
      this.$gtag.event('step', {
        'event_category': 'quiz2',
        'event_label': this.page.toString(),
        'value': this.page,
      })
      if (this.page == this.pages) {
        const result = Object.entries(this.oejtsAnswers).reduce((scores, [id, answer]) => ({
          ie: scores.ie + oejtsScores[id].ie * (answer - 2.5)/5,
          sn: scores.sn + oejtsScores[id].sn * (answer - 2.5)/5,
          ft: scores.ft + oejtsScores[id].ft * (answer - 2.5)/5,
          jp: scores.jp + oejtsScores[id].jp * (answer - 2.5)/5,
        }), { ie: 0, sn: 0, ft: 0, jp: 0 } as OEJTSEntry)

        this.$emit('input', result)
      }
    },
  },
})
</script>
