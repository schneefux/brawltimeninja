<template>
  <page title="Brawl Stars Quiz">
    <transition name="slide-fade" mode="out-in">
      <quiz-cta-card
        v-if="step == 0"
        class="mx-auto"
      ></quiz-cta-card>

      <quiz-likert-card
        v-if="step == 1"
        class="mx-auto"
        @input="r => oejtsResult = r"
      ></quiz-likert-card>

      <quiz-result-card
        v-if="step == 2"
        :result="oejtsResult"
        class="mx-auto"
      ></quiz-result-card>
    </transition>
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
    step() {
      if (!('start' in this.$route.query)) {
        return 0
      }
      if (this.oejtsResult == undefined) {
        return 1
      }
      return 2
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
