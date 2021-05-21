<template>
  <page title="Brawl Stars Quiz">
    <quiz-cta-card
      v-if="!started"
      class="mx-auto"
    ></quiz-cta-card>

    <quiz-likert-card
      v-if="started && oejtsResult == undefined"
      class="mx-auto"
      @input="r => oejtsResult = r"
    ></quiz-likert-card>

    <quiz-result-card
      v-if="oejtsResult != undefined"
      :result="oejtsResult"
      class="mx-auto"
    ></quiz-result-card>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaInfo } from 'vue-meta'
import { OEJTSEntry } from '~/lib/oejts'

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
      oejtsResult: undefined as OEJTSEntry|undefined,
    }
  },
  computed: {
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
