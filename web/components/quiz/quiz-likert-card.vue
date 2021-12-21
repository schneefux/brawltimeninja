<template>
  <form
    v-if="page < pages"
    @submit.prevent="next"
  >
    <b-card
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
                  v-model.number="oejtsAnswers[question.id]"
                  :key="i"
                  :value="i"
                  :name="question.id"
                  :class="{
                    'w-6 h-6': (i == 1 || i == 5),
                    'w-5 h-5': (i == 2 || i == 4),
                    'w-4 h-4': (i == 3),
                  }"
                  required
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
    </b-card>
</form>
</template>

<script lang="ts">
import { computed, defineComponent, ref, wrapProperty } from '@nuxtjs/composition-api'
import { OEJTSEntry, oejtsScores } from '~/lib/oejts'

const useGtag = wrapProperty('$gtag', false)
export default defineComponent({
  props: {
    pageSize: {
      type: Number,
      default: 5
    },
  },
  setup(props, { emit }) {
    const oejtsAnswers = ref<Record<string, number>>({})
    const page = ref(0)

    const oejtsScoresWithIds = computed<(OEJTSEntry & { id: string })[]>(() => {
      return Object.entries(oejtsScores).map(([key, value]) => ({
        ...value,
        id: key,
      }))
    })

    const pages = computed(() => Math.ceil(oejtsScoresWithIds.value.length / props.pageSize))

    const gtag = useGtag()
    const next = () => {
      if (page.value == 0) {
        gtag.event('click', {
          'event_category': 'quiz',
          'event_label': 'start',
        })
      }

      page.value++

      gtag.event('step', {
        'event_category': 'oejts',
        'event_label': page.value.toString(),
        'value': page.value,
      })

      if (page.value == pages.value) {
        const result = Object.entries(oejtsAnswers.value).reduce((scores, [id, answer]) => ({
          ie: scores.ie + oejtsScores[id].ie * (answer - 2.5)/5,
          sn: scores.sn + oejtsScores[id].sn * (answer - 2.5)/5,
          ft: scores.ft + oejtsScores[id].ft * (answer - 2.5)/5,
          jp: scores.jp + oejtsScores[id].jp * (answer - 2.5)/5,
        }), { ie: 0, sn: 0, ft: 0, jp: 0 } as OEJTSEntry)

        emit('input', result)
      }
    }

    return {
      next,
      page,
      pages,
      oejtsAnswers,
      oejtsScores: oejtsScoresWithIds,
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
})
</script>
