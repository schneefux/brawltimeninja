<template>
  <page title="Brawl Stars Quiz">
    <card
      v-for="(_, question) in oejtsScores"
      :key="question"
      :title="$t('oejts.intro')"
      md
    >
      <div
        slot="content"
        class="my-2 flex justify-center"
      >
        <ul class="flex space-x-1 text-sm">
          <li class="mr-1 w-20 text-right">{{ $t('oejts.' + question + '.low') }}</li>
          <li
            v-for="i in 5"
            :key="i"
          >
            <input
              :value="i"
              type="radio"
              name="likert"
              class=""
            >
          </li>
          <li class="ml-1 w-20 text-left">{{ $t('oejts.' + question + '.high') }}</li>
        </ul>
      </div>
      <div
        slot="actions"
      >
        <b-button
          primary
          sm
        >Next</b-button>
      </div>
    </card>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaInfo } from 'vue-meta'
import { oejtsScores } from '~/lib/oejts'

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
      oejtsAnswers: [] as number[],
    }
  },
  computed: {
    oejtsScores() {
      return oejtsScores
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
      cookiesAllowed: (state: any) => state.cookiesAllowed as boolean,
    }),
  },
  fetchDelay: 0,
  async fetch() {
  },
  methods: {
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
