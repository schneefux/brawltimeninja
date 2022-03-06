<template>
  <form
    v-if="page < pages"
    @submit.prevent="next"
  >
    <b-card
      :title="$t('oejts.questions.page', { page: page + 1, total: pages })"
      :subtitle="$t('oejts.intro')"
      class="mt-2 max-w-lg"
    >
      <div slot="content">
        <transition name="slide-fade" mode="out-in">
          <quiz-likert
            :key="page"
            v-model="oejtsAnswers"
            :start="page * pageSize"
            :end="(page + 1) * pageSize"
          ></quiz-likert>
        </transition>
      </div>

      <b-button
        slot="actions"
        type="submit"
        primary
        md
      >{{ $t('action.next') }}</b-button>
    </b-card>
</form>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, wrapProperty } from '@nuxtjs/composition-api'
import { OEJTSEntry, oejtsScores } from '~/lib/oejts'

const useGtag = wrapProperty('$gtag', false)
export default defineComponent({
  props: {
    initialAnswers: {
      type: Object as PropType<Record<string, number>>,
      default: () => ({})
    },
    pageSize: {
      type: Number,
      default: 5
    },
  },
  setup(props, { emit }) {
    const oejtsQuestions = Object.keys(oejtsScores)

    const oejtsAnswers = ref<Record<string, number>>(props.initialAnswers)
    const page = ref(0)
    const pages = computed(() => Math.ceil(oejtsQuestions.length / props.pageSize))

    const gtag = useGtag()
    const next = () => {
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
      oejtsQuestions,
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
